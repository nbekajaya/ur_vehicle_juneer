export class StatusPanel {
  constructor() {
    this.transportEl = document.getElementById("transport-status");
    this.cameraEl    = document.getElementById("camera-status");
    this.visionEl    = document.getElementById("vision-status");
  }

  setTransport(s) { this.transportEl.textContent = "transport: " + s; }
  setCamera(s)    { this.cameraEl.textContent    = "camera: "    + s; }
  setVision(s)    { this.visionEl.textContent    = "vision: "    + s; }
}