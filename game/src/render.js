// Renderer: every pixel of Midnight Wok is drawn on one canvas — no images, no fonts
// fetched from anywhere. Layout is fixed at 1440x900 and scales with the page.
import { INGREDIENTS, RECIPES } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', bold = true) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700' : '400'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

export function drawIngredient(ctx, id, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = '#e8b96a';
    rr(ctx, -s * 0.9, -s * 0.55, s * 1.8, s * 0.55, s * 0.25); ctx.fill();
    ctx.fillStyle = '#d9a24f';
    rr(ctx, -s * 0.9, 0, s * 1.8, s * 0.4, s * 0.2); ctx.fill();
    ctx.fillStyle = '#f7d795';
    ctx.beginPath(); ctx.ellipse(0, -s * 0.55, s * 0.9, s * 0.45, 0, Math.PI, 0); ctx.fill();
  } else if (id === 'patty') {
    ctx.fillStyle = '#7a4a2b';
    rr(ctx, -s, -s * 0.32, s * 2, s * 0.64, s * 0.3); ctx.fill();
    ctx.fillStyle = '#8f5a35';
    rr(ctx, -s * 0.85, -s * 0.2, s * 1.7, s * 0.3, s * 0.15); ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#58b368';
    for (const [dx, dy] of [[-0.5, 0], [0.4, -0.1], [0, 0.25]]) {
      ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#7ed491';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e04536';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath(); ctx.ellipse(0, -s * 0.8, s * 0.3, s * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f5c542';
    ctx.beginPath(); ctx.moveTo(-s, s * 0.5); ctx.lineTo(s, s * 0.5); ctx.lineTo(0, -s * 0.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d9a520';
    ctx.beginPath(); ctx.arc(-s * 0.25, s * 0.15, s * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.3, s * 0.25, s * 0.09, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#f7f3e3';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.95, s * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath(); ctx.arc(s * 0.1, 0, s * 0.42, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'noodle') {
    ctx.strokeStyle = '#f0d060';
    ctx.lineWidth = s * 0.22;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.9, i * s * 0.35);
      ctx.bezierCurveTo(-s * 0.4, i * s * 0.35 - s * 0.35, s * 0.4, i * s * 0.35 + s * 0.35, s * 0.9, i * s * 0.35);
      ctx.stroke();
    }
  } else if (id === 'shrimp') {
    ctx.strokeStyle = '#f28c7a';
    ctx.lineWidth = s * 0.45;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, s * 0.1, s * 0.7, Math.PI * 1.15, Math.PI * 1.95); ctx.stroke();
    ctx.fillStyle = '#e06a55';
    ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.45, s * 0.18, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function createRenderer(canvas, input) {
  const ctx = canvas.getContext('2d');

  function drawTicket(order, x, y, w, h) {
    const frac = Math.max(0, order.patience / order.maxPatience);
    const urgent = frac < 0.35;
    ctx.fillStyle = '#fff8e7';
    rr(ctx, x, y, w, h, 12); ctx.fill();
    ctx.fillStyle = urgent ? '#c0392b' : '#2c4a55';
    rr(ctx, x, y, w, 8, 4); ctx.fill();
    text(ctx, `#${order.id}  ${order.recipe.name}`, x + 16, y + 30, 24, '#22303a');
    text(ctx, `Pays ${order.recipe.pay} coins + tip`, x + 16, y + 58, 16, '#6b7a82', 'left', false);
    // Needed ingredients, small icons in a row.
    order.recipe.needs.forEach((id, i) => {
      drawIngredient(ctx, id, x + 34 + i * 52, y + 96, 20);
    });
    // Patience bar.
    ctx.fillStyle = '#d8d2c4';
    rr(ctx, x + 16, y + h - 24, w - 32, 10, 5); ctx.fill();
    ctx.fillStyle = urgent ? '#e04536' : '#58b368';
    rr(ctx, x + 16, y + h - 24, (w - 32) * frac, 10, 5); ctx.fill();
  }

  function drawPlate(state, cx, cy) {
    // Plate.
    ctx.fillStyle = '#e8e4da';
    ctx.beginPath(); ctx.ellipse(cx, cy, 150, 34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cfc9ba';
    ctx.beginPath(); ctx.ellipse(cx, cy, 118, 24, 0, 0, Math.PI * 2); ctx.fill();
    // Stacked ingredients, bottom to top.
    state.plate.forEach((id, i) => {
      drawIngredient(ctx, id, cx, cy - 14 - i * 26, 34);
    });
    if (state.plate.length === 0) {
      text(ctx, 'Empty plate — add ingredients!', cx, cy - 60, 20, '#8fa3ab', 'center', false);
    }
  }

  function draw(state, screen, best) {
    input.clearRegions();
    // Kitchen wall + floor.
    ctx.fillStyle = '#1d2f38';
    ctx.fillRect(0, 0, 1440, 900);
    ctx.fillStyle = '#243842';
    for (let x = 0; x < 1440; x += 120) ctx.fillRect(x, 90, 2, 590);
    ctx.fillStyle = '#8a6a4b';
    ctx.fillRect(0, 680, 1440, 220);
    ctx.fillStyle = '#7a5c40';
    for (let x = 0; x < 1440; x += 90) ctx.fillRect(x, 680, 3, 220);

    // Top bar.
    ctx.fillStyle = '#10181d';
    ctx.fillRect(0, 0, 1440, 70);
    text(ctx, 'MIDNIGHT WOK', 28, 36, 30, '#f5c542');
    text(ctx, 'night-market kitchen', 268, 38, 16, '#8fa3ab', 'left', false);
    const mm = fmtTime(state.timeLeft);
    ctx.fillStyle = state.timeLeft < 30 ? '#e04536' : '#f5f3ea';
    rr(ctx, 620, 12, 200, 46, 10); ctx.fill();
    text(ctx, mm, 720, 36, 28, state.timeLeft < 30 ? '#fff' : '#22303a', 'center');
    text(ctx, `Coins  ${state.score}`, 900, 36, 26, '#f5f3ea');
    text(ctx, `Served  ${state.served}`, 1080, 36, 26, '#f5f3ea');
    text(ctx, `Best  ${best}`, 1280, 36, 22, '#8fa3ab');

    // Order board.
    text(ctx, 'ORDER BOARD', 28, 104, 22, '#f5c542');
    if (state.orders.length === 0) {
      text(ctx, 'No orders — take a breath.', 28, 150, 18, '#8fa3ab', 'left', false);
    }
    state.orders.forEach((order, i) => drawTicket(order, 24, 122 + i * 168, 336, 152));

    // Stove + wok (centre).
    ctx.fillStyle = '#2c4a55';
    rr(ctx, 400, 130, 640, 260, 16); ctx.fill();
    text(ctx, 'STOVE', 420, 158, 18, '#8fa3ab');
    // Flames under the wok.
    const flick = Math.sin(state.time * 9) * 6;
    ctx.fillStyle = '#e8823a';
    ctx.beginPath();
    ctx.moveTo(640, 330); ctx.quadraticCurveTo(680, 290 + flick, 720, 330);
    ctx.quadraticCurveTo(760, 290 - flick, 800, 330); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(670, 330); ctx.quadraticCurveTo(700, 300 - flick, 730, 330);
    ctx.quadraticCurveTo(760, 300 + flick, 770, 330); ctx.closePath(); ctx.fill();
    // Wok.
    ctx.fillStyle = '#3a3f45';
    ctx.beginPath(); ctx.ellipse(720, 320, 130, 42, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#565d66';
    ctx.beginPath(); ctx.ellipse(720, 318, 130, 40, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#f0d060';
    ctx.beginPath(); ctx.ellipse(700, 316, 46, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f28c7a';
    ctx.beginPath(); ctx.arc(745, 312, 12, 0, Math.PI * 2); ctx.fill();

    // Plate on the counter.
    text(ctx, 'YOUR PLATE', 560, 430, 20, '#f5c542');
    drawPlate(state, 720, 560);
    input.register('plate', 570, 470, 300, 140);
    text(ctx, 'Click the plate to take the top item off', 720, 640, 15, '#8fa3ab', 'center', false);

    // Right panel: serve + clear + recipe hint.
    ctx.fillStyle = '#2c4a55';
    rr(ctx, 1080, 122, 336, 300, 16); ctx.fill();
    text(ctx, 'READY TO SERVE?', 1100, 152, 20, '#f5c542');
    const match = state.orders.find((o) => {
      const a = [...o.recipe.needs].sort().join(',');
      const b = [...state.plate].sort().join(',');
      return a === b && state.plate.length > 0;
    });
    text(ctx, match ? `Matches #${match.id} ${match.recipe.name}` : 'Build a dish the board asks for.', 1100, 186, 17, '#f5f3ea', 'left', false);
    ctx.fillStyle = match ? '#58b368' : '#5a6b74';
    rr(ctx, 1100, 214, 296, 76, 12); ctx.fill();
    text(ctx, 'SERVE  [Space]', 1248, 252, 28, '#fff', 'center');
    input.register('serve', 1100, 214, 296, 76);
    ctx.fillStyle = '#4a5a63';
    rr(ctx, 1100, 304, 296, 52, 12); ctx.fill();
    text(ctx, 'CLEAR PLATE  [Backspace]', 1248, 330, 20, '#f5f3ea', 'center');
    input.register('clear', 1100, 304, 296, 52);
    if (state.streak >= 2) text(ctx, `Streak x${state.streak} — keep it hot!`, 1248, 392, 20, '#f5c542', 'center');

    // Flash message.
    if (state.flashT > 0 && state.flash) {
      ctx.fillStyle = 'rgba(16,24,29,0.85)';
      rr(ctx, 470, 660, 500, 44, 10); ctx.fill();
      text(ctx, state.flash, 720, 683, 22, '#ffd76a', 'center');
    }

    // Ingredient counter (bottom).
    text(ctx, 'INGREDIENTS — click or press 1–8', 28, 716, 20, '#f5c542');
    INGREDIENTS.forEach((ing, i) => {
      const x = 24 + i * 176;
      const y = 736;
      ctx.fillStyle = '#fff8e7';
      rr(ctx, x, y, 164, 140, 14); ctx.fill();
      drawIngredient(ctx, ing.id, x + 82, y + 52, 34);
      text(ctx, ing.name, x + 82, y + 108, 20, '#22303a', 'center');
      text(ctx, `[${ing.key}]`, x + 82, y + 130, 15, '#6b7a82', 'center');
      input.register(`ingredient:${ing.id}`, x, y, 164, 140);
    });

    // Overlays.
    if (screen === SCREEN_TITLE) {
      ctx.fillStyle = 'rgba(10,16,20,0.82)';
      ctx.fillRect(0, 0, 1440, 900);
      text(ctx, 'MIDNIGHT WOK', 720, 300, 84, '#f5c542', 'center');
      text(ctx, 'The night-market stall that never sleeps.', 720, 380, 26, '#f5f3ea', 'center', false);
      text(ctx, 'Read the order board. Click ingredients (or press 1–8) to build the dish.', 720, 440, 22, '#c8d4da', 'center', false);
      text(ctx, 'Serve the plate when it matches an order — before patience runs out.', 720, 476, 22, '#c8d4da', 'center', false);
      text(ctx, 'Space = serve   •   Backspace = clear plate   •   P = pause', 720, 512, 22, '#c8d4da', 'center', false);
      ctx.fillStyle = '#58b368';
      rr(ctx, 570, 560, 300, 64, 12); ctx.fill();
      text(ctx, 'START COOKING', 720, 592, 26, '#fff', 'center');
      input.register('confirm', 570, 560, 300, 64);
      text(ctx, `Best shift: ${best} coins`, 720, 668, 20, '#8fa3ab', 'center', false);
    } else if (screen === SCREEN_PAUSED) {
      ctx.fillStyle = 'rgba(10,16,20,0.75)';
      ctx.fillRect(0, 0, 1440, 900);
      text(ctx, 'PAUSED', 720, 430, 64, '#f5f3ea', 'center');
      text(ctx, 'Press P or click to keep cooking.', 720, 500, 24, '#c8d4da', 'center', false);
      input.register('confirm', 0, 0, 1440, 900);
    } else if (screen === SCREEN_OVER) {
      ctx.fillStyle = 'rgba(10,16,20,0.85)';
      ctx.fillRect(0, 0, 1440, 900);
      text(ctx, 'SHIFT OVER!', 720, 320, 72, '#f5c542', 'center');
      text(ctx, `You served ${state.served} dishes and earned ${state.score} coins.`, 720, 400, 28, '#f5f3ea', 'center', false);
      text(ctx, `Best streak: ${state.bestStreak}   •   Best shift: ${Math.max(best, state.score)} coins`, 720, 448, 24, '#c8d4da', 'center', false);
      ctx.fillStyle = '#58b368';
      rr(ctx, 570, 500, 300, 64, 12); ctx.fill();
      text(ctx, 'COOK AGAIN', 720, 532, 26, '#fff', 'center');
      input.register('confirm', 570, 500, 300, 64);
    }
  }

  return { draw };
}
