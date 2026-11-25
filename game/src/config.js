export const VIEW_W = 1280;
export const VIEW_H = 800;

export const SHIFT_SECONDS = 180;
export const RUSH_AT_SECONDS_LEFT = 60;
export const MAX_TICKETS = 4;
export const TICKET_PATIENCE = 55;
export const RUSH_TICKET_PATIENCE = 38;
export const SPAWN_EVERY = 15;
export const RUSH_SPAWN_EVERY = 9;

export const BURNER_COUNT = 4;
export const TEMP_MAX = 300;
export const TEMP_STEP = 10;
export const TEMP_SLEW_PER_SEC = 55;
export const BURN_FULL_SECONDS = 6;
export const PERFECT_BONUS = 25;
export const COMBO_STEP = 10;

export const INGREDIENTS = {
  bun:     { id: 'bun',     name: 'Bun',     band: [80, 110],  cook: 4, raw: false, color: '#e6b36a', dark: '#a3712e' },
  patty:   { id: 'patty',   name: 'Patty',   band: [160, 200], cook: 8, raw: false, color: '#8f4632', dark: '#542418' },
  cheese:  { id: 'cheese',  name: 'Cheese',  band: [90, 130],  cook: 5, raw: false, color: '#f5be3b', dark: '#b37d12' },
  tomato:  { id: 'tomato',  name: 'Tomato',  band: [110, 150], cook: 4, raw: false, color: '#dc4538', dark: '#8f2219' },
  onion:   { id: 'onion',   name: 'Onion',   band: [130, 170], cook: 5, raw: false, color: '#cf82b0', dark: '#7d3f64' },
  lettuce: { id: 'lettuce', name: 'Lettuce', band: null,       cook: 0, raw: true,  color: '#5fb857', dark: '#32702d' },
};

export const COUNTER_ORDER = ['bun', 'patty', 'cheese', 'tomato', 'onion', 'lettuce'];

export const RECIPES = [
  { id: 'classic', name: 'Classic Ember', items: ['bun', 'patty', 'cheese'], base: 100 },
  { id: 'garden',  name: 'Garden Stack',  items: ['bun', 'lettuce', 'tomato', 'cheese'], base: 120 },
  { id: 'double',  name: 'Smoky Double',  items: ['bun', 'patty', 'patty', 'onion'], base: 140 },
  { id: 'melt',    name: 'Meltdown',      items: ['bun', 'cheese', 'cheese', 'tomato'], base: 130 },
];

export const LAYOUT = {
  hud:     { x: 0,    y: 0,   w: 1280, h: 58 },
  tickets: { x: 16,   y: 66,  w: 296,  h: 104, gap: 12 },
  stove:   { x: 16,   y: 184, w: 304,  h: 268, gap: 12 },
  bins:    { x: 16,   y: 470, w: 118,  h: 128, gap: 10 },
  plate:   { x: 800,  y: 470, w: 464,  h: 128 },
  serve:   { x: 1120, y: 612, w: 144,  h: 44 },
  footer:  { x: 0,    y: 664, w: 1280, h: 136 },
};

export function ticketRect(i) {
  const { x, y, w, h, gap } = LAYOUT.tickets;
  return { x: x + i * (w + gap), y, w, h };
}

export function burnerRect(i) {
  const { x, y, w, h, gap } = LAYOUT.stove;
  return { x: x + i * (w + gap), y, w, h };
}

export function burnerPan(i) {
  const r = burnerRect(i);
  return { cx: r.x + 118, cy: r.y + 118, r: 62 };
}

export function burnerGauge(i) {
  const r = burnerRect(i);
  return { x: r.x + 208, y: r.y + 44, w: 26, h: 150 };
}

export function burnerMinus(i) {
  const r = burnerRect(i);
  return { x: r.x + 14, y: r.y + 214, w: 52, h: 38 };
}

export function burnerPlus(i) {
  const r = burnerRect(i);
  return { x: r.x + 238, y: r.y + 214, w: 52, h: 38 };
}

export function binRect(i) {
  const { x, y, w, h, gap } = LAYOUT.bins;
  return { x: x + i * (w + gap), y, w, h };
}

export function plateRect() {
  return { ...LAYOUT.plate };
}

export function serveRect() {
  return { ...LAYOUT.serve };
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function pointInCircle(px, py, c) {
  const dx = px - c.cx;
  const dy = py - c.cy;
  return dx * dx + dy * dy <= c.r * c.r;
}
