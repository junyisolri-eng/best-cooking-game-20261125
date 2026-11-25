// Input: mouse clicks on canvas regions plus keyboard shortcuts.
// Regions are registered by the renderer each frame; a click resolves to a named action.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_CLEAR = 8;

export function createInput(canvas, onAction) {
  const regions = [];
  let keys = new Set();

  function register(name, x, y, w, h) {
    regions.push({ name, x, y, w, h });
  }

  function clearRegions() {
    regions.length = 0;
  }

  function hit(x, y) {
    for (let i = regions.length - 1; i >= 0; i -= 1) {
      const r = regions[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.name;
    }
    return null;
  }

  function toGameCoords(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1440,
      y: ((event.clientY - rect.top) / rect.height) * 900,
    };
  }

  canvas.addEventListener('click', (event) => {
    const p = toGameCoords(event);
    const name = hit(p.x, p.y);
    if (name) onAction(name, p);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const k = event.key.toLowerCase();
    keys.add(k);
    if (k >= '1' && k <= '8') onAction(`ingredient:${k}`, null);
    else if (k === ' ') { event.preventDefault(); onAction('serve', null); }
    else if (k === 'backspace') onAction('clear', null);
    else if (k === 'p' || k === 'escape') onAction('pause', null);
    else if (k === 'enter') onAction('confirm', null);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

  return { register, clearRegions };
}
