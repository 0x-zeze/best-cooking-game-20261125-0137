import {
  SHIFT_SECONDS,
  RUSH_AT_SECONDS_LEFT,
  MAX_TICKETS,
  TICKET_PATIENCE,
  RUSH_TICKET_PATIENCE,
  SPAWN_EVERY,
  RUSH_SPAWN_EVERY,
  BURNER_COUNT,
  PERFECT_BONUS,
  COMBO_STEP,
  INGREDIENTS,
  RECIPES,
} from './config.js';
import {
  cookItem,
  freshCookItem,
  scorchReadyItem,
  slewBurnerTemperature,
} from './heat.js';

let nextTicketId = 1;

function setToast(state, text, seconds = 2.5) {
  state.toast = text;
  state.toastUntil = state.elapsed + seconds;
}

function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return false;
  }
  return true;
}

export function newGameState() {
  return {
    screen: 'title',
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    perfectCooks: 0,
    burntCount: 0,
    expiredCount: 0,
    combo: 0,
    bestCombo: 0,
    burners: Array.from({ length: BURNER_COUNT }, (_, id) => ({
      id,
      setpoint: 0,
      temp: 24,
      item: null,
    })),
    plate: [],
    tickets: [],
    passDish: null,
    passUntil: 0,
    selectedBurner: 0,
    spawnIn: 2,
    toast: null,
    toastUntil: 0,
    lastServe: null,
    paused: false,
    frozen: false,
    muted: false,
    rushAnnounced: false,
    platePerfectCount: 0,
  };
}

export function isRush(state) {
  return state.timeLeft <= RUSH_AT_SECONDS_LEFT;
}

export function makeTicket(recipeIndex, patience = TICKET_PATIENCE) {
  const idx = ((recipeIndex % RECIPES.length) + RECIPES.length) % RECIPES.length;
  const recipe = RECIPES[idx];
  return {
    id: nextTicketId++,
    recipeId: recipe.id,
    name: recipe.name,
    items: [...recipe.items],
    base: recipe.base,
    patience,
    maxPatience: patience,
  };
}

export function spawnTicket(state) {
  if (state.tickets.length >= MAX_TICKETS) return null;
  const recipeIndex = Math.floor(Math.random() * RECIPES.length);
  const patience = isRush(state) ? RUSH_TICKET_PATIENCE : TICKET_PATIENCE;
  const ticket = makeTicket(recipeIndex, patience);
  state.tickets.push(ticket);
  return ticket;
}

export function matchingTicket(state) {
  return state.tickets.find((t) => sameMultiset(t.items, state.plate)) || null;
}

export function servePlate(state) {
  const ticket = matchingTicket(state);
  if (!ticket) return null;

  const speedBonus = ticket.maxPatience > 0
    ? Math.round((60 * ticket.patience) / ticket.maxPatience)
    : 0;
  const points = ticket.base
    + speedBonus
    + state.platePerfectCount * PERFECT_BONUS
    + state.combo * COMBO_STEP;

  state.score += points;
  state.coins += points;
  state.served += 1;
  state.combo += 1;
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;

  const idx = state.tickets.indexOf(ticket);
  if (idx !== -1) state.tickets.splice(idx, 1);

  state.passDish = { name: ticket.name, items: [...ticket.items] };
  state.passUntil = state.elapsed + 4;
  state.plate = [];
  state.platePerfectCount = 0;

  const result = { points, name: ticket.name };
  state.lastServe = { ...result, at: state.elapsed };
  setToast(state, `Served ${ticket.name} +${points}`);
  return result;
}

export function placeIngredient(state, ing) {
  const spec = typeof ing === 'string' ? INGREDIENTS[ing] : ing;
  if (!spec) return 'invalid';

  if (spec.raw) {
    state.plate.push(spec.id);
    return 'plated';
  }

  const burner = state.burners[state.selectedBurner];
  if (!burner || burner.item) return 'burner-busy';

  burner.item = freshCookItem(spec.id);
  return 'cooking';
}

export function takeFromBurner(state, i) {
  const burner = state.burners[i];
  if (!burner || !burner.item) return 'empty';

  const item = burner.item;
  if (item.state === 'burnt') {
    burner.item = null;
    state.combo = 0;
    state.burntCount += 1;
    setToast(state, `Trashed burnt ${INGREDIENTS[item.id]?.name ?? item.id}`);
    return 'trashed';
  }

  if (item.state !== 'ready') return 'not-ready';

  burner.item = null;
  state.plate.push(item.id);
  if (item.perfect) {
    state.platePerfectCount += 1;
    state.perfectCooks += 1;
  }
  return 'plated';
}

export function clearPlate(state) {
  state.plate = [];
  state.platePerfectCount = 0;
  state.combo = 0;
  setToast(state, 'Plate cleared');
}

export function tickGame(state, dt) {
  const events = [];
  if (state.screen !== 'play' || state.paused || state.frozen || dt <= 0) {
    return events;
  }

  state.elapsed += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);

  if (state.toast && state.elapsed >= state.toastUntil) {
    state.toast = null;
  }

  if (!state.rushAnnounced && isRush(state)) {
    state.rushAnnounced = true;
    setToast(state, 'Dinner Rush!', 3);
    events.push('rush');
  }

  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnTicket(state);
    state.spawnIn = isRush(state) ? RUSH_SPAWN_EVERY : SPAWN_EVERY;
  }

  for (let i = state.tickets.length - 1; i >= 0; i--) {
    const ticket = state.tickets[i];
    ticket.patience -= dt;
    if (ticket.patience <= 0) {
      state.tickets.splice(i, 1);
      state.expiredCount += 1;
      state.combo = 0;
      setToast(state, `${ticket.name} expired!`);
      events.push('expire');
    }
  }

  for (const burner of state.burners) {
    slewBurnerTemperature(burner, dt);
    if (!burner.item) continue;
    if (burner.item.state === 'cooking') {
      const res = cookItem(burner, dt);
      if (res.type === 'ready') {
        events.push(res.perfect ? 'perfect' : 'ready');
      } else if (res.type === 'burnt') {
        events.push('burnt');
      }
    } else if (burner.item.state === 'ready') {
      const res = scorchReadyItem(burner, dt);
      if (res.type === 'burnt') {
        events.push('burnt');
      }
    }
  }

  if (state.passDish && state.elapsed >= state.passUntil) {
    state.passDish = null;
  }

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = 'over';
    events.push('over');
  }

  return events;
}
