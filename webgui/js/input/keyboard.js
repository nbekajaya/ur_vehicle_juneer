import { InputState } from "./input_state.js";

const keys = Object.create(null);

const MAG_RATE = 0.9;      // units per second
const MAG_MIN = 0;
const MAG_MAX = 1;

let currentMag = InputState.magnitude;
let lastMagTime = 0;

export function initKeyboard() {
  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Space") {
      InputState.estop = true;
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
    if (e.code === "Space") {
      InputState.estop = false;
      e.preventDefault();
    }
  });

  window.addEventListener("blur", () => {
    for (const k in keys) keys[k] = false;
    InputState.reset();
  });
}

export function pollKeyboard(now = performance.now()) {
  if (lastMagTime === 0) lastMagTime = now;
  const dt = Math.min((now - lastMagTime) / 1000, 0.1);
  lastMagTime = now;

  // Direction
  if (InputState.estop) {
    InputState.forward = 0;
    InputState.turn = 0;
  } else {
    const up    = keys["KeyW"];
    const down  = keys["KeyS"];
    const left  = keys["KeyA"];
    const right = keys["KeyD"];

    InputState.forward = (up ? 1 : 0) - (down ? 1 : 0);
    InputState.turn    = (right ? 1 : 0) - (left ? 1 : 0);
  }

  // Magnitude ramp
  const dec = keys["KeyJ"] ? 1 : 0;
  const inc = keys["KeyK"] ? 1 : 0;
  currentMag += (inc - dec) * MAG_RATE * dt;
  if (currentMag < MAG_MIN) currentMag = MAG_MIN;
  if (currentMag > MAG_MAX) currentMag = MAG_MAX;

  InputState.magnitude = currentMag;
}