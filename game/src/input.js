import {
  VIEW_W,
  VIEW_H,
  COUNTER_ORDER,
  BURNER_COUNT,
  TEMP_STEP,
  burnerRect,
  burnerPan,
  burnerGauge,
  burnerMinus,
  burnerPlus,
  binRect,
  plateRect,
  serveRect,
  pointInRect,
  pointInCircle,
} from './config.js';
import { clampTemp } from './heat.js';
import {
  clearPlate,
  placeIngredient,
  servePlate,
  takeFromBurner,
} from './state.js';
import { playSound } from './audio.js';

const RESTART_BTN = { x: 540, y: 560, w: 200, h: 60 };

function adjustSetpoint(state, burnerIndex, delta) {
  const burner = state.burners[burnerIndex];
  if (!burner) return;
  burner.setpoint = clampTemp(burner.setpoint + delta);
  playSound('click', state.muted);
}

export function handleClick(state, canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const x = ((clientX - rect.left) / rect.width) * VIEW_W;
  const y = ((clientY - rect.top) / rect.height) * VIEW_H;

  if (state.screen === 'title') {
    state.screen = 'play';
    playSound('click', state.muted);
    return 'start';
  }

  if (state.screen === 'over') {
    if (pointInRect(x, y, RESTART_BTN)) {
      playSound('click', state.muted);
      return 'restart';
    }
    return null;
  }

  if (state.screen !== 'play' || state.paused) return null;

  if (pointInRect(x, y, serveRect())) {
    const res = servePlate(state);
    playSound(res ? 'serve' : 'click', state.muted);
    return res ? 'serve' : null;
  }

  for (let i = 0; i < BURNER_COUNT; i++) {
    if (pointInCircle(x, y, burnerPan(i))) {
      state.selectedBurner = i;
      const res = takeFromBurner(state, i);
      if (res === 'plated') playSound('place', state.muted);
      else if (res === 'trashed') playSound('burnt', state.muted);
      else playSound('click', state.muted);
      return res;
    }

    if (pointInRect(x, y, burnerMinus(i))) {
      state.selectedBurner = i;
      adjustSetpoint(state, i, -TEMP_STEP);
      return 'temp-down';
    }

    if (pointInRect(x, y, burnerPlus(i))) {
      state.selectedBurner = i;
      adjustSetpoint(state, i, TEMP_STEP);
      return 'temp-up';
    }

    if (pointInRect(x, y, burnerGauge(i)) || pointInRect(x, y, burnerRect(i))) {
      state.selectedBurner = i;
      playSound('click', state.muted);
      return 'select-burner';
    }
  }

  for (let i = 0; i < COUNTER_ORDER.length; i++) {
    if (pointInRect(x, y, binRect(i))) {
      const res = placeIngredient(state, COUNTER_ORDER[i]);
      if (res === 'burner-busy') {
        state.toast = `Burner ${state.selectedBurner + 1} is busy!`;
        state.toastUntil = state.elapsed + 2;
        playSound('click', state.muted);
      } else if (res === 'cooking' || res === 'plated') {
        playSound('place', state.muted);
      }
      return res;
    }
  }

  if (pointInRect(x, y, plateRect())) {
    if (state.plate.length > 0) {
      clearPlate(state);
      playSound('click', state.muted);
      return 'clear-plate';
    }
    return null;
  }

  return null;
}

export function handleKey(state, key, restart) {
  if (key === 'm' || key === 'M') {
    state.muted = !state.muted;
    return 'mute';
  }

  if (state.screen === 'title') {
    if (key === ' ' || key === 'Space' || key === 'Enter') {
      state.screen = 'play';
      playSound('click', state.muted);
      return 'start';
    }
    return null;
  }

  if (state.screen === 'over') {
    if (key === 'r' || key === 'R' || key === 'Enter') {
      playSound('click', state.muted);
      if (typeof restart === 'function') restart();
      return 'restart';
    }
    return null;
  }

  if (state.screen !== 'play') return null;

  if (key === 'p' || key === 'P') {
    state.paused = !state.paused;
    playSound('click', state.muted);
    return 'pause';
  }

  if (key === 'r' || key === 'R') {
    playSound('click', state.muted);
    if (typeof restart === 'function') restart();
    return 'restart';
  }

  if (state.paused) return null;

  if (key >= '1' && key <= String(BURNER_COUNT)) {
    state.selectedBurner = Number(key) - 1;
    playSound('click', state.muted);
    return 'select-burner';
  }

  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    adjustSetpoint(state, state.selectedBurner, TEMP_STEP);
    return 'temp-up';
  }

  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    adjustSetpoint(state, state.selectedBurner, -TEMP_STEP);
    return 'temp-down';
  }

  if (key === ' ' || key === 'Space') {
    const res = servePlate(state);
    playSound(res ? 'serve' : 'click', state.muted);
    return res ? 'serve' : null;
  }

  if (key === 't' || key === 'T') {
    const burner = state.burners[state.selectedBurner];
    if (!burner || !burner.item) return null;
    if (burner.item.state === 'burnt') {
      takeFromBurner(state, state.selectedBurner);
    } else {
      burner.item = null;
      state.combo = 0;
      state.toast = `Trashed Burner ${state.selectedBurner + 1}`;
      state.toastUntil = state.elapsed + 2;
    }
    playSound('burnt', state.muted);
    return 'trash';
  }

  return null;
}
