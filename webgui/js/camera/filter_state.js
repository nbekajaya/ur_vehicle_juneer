const DEFAULTS = {
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
  hue: 0,
  blur: 0,
};

export const FilterState = {
  ...DEFAULTS,
  reset() { Object.assign(this, DEFAULTS); },
};

export function buildFilterString(s) {
  const parts = [];
  if (s.brightness !== 1) parts.push(`brightness(${s.brightness})`);
  if (s.contrast   !== 1) parts.push(`contrast(${s.contrast})`);
  if (s.saturation !== 1) parts.push(`saturate(${s.saturation})`);
  if (s.hue        !== 0) parts.push(`hue-rotate(${s.hue}deg)`);
  if (s.blur       !== 0) parts.push(`blur(${s.blur}px)`);
  return parts.length ? parts.join(" ") : "none";
}