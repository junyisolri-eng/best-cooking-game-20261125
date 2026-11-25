// World: orders, the plate under assembly, the shift timer and scoring.
// No rendering here: render.js paints whatever this state holds.
import { INGREDIENTS, MAX_ORDERS, ORDER_PATIENCE, RECIPES, SHIFT_SECONDS, SPAWN_EVERY, STEP } from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_OVER = 4;
export const EVENT_WRONG = 8;

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export function createWorld(random) {
  const state = {
    time: 0,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    served: 0,
    streak: 0,
    bestStreak: 0,
    orders: [],
    plate: [],
    spawnIn: 6,
    over: false,
    flash: '',
    flashT: 0,
    nextOrderId: 1,
  };

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    const recipe = RECIPES[Math.floor(random() * RECIPES.length)];
    state.orders.push({
      id: state.nextOrderId,
      recipe,
      patience: ORDER_PATIENCE,
      maxPatience: ORDER_PATIENCE,
      born: state.time,
    });
    state.nextOrderId += 1;
  }

  function reset() {
    state.time = 0;
    state.timeLeft = SHIFT_SECONDS;
    state.score = 0;
    state.served = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.orders = [];
    state.plate = [];
    state.spawnIn = 6;
    state.over = false;
    state.flash = '';
    state.flashT = 0;
    state.nextOrderId = 1;
    spawnOrder();
    spawnOrder();
  }

  function addIngredient(id) {
    if (state.over) return false;
    if (!INGREDIENTS.some((ing) => ing.id === id)) return false;
    if (state.plate.length >= 5) return false;
    state.plate.push(id);
    return true;
  }

  function clearPlate() {
    state.plate = [];
  }

  function removeLast() {
    state.plate.pop();
  }

  /** Serve the plate to the first order it matches. Returns an event bit. */
  function serve() {
    if (state.over || state.plate.length === 0) return 0;
    const match = state.orders.find((order) => sameSet(order.recipe.needs, state.plate));
    if (!match) {
      state.streak = 0;
      state.flash = 'No order matches this plate!';
      state.flashT = 1.6;
      return EVENT_WRONG;
    }
    const patienceFrac = Math.max(0, match.patience / match.maxPatience);
    const tip = Math.round(patienceFrac * 8);
    const streakBonus = Math.min(state.streak, 5) * 2;
    const earned = match.recipe.pay + tip + streakBonus;
    state.score += earned;
    state.served += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.orders = state.orders.filter((order) => order.id !== match.id);
    state.plate = [];
    state.flash = `Served ${match.recipe.name}! +${earned} coins`;
    state.flashT = 1.8;
    return EVENT_SERVED;
  }

  function step(dt) {
    if (state.over) return 0;
    let events = 0;
    state.time += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.time);
    if (state.flashT > 0) state.flashT -= dt;
    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      spawnOrder();
      state.spawnIn = SPAWN_EVERY;
    }
    for (const order of state.orders) order.patience -= dt;
    const before = state.orders.length;
    state.orders = state.orders.filter((order) => order.patience > 0);
    if (state.orders.length < before) {
      state.streak = 0;
      state.flash = 'An order walked out!';
      state.flashT = 1.6;
      events |= EVENT_EXPIRED;
    }
    if (state.timeLeft <= 0) {
      state.over = true;
      events |= EVENT_OVER;
    }
    return events;
  }

  return { state, reset, step, addIngredient, clearPlate, removeLast, serve, spawnOrder };
}
