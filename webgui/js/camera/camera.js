import { Config } from "../config.js"

export class Camera {
  constructor(videoEl) {
    this.video = videoEl;
    this.stream = null;
  }

  async start(deviceId = null) {
    const constraints = {
      video: deviceId
        ? { 
            deviceId: { exact: deviceId },
            width: {ideal: Config.cameraWidth},
            height: {ideal: Config.cameraHeight}, 
            aspectRatio: {ideal: Config.cameraWidth/Config.cameraHeight},
          }
        : { 
            width: {ideal: Config.cameraWidth},
            height: {ideal: Config.cameraHeight}, 
            aspectRatio: {ideal: Config.cameraWidth/Config.cameraHeight},
          },
      audio: false,
    };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject = this.stream;
    await this.video.play();
  }

  stop() {
    if (this.stream) {
      for (const t of this.stream.getTracks()) t.stop();
      this.stream = null;
    }
    this.video.srcObject = null;
  }

  async listDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput");
  }

  isRunning() { return this.stream !== null; }
}