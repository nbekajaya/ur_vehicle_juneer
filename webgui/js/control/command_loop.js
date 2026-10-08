import { InputState } from "../input/input_state.js";
import { mapToWheels } from "./drive_mapper.js";
import { Protocol } from "../protocol/protocol.js";

export class CommandLoop {
  constructor(transport, config) {
    this.transport = transport;
    this.rateHz = config.commandRateHz || 20;
    this.maxSpeed = config.maxSpeed ?? 1.0;
    this.timer = null;
    this.lastSent = null;
  }

  start() {
    if (this.timer) return;
    const intervalMs = 1000 / this.rateHz;
    this.timer = setInterval(() => this._tick(), intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  sendStop() {
    if (this.transport.isConnected()) {
      this.transport.send(Protocol.encodeStop());
      this.lastSent = "S";
    }
  }

  _sendStopIfNeeded() {
    if (this.lastSent !== "S") {
      this.transport.send(Protocol.encodeStop());
      this.lastSent = "S";
    }
  }

  _tick() {
    if (!this.transport.isConnected()) return;

    if (InputState.estop) {
      this._sendStopIfNeeded();
      return;
    }

    const { left, right } = mapToWheels(InputState, this.maxSpeed);

    if (Math.abs(left) < 0.001 && Math.abs(right) < 0.001) {
      this._sendStopIfNeeded();
      return;
    }

    const line = Protocol.encodeDrive(left, right);
    if (line !== this.lastSent) {
      this.transport.send(line);
      this.lastSent = line;
    }
  }
}