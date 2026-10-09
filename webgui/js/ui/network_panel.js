import { Protocol } from "../protocol/protocol.js"

const OUT_MAX_LINES = 20;

export class NetworkPanel{
    constructor(rootEl, transport){
        this.transport = transport;
        this.connected = false;
        this.lines = [];

        this.wifi_input = rootEl.querySelector("#wifi-input");
        this.pass_input = rootEl.querySelector("#pass-input");
        this.input_button = rootEl.querySelector("#network-send");
        this.outputEl = rootEl.querySelector("#network-output");
        this.status = rootEl.querySelector("#network-status");

        this.pass_input.addEventListener("keydown", (e) => {
            if (e.key === "Enter"){
                e.preventDefault();
                this._send();
            }
        });

        this.input_button.addEventListener("click", () => this._send());

        this._update_enabled();
        this._render();
    }

    setConnected(connected) {
        this.connected = connected;
        this._update_enabled();
    }

    _update_enabled() {
        this.input_button.disabled = !this.connected;
        this.wifi_input.disabled = !this.connected;
        this.pass_input.disabled = !this.connected;

        if (!this.connected){
            this.status.textContent = "not connected";
        } else {
            this.status.textContent = "";
        }
    }

    _send() {
        if (!this.connected) { return };

        const raw_wifi_input = this.wifi_input.value;
        const raw_pass_input = this.pass_input.value;
        const joint_input = raw_wifi_input + " " + raw_pass_input;
        const line = Protocol.encodeMessage(joint_input);

        this.transport.send(line);

        const shown = joint_input.trim() ? `"${joint_input.trim()}"` : "(clear)";
        this.status.textContent = `sent ${shown}`;
    }

    push(text) {
        const stamp = new Date().toLocaleTimeString();
        this.lines.push({ stamp, text });
        if (this.lines.length > OUT_MAX_LINES) {
        this.lines.splice(0, this.lines.length - OUT_MAX_LINES);
        }
        this._render();
    }

    clear() {
        this.lines = [];
        this._render();
    }

    _render() {
        if (!this.lines.length) {
        this.outputEl.textContent = "no messages";
        this.outputEl.dataset.state = "empty";
        return;
        }
        this.outputEl.dataset.state = "active";
        this.outputEl.textContent = this.lines
        .map((l) => `[${l.stamp}] ${l.text}`)
        .join("\n");
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
}
