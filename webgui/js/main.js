import { Config } from "./config.js";
import { createTransport } from "./transport/serial_link.js";
import { Protocol } from "./protocol/protocol.js";

import { Camera } from "./camera/camera.js";
import { FilterState, buildFilterString } from "./camera/filter_state.js";

import { createDetector } from "./vision/detector.js";

import { initKeyboard, pollKeyboard } from "./input/keyboard.js";
import { CommandLoop } from "./control/command_loop.js";

import { StatusPanel } from "./ui/status.js";
import { FilterPanel } from "./ui/filter_panel.js";
import { VisionPanel } from "./ui/vision_panel.js";

import { VectorDisplay } from "./ui/vector_display.js";
import { InputState } from "./input/input_state.js";

// --- DOM refs ---
const videoEl       = document.getElementById("camera");
const displayCanvas = document.getElementById("displayCanvas");
const displayCtx    = displayCanvas.getContext("2d")
const filterRoot    = document.getElementById("filters");
const visionListEl  = document.getElementById("vision-list");

// Vision State
const processingCanvas = document.createElement("canvas");
const processingCtx = processingCanvas.getContext("2d", { willReadFrequently: true });

let detector = null;
let visionReady = false;
let detecting = false;
let lastDetection = 0;
let latestDetections = [];

// --- init ---
const status = new StatusPanel();
const visionPanel = new VisionPanel(visionListEl);

const transport = createTransport(Config);
const commandLoop = new CommandLoop(transport, Config);

const camera = new Camera(videoEl);
const filterPanel = new FilterPanel(filterRoot, FilterState);

(async () => {
  status.setVision("loading...");
  try {
    detector = await createDetector("apriltag", {
      family: Config.tagFamily,
      hammingDist: Config.hammingDist,
      params: Config.detectorParams,
    });
    visionReady = true;
    status.setVision("ready");
  } catch (e) {
    console.error("detector init failed", e);
    status.setVision("error");
  }
})();

console.log("main.js loaded");

// canvas sizing
function ensureProcessingSize() {
  if (!videoEl.videoWidth) return;
  const aspect = videoEl.videoWidth / videoEl.videoHeight;
  const w = Config.detectionWidth;
  const h = Math.round(w / aspect);
  if (processingCanvas.width !== w || processingCanvas.height !== h) {
    processingCanvas.width = w;
    processingCanvas.height = h;
  }
};

function ensureDisplaySize() {
  if (!videoEl.videoWidth) return;
  if (displayCanvas.width !== videoEl.videoWidth) {
    displayCanvas.width = videoEl.videoWidth;
    displayCanvas.height = videoEl.videoHeight;
  }
};

function maybeStartDetection(now) {
  if (!visionReady || !camera.isRunning()) return;
  if (detecting) return;
  if (now - lastDetection < 1000 / Config.detectionHz) return;
  if (!videoEl.videoWidth) return;

  lastDetection = now;
  detecting = true;

  ensureProcessingSize();
  processingCtx.drawImage(
    videoEl, 0, 0, processingCanvas.width, processingCanvas.height
  );
  const frame = processingCtx.getImageData(
    0, 0, processingCanvas.width, processingCanvas.height
  );

  detector
    .detect(frame, frame.width, frame.height)
    .then((dets) => {
      latestDetections = dets;
      visionPanel.update(dets);
    })
    .catch((e) => console.error("detection failed", e))
    .finally(() => { detecting = false; });
}

// --- Transport wiring ---
transport.onStatus((s) => status.setTransport(s));

function renderVision() {
  if (!camera.isRunning() || !videoEl.videoWidth) return;

  ensureDisplaySize();
  displayCtx.save();
  displayCtx.filter = buildFilterString(FilterState);
  displayCtx.drawImage(videoEl, 0, 0, displayCanvas.width, displayCanvas.height);
  displayCtx.restore();

  if (latestDetections.length && processingCanvas.width) {
    const sx = displayCanvas.width / processingCanvas.width;
    const sy = displayCanvas.height / processingCanvas.height;
    drawDetections(displayCtx, latestDetections, sx, sy, Config.overlay);
  }
};

const vectorDisplay = new VectorDisplay(
  document.getElementById("vector-display")
);

// --- Input ---
initKeyboard();

// --- Main render loop ---
function frame(now) {
  pollKeyboard();
  vectorDisplay.update(InputState);
  renderVision();
  maybeStartDetection(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// --- Buttons ---
document.getElementById("btn-connect").addEventListener("click", async () => {
  try {
    await transport.connect();
    commandLoop.start();
    document.getElementById("btn-connect").disabled = true;
    document.getElementById("btn-disconnect").disabled = false;
  } catch (e) {
    console.error("connect failed", e);
    status.setTransport("error");
  }
});

document.getElementById("btn-disconnect").addEventListener("click", () => {
  commandLoop.sendStop();
  commandLoop.stop();
  transport.disconnect();
  document.getElementById("btn-connect").disabled = false;
  document.getElementById("btn-disconnect").disabled = true;
});

document.getElementById("btn-camera").addEventListener("click", async () => {
  try {
    if (!camera.isRunning()) {
      await camera.start();
      status.setCamera("running");
      document.getElementById("btn-camera").textContent = "Stop Camera";
    } else {
      camera.stop();
      status.setCamera("off");
      document.getElementById("btn-camera").textContent = "Start Camera";
      latestDetections = [];
      visionPanel.update([]);
      if (displayCanvas.width) {
        displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
      }
    }
  } catch (e) {
    console.error("camera failed", e);
    status.setCamera("error");
  }
});

document.getElementById("btn-estop").addEventListener("click", () => {
  commandLoop.sendStop();
});

// --- Cleanup ---
window.addEventListener("beforeunload", () => {
  commandLoop.sendStop();
  transport.disconnect();
  camera.stop();
});