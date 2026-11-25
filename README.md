# Midnight Wok

A complete, original cooking game for make.fun's **best-cooking-game-20261125-0137** bounty.

You run a night-market wok stall. Orders land on the board with a patience timer;
click ingredients on the counter (or press 1–8) to build the dish on your plate,
then hit **SERVE** (Space) when the plate matches an order. Serve fast for tips,
chain serves for a streak bonus, and don't let an order walk out. One shift lasts
2 minutes 30 seconds.

## How to play

- **1–8** or click: add an ingredient to the plate
- **Space**: serve the plate to the matching order
- **Backspace**: clear the plate (click the plate to take the top item off)
- **P / Esc**: pause, **Enter**: start / play again

## Dishes

- Classic Burger — bun, patty, lettuce, tomato
- Cheese Melt — bun, patty, cheese, egg
- Shrimp Noodles — noodles, shrimp, egg
- Garden Stack — bun, lettuce, tomato, cheese

## Play it

Serve the game folder with any static server and open `game/index.html` in desktop
Chrome. No network requests, no build step, all art drawn on canvas and all sounds
synthesized with WebAudio.

```sh
python3 -m http.server --directory game 8080
```

Screenshot scenes: `game/index.html?shot=start|play|serve|end&seed=1` stages a
deterministic frame of the real game for screenshots.

## Entry

`main.ts` (Node 22, stdlib only) copies `game/` and `screenshots/` to `/output`
and writes `/output/dossier.json` via the vendored `vendor/makefun-game.ts`.
