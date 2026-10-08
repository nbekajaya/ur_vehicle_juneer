import { FilterState } from "../camera/filter_state.js";

export class FilterPanel {
  constructor(rootEl) {
    this.root = rootEl;
    this.inputs = {};
    this._build();
  }

  _build() {
    this._slider("brightness", 0.1, 3.0, 0.01);
    this._slider("contrast",   0.1, 3.0, 0.01);
    this._slider("saturation", 0.0, 3.0, 0.01);
    this._slider("hue",      -180, 180, 1);
    this._slider("blur",       0,   10, 0.1);

    const reset = document.createElement("button");
    reset.textContent = "Reset";
    reset.addEventListener("click", () => {
      FilterState.reset();
      this.syncFromState();
    });
    this.root.appendChild(reset);
  }

  _slider(key, min, max, step) {
    const label = document.createElement("label");
    label.textContent = key;

    const input = document.createElement("input");
    input.type = "range";
    input.min = min; input.max = max; input.step = step;
    input.value = FilterState[key];

    input.addEventListener("input", () => {
      FilterState[key] = parseFloat(input.value);
      // no pipeline.apply() — renderVision reads FilterState every frame
    });

    label.appendChild(input);
    this.root.appendChild(label);
    this.inputs[key] = input;
  }

  syncFromState() {
    for (const key in this.inputs) {
      this.inputs[key].value = FilterState[key];
    }
  }
}