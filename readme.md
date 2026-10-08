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
    │   └── apriltag-js/js/
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
3. connect from `webgui` at `https://localhost:8000` once its active!

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
1. Firmware to control Thrusters
2. Implement Wi-Fi Connection
3. AprilTag Filters and Params

# Attributions
`apriltag-js` from [AprilTag JS by AliAlimohamad](https://github.com/AliAliMohamad/apriltag-js)

DeepSeek Chat LOL!
