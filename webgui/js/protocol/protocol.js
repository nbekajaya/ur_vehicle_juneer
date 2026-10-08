export const Protocol = {
  // Browser -> ESP
  encodeDrive(left, right) {
    return `D ${left.toFixed(3)} ${right.toFixed(3)}`;
  },
  encodeStop() { return "S"; },
  encodePing() { return "P"; },

  // ESP -> Browser
  parseLine(line) {
    const parts = line.trim().split(/\s+/);
    switch (parts[0]) {
      case "T": {
        if (parts.length < 4) return { type: "unknown", raw: line };
        return {
          type: "telemetry",
          encL: Number(parts[1]),
          encR: Number(parts[2]),
          battery: Number(parts[3]),
        };
      }
      case "PONG":
        return { type: "pong" };
      default:
        return { type: "unknown", raw: line };
    }
  },
};