import { VIEW_W, VIEW_H } from './config.js';
import { handleClick, handleKey } from './input.js';
import { drawGame } from './render.js';
import { stageShot } from './shots.js';
import { newGameState, tickGame } from './state.js';
import { playSound } from './audio.js';

const SOUND_EVENTS = new Set(['ready', 'perfect', 'burnt', 'expire', 'rush']);
const PREVENT_KEYS = new Set([' ', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

canvas.width = VIEW_W;
canvas.height = VIEW_H;

let state = null;
let lastTime = 0;
let lastStatus = '';

function announce() {
  if (!statusEl || !state) return;
  let text = '';
  if (state.screen === 'title') {
    text = 'Ember Line title screen. Click or press Space or Enter to start.';
  } else if (state.screen === 'over') {
    text = `Shift over. Final score ${state.score}, served ${state.served}. Press R or click Play Again.`;
  } else if (state.paused) {
    text = 'Game paused. Press P to resume.';
  } else {
    text = `Playing Ember Line. Score ${state.score}, served ${state.served}, combo x${state.combo}, ${Math.ceil(state.timeLeft)} seconds left.`;
  }
  if (text !== lastStatus) {
    statusEl.textContent = text;
    lastStatus = text;
  }
}

function restart() {
  state = newGameState();
  state.screen = 'play';
  announce();
}

function frame(now) {
  const dt = lastTime ? Math.min(0.05, Math.max(0, (now - lastTime) / 1000)) : 0;
  lastTime = now;

  const events = tickGame(state, dt);
  for (const ev of events) {
    if (SOUND_EVENTS.has(ev)) playSound(ev, state.muted);
  }

  drawGame(ctx, state);
  announce();
  requestAnimationFrame(frame);
}

function init() {
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (shot !== null) {
    state = stageShot(shot);
    drawGame(ctx, state);
    announce();
    requestAnimationFrame(frame);
    return;
  }

  state = newGameState();
  canvas.addEventListener('pointerdown', (e) => {
    const res = handleClick(state, canvas, e.clientX, e.clientY);
    if (res === 'restart') restart();
    announce();
  });

  window.addEventListener('keydown', (e) => {
    if (PREVENT_KEYS.has(e.key)) e.preventDefault();
    handleKey(state, e.key, restart);
    announce();
  });

  drawGame(ctx, state);
  announce();
  requestAnimationFrame(frame);
}

init();
