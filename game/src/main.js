// Boot and the one loop: input is read on every action, the world advances in fixed
// 1/60 s steps, and the renderer paints what is there. The game moves between four
// screens: title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with &seed=N) stages that
// scene instead of running the loop, paints it twice and sets window.__shotReady.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_OVER, EVENT_SERVED, EVENT_WRONG } from './world.js';
import { createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';
import { createSound } from './sound.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const sound = createSound();
const input = createInput(canvas, handleAction);
const renderer = createRenderer(canvas, input);

let screen = SCREEN_TITLE;
let best = readBest();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

function announce(message) {
  status.textContent = message;
}

function startGame() {
  world.reset();
  screen = SCREEN_PLAY;
  announce('Playing. Build the dishes on the order board.');
}

function endGame() {
  screen = SCREEN_OVER;
  if (world.state.score > best) {
    best = world.state.score;
    saveBest(best);
  }
  announce(`Shift over. Score ${world.state.score}. Best ${best}.`);
}

function handleAction(name) {
  if (name === 'confirm') {
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
    else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    return;
  }
  if (name === 'pause') {
    if (screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
    else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    return;
  }
  if (screen !== SCREEN_PLAY) return;
  if (name === 'serve') {
    const events = world.serve();
    if (events & EVENT_SERVED) { sound.ding(); announce(world.state.flash); }
    else if (events & EVENT_WRONG) { sound.buzz(); announce(world.state.flash); }
  } else if (name === 'clear') {
    world.clearPlate();
    sound.chop();
  } else if (name === 'plate') {
    world.removeLast();
    sound.chop();
  } else if (name.startsWith('ingredient:')) {
    const id = name.slice('ingredient:'.length);
    if (world.addIngredient(id)) sound.sizzle();
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  best = scene.best;
  screen = scene.screen;
  let painted = 0;
  function paint() {
    renderer.draw(world.state, screen, best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        const events = world.step(STEP);
        accumulator -= STEP;
        if (events & EVENT_OVER) { endGame(); break; }
      }
      const sec = Math.ceil(world.state.timeLeft);
      if (sec !== lastTickSecond) {
        lastTickSecond = sec;
        if (sec <= 10 && sec > 0) sound.tick();
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
  });

  announce('Midnight Wok. Press Enter or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
