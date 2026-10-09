# Structure
```
rover/
├── README.md
│
├── firmware/                     # ESP32-S3, PlatformIO, Arduino TODO
│   ├── platformio.ini
│   └── src/
│       ├── main.cpp
│       ├── config.h
│       ├── MotorDriver.h
│       ├── MotorDriver.cpp
│       ├── SerialProtocol.h
│       ├── SerialProtocol.cpp
│       ├── SafetyWatchdog.h
│       └── SafetyWatchdog.cpp
│
├── bridge/                       # Local WebSocket <-> serial bridge
│   ├── bridge.py
│   ├── mock_serial.py
│   ├── requirements.txt
│   └── config.py
│
└── webgui/                       # Browser GUI (static, served locally)
    ├── index.html
    │ 
    ├── css/
    │   └── style.css
    │   
    ├── assets/
    │   └── icons/
    │ 
    ├── vendor/
    │   └── apriltag-js/js/ (get from https://github.com/AliAliMohamad/apriltag-js)
    │ 
    └── js/
        ├── main.js
        ├── config.js
        │
        ├── camera/
        │   ├── camera.js
        │   └── filter_state.js
        │
        ├── vision/
        │   ├── detector.js
        │   └── detectors/
        │       └── apriltag_js.js
        │
        ├── transport/
        │   ├── serial_link.js
        │   └── ws_transport.js
        │
        ├── protocol/
        │   └── protocol.js
        │
        ├── input/
        │   ├── input_state.js
        │   └── keyboard.js
        │
        ├── control/
        │   ├── drive_mapper.js
        │   └── command_loop.js
        │
        └── ui/
            ├── status.js
            ├── filter_panel.js
            ├── vector_display.js
            └── vision_panel.js
```

# Abstract
Template for rover control with web GUI and serial communication to MUC via python websocket.

# Modules Guide
## `webgui`
Simple HTML, JS, and CSS. Self-explanatory

## `bridge`
Python websocket to serial conversion. 

**Important!** Change `config.py` according to your needs. Especially 
- `USE_MOCK_SERIAL`, this is for bridge testing.
- `SERIAL_PORT`, which port you're communicating with. See implementation in `bridge.SerialLink`.


# Quickstart
1. Open three terminals!

## `bridge` terminal
1. prep `bridge`
```
cd bridge
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
2. start `bridge`
```
python bridge.py
```
3. connect from `webgui` at `https://localhost:8000` once it's active!

## `webgui` terminal
1. prep `webgui`
```
cd webgui
```
2. check `js/configs.js` (optional)
3. serve
```
python -m http.serve 8000
```
4. access from `http://localhost:8000` and connect to `bridge`

## `firmware` terminal
1. TODO

# TODO
## `firmware`
1. ALL
## `webgui`
1. None so far
## `bridge`
1. None so far

# Attributions
`apriltag-js` from [AprilTag JS by AliAlimohamad](https://github.com/AliAliMohamad/apriltag-js)

DeepSeek Chat LOL!
