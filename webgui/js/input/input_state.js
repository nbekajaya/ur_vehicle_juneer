export const InputState = {
  forward: 0,     // -1..1   from W/S
  turn: 0,        // -1..1   from A/D
  magnitude: 0.5, // 0..1    from J/K
  estop: false,

  reset() {
    this.forward = 0;
    this.turn = 0;
    // magnitude intentionally preserved — it is a throttle, not a keypress
    this.estop = false;
  },
};