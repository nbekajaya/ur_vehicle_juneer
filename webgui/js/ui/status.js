export class StatusPanel {
  constructor() {
    this.transportEl = document.getElementById("transport-status");
    this.cameraEl    = document.getElementById("camera-status");
    this.visionEl    = document.getElementById("vision-status");

    this._cameraState = "off";
    this._fps = null;
  }

  _set(el, label, value, state) {
    el.textContent = `${label}: ${value}`;
    el.dataset.state = state;
  }

  setTransport(s) { 
    const state = 
      s === "connected"    ? "ok"  :
      s === "disconnected" ? "bad" :
      s === "error"        ? "bad" : "warn";
    this._set(this.transportEl, "serial-bridge", s, state); 
  }

  setCamera(s) { 
    const state = 
      s === "running" ? "ok"  :
      s === "off"     ? "bad" :
      s === "error"   ? "bad" : "warn";

    this._cameraState = s;
    this._cameraState_ = state;

    if (s === "running" && this._fps !== null) {
      this._set(this.cameraEl, "camera", `${s} @ ${this._fps} fps`, state);
    } else {
      this._set(this.cameraEl, "camera", s, state);
    }
  }

  setFps(fps) {
    this._fps = fps;
    if (this._cameraState === "running") {
      this._set(
        this.cameraEl, "camera",
        `running @ ${fps} fps`,
        this._cameraState_
      );
    }
  }
  

  setVision(s) { 
    const state = 
      s === "ready" ? "ok"  :
      s === "error" ? "bad" :
      s === "idle"  ? "bad" : "warn";
    this._set(this.visionEl, "april-tag", s, state); 
  }
}