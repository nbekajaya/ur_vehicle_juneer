# Serial port the ESP32 is connected to.
# Windows:   "COM5" (check Device Manager)
# Linux:     "/dev/ttyUSB0" or "/dev/ttyACM0"
# macOS:     "/dev/cu.usbserial-XXXX" (check `ls /dev/cu.*`)
SERIAL_PORT = "COM5"

# Must match the ESP firmware.
SERIAL_BAUD = 115200

# WebSocket server the browser connects to.
WS_HOST = "localhost"
WS_PORT = 8765

# Set to True to log every line sent and received.
# Useful for debugging. Turn off for production.
LOG_RAW = True

USE_MOCK_SERIAL = True   # True = no hardware. Flip to False when the ESP is ready.