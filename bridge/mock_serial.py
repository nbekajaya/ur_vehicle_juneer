import threading
import time

import serial
import serial.tools.list_ports
import websockets

class MockSerial:
    """
    Stands in for a real ESP32-S3. Same interface as pyserial.Serial
    for the methods we use: readline(), write(), is_open, close().

    Emits N status lines like a real firmware would, plus ACKs for
    commands it receives. Responds to W (network credentials) with a
    scripted connection sequence.
    """

    def __init__(self, baud: int):
        self.baud = baud
        self.is_open = True
        self._incoming = bytearray()
        self._lock = threading.Lock()
        self._running = True

        self._tick = 0
        self._connected_ssid = None
        self._ip = None

        # Emit a startup line so the GUI's network panel is not empty
        # on first connect.
        self._enqueue("N mock esp32 ready")

        self._thread = threading.Thread(target=self._tick_loop, daemon=True)
        self._thread.start()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _enqueue(self, line: str) -> None:
        """Queue a line to be read back by the bridge as if from the ESP."""
        if not line.endswith("\n"):
            line += "\n"
        with self._lock:
            self._incoming.extend(line.encode())

    def _tick_loop(self):
        """Periodic status emission."""
        while self._running:
            time.sleep(5.0)
            self._tick += 1

            if self._connected_ssid:
                self._enqueue(
                    f"N heartbeat {self._tick} ip {self._ip} rssi "
                    f"{-40 - (self._tick % 20)}dBm"
                )
            else:
                self._enqueue(
                    f"N idle {self._tick} no network configured"
                )

    # ------------------------------------------------------------------
    # pyserial-compatible interface
    # ------------------------------------------------------------------

    def readline(self) -> bytes:
        deadline = time.time() + 1.0
        while time.time() < deadline:
            with self._lock:
                idx = self._incoming.find(b"\n")
                if idx >= 0:
                    line = bytes(self._incoming[:idx + 1])
                    del self._incoming[:idx + 1]
                    return line
            time.sleep(0.02)
        return b""

    def write(self, data: bytes) -> int:
        text = data.decode(errors="replace").strip()
        if not text:
            return len(data)

        parts = text.split(maxsplit=1)
        op = parts[0]
        rest = parts[1] if len(parts) > 1 else ""

        if op == "D":
            self._enqueue(f"ACK {text}")
        elif op == "S":
            self._enqueue("ACK S")
        elif op == "P":
            self._enqueue("PONG")
        # elif op == "M":
        #     shown = rest if rest else "(clear)"
        #     self._enqueue(f"ACK display {shown}")
        elif op == "M":
            # Simulate an async connection sequence in the background so
            # the WebSocket read loop does not block.
            self._simulate_wifi(rest)
        else:
            self._enqueue(f"ACK unknown {op}")

        return len(data)

    def _simulate_wifi(self, rest: str) -> None:
        """Parse 'ssid password' and emit a scripted connection sequence."""
        fields = rest.split(maxsplit=1)
        ssid = fields[0] if fields else ""
        # password is ignored in the mock

        def run():
            time.sleep(0.3)
            self._enqueue(f'N connecting to "{ssid}"...')
            time.sleep(1.2)

            if not ssid:
                self._enqueue("N error: no ssid")
                return

            # Pretend auth succeeds for most SSIDs. Fail the ones starting
            # with "bad" so you can test the failure path.
            if ssid.lower().startswith("bad"):
                self._enqueue(f'N auth failed for "{ssid}"')
                self._connected_ssid = None
                self._ip = None
                return

            # Deterministic fake IP from the SSID, so repeated connects
            # look stable.
            h = sum(ord(c) for c in ssid)
            self._ip = f"192.168.1.{(h % 200) + 10}"
            self._connected_ssid = ssid

            self._enqueue(f'N connected to "{ssid}"')
            time.sleep(0.4)
            self._enqueue(f"N ip {self._ip} gw 192.168.1.1")
            time.sleep(0.3)
            self._enqueue("N ready")

        threading.Thread(target=run, daemon=True).start()

    def close(self):
        self._running = False
        self.is_open = False