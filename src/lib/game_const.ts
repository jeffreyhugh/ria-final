export const direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
};

export const keycode = {
  W: 'w',
  A: 'a',
  S: 's',
  D: 'd',
  UP: 'up',
  LEFT: 'left',
  DOWN: 'down',
  RIGHT: 'right',
  SPACE: 'space',
};

// array of keycode values
export const keycodeArray = [
  keycode.W,
  keycode.A,
  keycode.S,
  keycode.D,
  keycode.UP,
  keycode.LEFT,
  keycode.DOWN,
  keycode.RIGHT,
  keycode.SPACE,
];

export const scores = {
  MOVE: 1,
  TURN: 0,
  EXPLODE: 100,
};

export const tiles = {
  crate: [
    ``,
    `<div class="w-12 h-12 bg-blue-200 ring-4 ring-inset ring-blue-400 rounded-md flex justify-center items-center text-blue-600 font-bold text-2xl select-none">1</div>`,
    `<div class="w-12 h-12 bg-blue-400 ring-4 ring-inset ring-blue-600 rounded-md flex justify-center items-center text-blue-800 font-bold text-2xl select-none">2</div>`,
    `<div class="w-12 h-12 bg-blue-600 ring-4 ring-inset ring-blue-800 rounded-md flex justify-center items-center text-blue-900 font-bold text-2xl select-none">3</div>`,
  ],
  target: [
    ``,
    `<div class="w-12 h-12 bg-lime-200 ring-4 ring-inset ring-lime-400 rounded-md flex justify-center items-center text-lime-600 font-bold text-2xl select-none">1</div>`,
    `<div class="w-12 h-12 bg-lime-400 ring-4 ring-inset ring-lime-600 rounded-md flex justify-center items-center text-lime-800 font-bold text-2xl select-none">2</div>`,
    `<div class="w-12 h-12 bg-lime-600 ring-4 ring-inset ring-lime-800 rounded-md flex justify-center items-center text-lime-900 font-bold text-2xl select-none">3</div>`,
  ],
  bob: [
    `<div class="w-12 h-12 bg-amber-200 ring-4 ring-inset ring-amber-400 rounded-md flex justify-center items-center text-amber-600 font-bold text-2xl select-none"><i class="fa fa-arrow-up"></i></div>`,
    `<div class="w-12 h-12 bg-amber-200 ring-4 ring-inset ring-amber-400 rounded-md flex justify-center items-center text-amber-600 font-bold text-2xl select-none"><i class="fa fa-arrow-right"></i></div>`,
    `<div class="w-12 h-12 bg-amber-200 ring-4 ring-inset ring-amber-400 rounded-md flex justify-center items-center text-amber-600 font-bold text-2xl select-none"><i class="fa fa-arrow-down"></i></div>`,
    `<div class="w-12 h-12 bg-amber-200 ring-4 ring-inset ring-amber-400 rounded-md flex justify-center items-center text-amber-600 font-bold text-2xl select-none"><i class="fa fa-arrow-left"></i></div>`,
  ],
  door: `<div class="w-12 h-12 bg-rose-200 ring-4 ring-inset ring-rose-400 rounded-md flex justify-center items-center text-rose-600 font-bold text-2xl select-none"></div>`,
  empty: `<div class="w-12 h-12 bg-gray-200 ring-4 ring-inset ring-gray-400 rounded-md flex justify-center items-center text-gray-600 font-bold text-2xl select-none"></div>`,
};

export const maxPush = 5;
export const nMin = 8;
export const nMax = 12;

export const crateWeights = [0.7, 0.8, 0.9, 1.0];

export interface Bob {
  row: number;
  col: number;
  direction: number;
  doorCol: number;
  targetRow: number;
  targetCol: number;
  seed: string;
}
