export const Protocol = {
  // Browser -> ESP
  encodeDrive(left, right) {
    return `D ${left.toFixed(3)} ${right.toFixed(3)}`;
  },
  encodeStop() { return "S"; },
  encodePing() { return "P"; },

  encodeMessage(text) {
    const clean = String(text || "")
      .replace(/[\r\n]+/g, " ")       // no newlines on the wire
      .replace(/[^\x20-\x7E]/g, "")   // ASCII-printable only
      .slice(0, 64);                  // firmware buffer bound
    return `M ${clean}`;
  },

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
      case "N":
        // Everything after "N " is the message, spaces preserved.
        return { type: "network", text: line.trim().slice(2) };
      default:
        return { type: "unknown", raw: line };
    }
  },
};