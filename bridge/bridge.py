import asyncio
import logging
import threading
import time

import serial
import serial.tools.list_ports
import websockets

from mock_serial import MockSerial

from config import SERIAL_PORT, SERIAL_BAUD, WS_HOST, WS_PORT, LOG_RAW, USE_MOCK_SERIAL

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-5s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("bridge")


# --------------------------------------------------------------------------
# Serial side
# --------------------------------------------------------------------------

class SerialLink:
    """
    Owns the serial port.

    A dedicated OS thread does blocking reads and pushes raw byte chunks into
    an asyncio.Queue via call_soon_threadsafe. A coroutine drains the queue
    and broadcasts to all connected WebSocket clients.

    Writes from the WebSocket side are short and fast; they go straight to
    pyserial under a lock so concurrent clients don't interleave bytes.
    """

    def __init__(self, port: str, baud: int, loop: asyncio.AbstractEventLoop):
        self.port = port
        self.baud = baud
        self.loop = loop
        self.ser: serial.Serial | None = None
        self.clients: set[websockets.WebSocketServerProtocol] = set()
        self.queue: asyncio.Queue[bytes] = asyncio.Queue()
        self.write_lock = asyncio.Lock()
        self._reader_thread: threading.Thread | None = None
        self._broadcast_task: asyncio.Task | None = None
        self._running = False

    def start(self) -> None:
        """Open the serial port and start the reader thread. Raises on failure."""
        if USE_MOCK_SERIAL:
            self.ser = MockSerial(self.baud)
            log.info("serial MOCK mode (no hardware)")

        else:
            try:
                self.ser = serial.Serial(self.port, self.baud, timeout=1.0)
            except serial.SerialException as e:
                log.error(f"could not open {self.port}: {e}")
                log.error("available serial ports:")
                for p in serial.tools.list_ports.comports():
                    log.error(f"  {p.device}  ({p.description})")
                raise
            log.info(f"serial open: {self.port} @ {self.baud}")

        self._running = True
        self._reader_thread = threading.Thread(
            target=self._read_loop, daemon=True, name="serial-reader"
        )
        self._reader_thread.start()
        self._broadcast_task = self.loop.create_task(self._broadcast_loop())

    def _read_loop(self) -> None:
        """Runs in a plain OS thread. Reads lines and hands them to the loop."""
        while self._running:
            try:
                line = self.ser.readline()
            except Exception as e:
                log.error(f"serial read error: {e}")
                break
            if not line:
                continue
            # Hand off to the event loop thread-safely.
            self.loop.call_soon_threadsafe(self.queue.put_nowait, line)

    async def _broadcast_loop(self) -> None:
        """Runs on the event loop. Sends queued lines to every client."""
        while True:
            line = await self.queue.get()
            text = line.decode(errors="replace")
            if LOG_RAW:
                log.info(f"ESP -> PC  {text.rstrip()}")

            if not self.clients:
                continue

            # Fire-and-forget. Don't let one slow client stall the others.
            await asyncio.gather(
                *(c.send(text) for c in list(self.clients)),
                return_exceptions=True,
            )

    async def write(self, text: str) -> None:
        """Called from the WebSocket handler when the browser sends a line."""
        if self.ser is None or not self.ser.is_open:
            log.warning("write ignored: serial not open")
            return
        if LOG_RAW:
            log.info(f"PC  -> ESP {text.rstrip()}")
        async with self.write_lock:
            try:
                self.ser.write(text.encode())
            except Exception as e:
                log.error(f"serial write error: {e}")

    def add_client(self, ws) -> None:
        self.clients.add(ws)

    def remove_client(self, ws) -> None:
        self.clients.discard(ws)

    def stop(self) -> None:
        self._running = False
        if self.ser and self.ser.is_open:
            self.ser.close()
            log.info("serial closed")


# --------------------------------------------------------------------------
# WebSocket side
# --------------------------------------------------------------------------

async def ws_handler(websocket) -> None:
    """Handle one browser client for its entire lifetime."""
    peer = websocket.remote_address
    log.info(f"client connected: {peer}")

    serial_link.add_client(websocket)

    # Send a friendly ping on connect so the browser knows the pipe is live.
    # The ESP would send "PONG" if you ever route this through it.
    # For now, just log it locally.
    try:
        async for message in websocket:
            # message is whatever the browser sent. Forward unchanged.
            if isinstance(message, bytes):
                # Binary frames: decode as ASCII for serial.
                # Our protocol is text, so this should not happen.
                text = message.decode(errors="replace")
            else:
                text = message
            await serial_link.write(text)
    except websockets.ConnectionClosed:
        pass
    except Exception as e:
        log.error(f"client error: {e}")
    finally:
        serial_link.remove_client(websocket)
        log.info(f"client disconnected: {peer}")


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

async def main() -> None:
    global serial_link

    loop = asyncio.get_running_loop()

    serial_link = SerialLink(SERIAL_PORT, SERIAL_BAUD, loop)
    serial_link.start()

    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        log.info(f"websocket server listening on ws://{WS_HOST}:{WS_PORT}")
        log.info("waiting for browser client...")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("shutting down")
        if "serial_link" in globals():
            serial_link.stop()