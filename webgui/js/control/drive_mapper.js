function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function mapToWheels(state, maxSpeed = 1.0) {
  if (state.estop) return { left: 0, right: 0 };

  const f = state.forward * state.magnitude;
  const t = state.turn    * state.magnitude;

  let left  = f + t;
  let right = f - t;

  left  = clamp(left,  -1, 1) * maxSpeed;
  right = clamp(right, -1, 1) * maxSpeed;

  return { left, right };
}