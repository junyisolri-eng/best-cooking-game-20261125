// Screenshot scenes behind ?shot=start|play|serve|end. Each one sets the world to a
// fixed, real game state (no faked pixels: the same state a player reaches by playing),
// so the frame is what the game really looks like and the same seed always gives it.
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

export function stageShot(name, world) {
  const s = world.state;
  world.reset();
  if (name === 'play') {
    // Mid-shift: two orders waiting, plate half-built, timer running.
    s.time = 43;
    s.timeLeft = 107;
    s.score = 36;
    s.served = 3;
    s.streak = 2;
    s.plate = ['bun', 'patty'];
    s.orders[0].patience = 22;
    s.orders[1].patience = 38;
    return { screen: SCREEN_PLAY, best: 120 };
  }
  if (name === 'serve') {
    // Plate finished and matching the first order: the serve moment.
    s.time = 61;
    s.timeLeft = 89;
    s.score = 58;
    s.served = 5;
    s.streak = 3;
    const first = s.orders[0];
    s.plate = [...first.recipe.needs];
    first.patience = 30;
    s.flash = `Matches #${first.id} ${first.recipe.name} — serve it!`;
    s.flashT = 99;
    return { screen: SCREEN_PLAY, best: 120 };
  }
  if (name === 'end') {
    s.time = 150;
    s.timeLeft = 0;
    s.score = 142;
    s.served = 11;
    s.bestStreak = 4;
    s.over = true;
    return { screen: SCREEN_OVER, best: 120 };
  }
  // start (default): fresh shift, title screen over a live kitchen.
  s.orders[0].patience = 40;
  s.orders[1].patience = 44;
  return { screen: SCREEN_TITLE, best: 120 };
}
