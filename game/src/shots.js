import { freshCookItem } from './heat.js';
import { makeTicket, newGameState } from './state.js';

function basePlayState(elapsed, timeLeft) {
  const state = newGameState();
  state.screen = 'play';
  state.frozen = true;
  state.elapsed = elapsed;
  state.timeLeft = timeLeft;
  return state;
}

function ticketAt(recipeIndex, patience) {
  const t = makeTicket(recipeIndex);
  t.patience = patience;
  return t;
}

function putOnBurner(state, i, ing, setpoint, temp, progress, burn = 0, perfectShare = 0.95) {
  const burner = state.burners[i];
  burner.setpoint = setpoint;
  burner.temp = temp;
  const item = freshCookItem(ing);
  item.progress = progress;
  item.burn = burn;
  item.perfectShare = perfectShare;
  item.bandProgress = progress * perfectShare;
  if (burn >= 1) {
    item.state = 'burnt';
    item.perfect = false;
  } else if (progress >= 100) {
    item.state = 'ready';
    item.perfect = perfectShare >= 0.8;
  }
  burner.item = item;
}

function stageCover() {
  const state = basePlayState(108, 72);
  state.score = 845;
  state.coins = 845;
  state.served = 5;
  state.combo = 5;
  state.bestCombo = 5;
  state.tickets = [
    ticketAt(0, 30),
    ticketAt(1, 22),
    ticketAt(2, 9),
    ticketAt(3, 47),
  ];
  putOnBurner(state, 0, 'patty', 180, 182, 62, 0, 0.95);
  putOnBurner(state, 1, 'cheese', 110, 112, 80, 0, 0.95);
  putOnBurner(state, 2, 'tomato', 130, 132, 100, 0, 0.95);
  putOnBurner(state, 3, 'onion', 150, 148, 38, 0, 0.95);
  state.plate = ['bun', 'patty'];
  state.platePerfectCount = 1;
  state.passDish = { name: 'Garden Stack', items: ['bun', 'lettuce', 'tomato', 'cheese'] };
  state.passUntil = 999;
  state.toast = 'PERFECT tomato! +25 — plate it and serve';
  state.toastUntil = 999;
  return state;
}

function stageHeat() {
  const state = basePlayState(85, 95);
  state.score = 620;
  state.coins = 620;
  state.served = 4;
  state.combo = 3;
  state.bestCombo = 3;
  state.selectedBurner = 1;
  state.tickets = [
    ticketAt(0, 36),
    ticketAt(2, 28),
  ];
  putOnBurner(state, 0, 'patty', 180, 181, 100, 0, 0.95);
  putOnBurner(state, 1, 'cheese', 200, 245, 55, 0.72, 0.35);
  putOnBurner(state, 2, 'bun', 95, 70, 20, 0, 0.5);
  putOnBurner(state, 3, 'onion', 150, 152, 64, 0, 0.95);
  state.plate = ['bun'];
  state.toast = 'PERFECT patty on #1! Turn down #2 — cheese is too hot!';
  state.toastUntil = 999;
  return state;
}

function stageRush() {
  const state = basePlayState(163, 17);
  state.score = 1420;
  state.coins = 1420;
  state.served = 8;
  state.combo = 7;
  state.bestCombo = 7;
  state.rushAnnounced = true;
  state.tickets = [
    ticketAt(0, 6),
    ticketAt(2, 11),
    ticketAt(1, 15),
    ticketAt(3, 24),
  ];
  putOnBurner(state, 0, 'patty', 180, 183, 88, 0, 0.95);
  putOnBurner(state, 1, 'patty', 180, 178, 45, 0, 0.9);
  putOnBurner(state, 2, 'cheese', 110, 112, 100, 0, 0.92);
  putOnBurner(state, 3, 'tomato', 130, 134, 70, 0, 0.9);
  state.plate = ['bun', 'patty'];
  state.toast = 'RUSH HOUR — 17 seconds left! Keep the line moving!';
  state.toastUntil = 999;
  return state;
}

function stageServe() {
  const state = basePlayState(120, 60);
  state.score = 980;
  state.coins = 980;
  state.served = 6;
  state.combo = 4;
  state.bestCombo = 4;
  state.tickets = [
    ticketAt(0, 34),
    ticketAt(1, 42),
  ];
  putOnBurner(state, 0, 'onion', 150, 151, 40, 0, 0.92);
  putOnBurner(state, 1, 'bun', 95, 96, 100, 0, 0.95);
  state.plate = ['bun', 'patty', 'cheese'];
  state.platePerfectCount = 2;
  state.toast = 'MATCH — Classic Ember ready! Hit SERVE or Space!';
  state.toastUntil = 999;
  return state;
}

const SHOTS = {
  cover: stageCover,
  heat: stageHeat,
  rush: stageRush,
  serve: stageServe,
};

export function stageShot(name) {
  const fn = SHOTS[name] || SHOTS.cover;
  return fn();
}
