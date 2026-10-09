export class VectorDisplay {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext("2d");
    this.w = 0;
    this.h = 0;
  }

  _ensureSize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width  * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
    }
  }

  update(state) {
    this._ensureSize();
    const ctx = this.ctx;
    const w = this.w, h = this.h;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.38;

    ctx.clearRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - radius - 10, cy);
    ctx.lineTo(cx + radius + 10, cy);
    ctx.moveTo(cx, cy - radius - 10);
    ctx.lineTo(cx, cy + radius + 10);
    ctx.stroke();

    // Concentric magnitude rings at 0.5 and 1.0
    ctx.strokeStyle = "#1a1a1a";
    for (const f of [0.5, 1.0]) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * f, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = "#555";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+Y", cx, cy - radius - 18);
    ctx.fillText("-Y", cx, cy + radius + 18);
    ctx.fillText("+X", cx + radius + 16, cy);
    ctx.fillText("-X", cx - radius - 16, cy);

    // Vector: normalize direction, scale by magnitude
    const fwd = state.forward;
    const trn = state.turn;
    const dirLen = Math.hypot(fwd, trn);

    let vx = 0, vy = 0;
    if (dirLen > 0) {
      const ux = trn / dirLen;
      const uy = fwd / dirLen;
      vx = ux * state.magnitude * radius;
      vy = -uy * state.magnitude * radius;   // canvas +Y is down
    }

    const endX = cx + vx;
    const endY = cy + vy;
    const active = Math.hypot(vx, vy) > 1.5;

    if (active) {
      ctx.strokeStyle = "#00e676";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(vy, vx);
      const ah = 9;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - ah * Math.cos(angle - Math.PI / 6),
        endY - ah * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - ah * Math.cos(angle + Math.PI / 6),
        endY - ah * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    } 
    
    else {
      ctx.fillStyle = "#00e676";
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Magnitude readout
    ctx.fillStyle = active ? "#00e676" : "#666";
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`mag ${state.magnitude.toFixed(2)}`, 8, 8);
  }
}