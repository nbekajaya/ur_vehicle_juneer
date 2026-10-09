import { InputState } from "./input_state.js";

const keys = Object.create(null);

const MAG_RATE = 0.9;
const MAG_MIN = 0;
const MAG_MAX = 1;

let currentMag = InputState.magnitude;
let lastMagTime = 0;

function isEditable(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
}

function isTyping() {
  return isEditable(document.activeElement);
}

function clearKeys() {
  for (const k in keys) keys[k] = false;
}

export function initKeyboard() {
  window.addEventListener("keydown", (e) => {
    if (isEditable(e.target)) return;

    keys[e.code] = true;
    if (e.code === "Space") {
      InputState.estop = true;
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (isEditable(e.target)) return;

    keys[e.code] = false;
    if (e.code === "Space") {
      InputState.estop = false;
      e.preventDefault();
    }
  });

  window.addEventListener("blur", () => {
    clearKeys();
    InputState.reset();
  });

  // When focus moves into or out of a text field, clear held keys and
  // stop any current motion so the rover does not keep moving while you type.
  document.addEventListener("focusin", (e) => {
    if (isEditable(e.target)) {
      clearKeys();
      InputState.forward = 0;
      InputState.turn = 0;
      InputState.estop = false;
    }
  });

  document.addEventListener("focusout", () => {
    // Releasing focus can leave keyup events that never arrived. Clear
    // everything so nothing is stuck "held" after you click away.
    clearKeys();
  });
}

export function pollKeyboard(now = performance.now()) {
  if (lastMagTime === 0) lastMagTime = now;
  const dt = Math.min((now - lastMagTime) / 1000, 0.1);
  lastMagTime = now;

  if (isTyping()) {
    // While typing, the rover sees no directional input. Magnitude is
    // preserved (it is a throttle, not a key).
    InputState.forward = 0;
    InputState.turn = 0;
    InputState.estop = false;
    return;
  }

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

  const dec = keys["KeyJ"] ? 1 : 0;
  const inc = keys["KeyK"] ? 1 : 0;
  currentMag += (inc - dec) * MAG_RATE * dt;
  if (currentMag < MAG_MIN) currentMag = MAG_MIN;
  if (currentMag > MAG_MAX) currentMag = MAG_MAX;

  InputState.magnitude = currentMag;
}