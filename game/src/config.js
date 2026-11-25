// Midnight Wok: tuning constants, ingredients and recipes.
export const WIDTH = 1440;
export const HEIGHT = 900;
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 150;
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 45;
export const SPAWN_EVERY = 14;

export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', color: '#e8b96a' },
  { id: 'patty', name: 'Patty', key: '2', color: '#7a4a2b' },
  { id: 'lettuce', name: 'Lettuce', key: '3', color: '#58b368' },
  { id: 'tomato', name: 'Tomato', key: '4', color: '#e04536' },
  { id: 'cheese', name: 'Cheese', key: '5', color: '#f5c542' },
  { id: 'egg', name: 'Egg', key: '6', color: '#f7f3e3' },
  { id: 'noodle', name: 'Noodles', key: '7', color: '#f0d060' },
  { id: 'shrimp', name: 'Shrimp', key: '8', color: '#f28c7a' },
];

export const RECIPES = [
  { id: 'burger', name: 'Classic Burger', needs: ['bun', 'patty', 'lettuce', 'tomato'], pay: 12 },
  { id: 'melt', name: 'Cheese Melt', needs: ['bun', 'patty', 'cheese', 'egg'], pay: 14 },
  { id: 'noodles', name: 'Shrimp Noodles', needs: ['noodle', 'shrimp', 'egg'], pay: 11 },
  { id: 'garden', name: 'Garden Stack', needs: ['bun', 'lettuce', 'tomato', 'cheese'], pay: 10 },
];

export const BEST_KEY = 'midnight-wok-best';
