export class VisionPanel {
  constructor(el) { this.el = el; }

  update(detections) {
    if (!detections.length) {
      this.el.textContent = "No tags";
      return;
    }
    const ids = detections.map((d) => d.id).sort((a, b) => a - b);
    this.el.textContent = `${ids.length} tag(s): ${ids.join(", ")}`;
  }
}