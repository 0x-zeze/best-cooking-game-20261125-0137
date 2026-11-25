import {
  INGREDIENTS,
  TEMP_MAX,
  TEMP_SLEW_PER_SEC,
  BURN_FULL_SECONDS,
} from './config.js';

const COLD_SPEED = 0.25;
const HOT_SPEED = 1.35;
const BURN_DECAY_SECONDS = BURN_FULL_SECONDS * 2;
const PERFECT_SHARE_THRESHOLD = 0.8;

function resolveIngredient(ing) {
  return typeof ing === 'string' ? INGREDIENTS[ing] : ing;
}

export function clampTemp(v) {
  return Math.max(0, Math.min(TEMP_MAX, v));
}

export function slewBurnerTemperature(burner, dt) {
  if (dt <= 0) return burner.temp;
  const target = clampTemp(burner.setpoint);
  const diff = target - burner.temp;
  const maxStep = TEMP_SLEW_PER_SEC * dt;
  burner.temp = Math.abs(diff) <= maxStep
    ? target
    : clampTemp(burner.temp + Math.sign(diff) * maxStep);
  return burner.temp;
}

export function bandZone(temp, ing) {
  const spec = resolveIngredient(ing);
  if (!spec || !spec.band) return 'cold';
  const [low, high] = spec.band;
  if (temp < low) return 'cold';
  if (temp > high) return 'hot';
  return 'band';
}

export function freshCookItem(ing) {
  const id = typeof ing === 'string' ? ing : ing.id;
  const spec = INGREDIENTS[id];
  const isRaw = Boolean(spec?.raw);
  return {
    id,
    state: isRaw ? 'ready' : 'cooking',
    progress: isRaw ? 100 : 0,
    burn: 0,
    bandProgress: 0,
    perfectShare: 0,
    perfect: false,
  };
}

export function cookItem(burner, dt) {
  const item = burner.item;
  if (!item || item.state !== 'cooking' || dt <= 0) {
    return { type: null, zone: null, ready: false, burnt: false, perfect: false };
  }

  const spec = resolveIngredient(item.id);
  if (!spec || !spec.cook) {
    return { type: null, zone: null, ready: false, burnt: false, perfect: false };
  }

  const zone = bandZone(burner.temp, spec);

  if (zone === 'hot') {
    item.burn = Math.min(1, item.burn + dt / BURN_FULL_SECONDS);
  } else {
    item.burn = Math.max(0, item.burn - dt / BURN_DECAY_SECONDS);
  }

  if (item.burn >= 1) {
    item.burn = 1;
    item.state = 'burnt';
    item.perfect = false;
    return { type: 'burnt', zone, ready: false, burnt: true, perfect: false };
  }

  const mult = zone === 'band' ? 1 : zone === 'cold' ? COLD_SPEED : HOT_SPEED;
  const gained = Math.min(100 - item.progress, (100 / spec.cook) * mult * dt);
  item.progress += gained;
  if (zone === 'band') item.bandProgress += gained;
  item.perfectShare = item.progress > 0 ? item.bandProgress / item.progress : 0;

  if (item.progress >= 100) {
    item.progress = 100;
    item.state = 'ready';
    item.perfect = item.perfectShare >= PERFECT_SHARE_THRESHOLD;
    return { type: 'ready', zone, ready: true, burnt: false, perfect: item.perfect };
  }

  return { type: null, zone, ready: false, burnt: false, perfect: false };
}

export function scorchReadyItem(burner, dt) {
  const item = burner.item;
  if (!item || item.state !== 'ready' || dt <= 0) {
    return { type: null, zone: null, burnt: false };
  }

  const spec = resolveIngredient(item.id);
  const zone = bandZone(burner.temp, spec);

  if (zone === 'hot') {
    item.burn = Math.min(1, item.burn + dt / BURN_FULL_SECONDS);
    if (item.burn >= 1) {
      item.burn = 1;
      item.state = 'burnt';
      item.perfect = false;
      return { type: 'burnt', zone, burnt: true };
    }
  } else {
    item.burn = Math.max(0, item.burn - dt / BURN_DECAY_SECONDS);
  }

  return { type: null, zone, burnt: false };
}
