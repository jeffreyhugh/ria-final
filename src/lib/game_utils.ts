import seedrandom from 'seedrandom';

import {
  Bob,
  crateWeights,
  direction,
  keycode,
  maxPush,
  nMax,
  nMin,
  scores,
} from './game_const';

export interface GameValues {
  bob: Bob;
  board: number[][];
  score: number;
}

export const countBeforeBob = (initial: GameValues): number[] => {
  const bob = { ...initial.bob };
  const board = initial.board.map((row) => row.slice());

  const result = [];

  for (let i = 1; ; i++) {
    let crate = -1;
    switch (bob.direction) {
      case direction.NORTH:
        crate = bob.row - i >= 0 ? board[bob.row - i][bob.col] : -1;
        break;
      case direction.EAST:
        crate =
          bob.col + i < board[0].length ? board[bob.row][bob.col + i] : -1;
        break;
      case direction.SOUTH:
        crate = bob.row + i < board.length ? board[bob.row + i][bob.col] : -1;
        break;
      case direction.WEST:
        crate = bob.col - i >= 0 ? board[bob.row][bob.col - i] : -1;
        break;
    }

    if (crate === -1) {
      // edge
      return [];
    } else if (crate === 0) {
      // crate
      result.push(crate);
      return result.reduce((a, b) => a + b, 0) <= maxPush ? result : [];
    } else {
      result.push(crate);
      continue;
    }
  }
};

export const init = (seed: string): GameValues => {
  const random = seedrandom(seed);

  const n = Math.floor(random() * (nMax - nMin + 1)) + nMin;

  const tmpBoard: number[][] = [];

  for (let i = 0; i < n; i++) {
    tmpBoard.push([]);
    for (let j = 0; j < n; j++) {
      const r = random();
      for (let k = 0; k < crateWeights.length; k++) {
        if (r < crateWeights[k]) {
          tmpBoard[i].push(k);
          break;
        }
      }
    }
  }

  const startingCol = Math.floor(random() * n);
  const tmpBob: Bob = {
    row: n - 1,
    col: startingCol,
    direction: direction.NORTH,
    doorCol: startingCol,
    targetRow: 0,
    targetCol: 0,
  };

  let randR = Math.floor(random() * n);
  let randC = Math.floor(random() * n);
  while (
    randR === 0 ||
    randR === n - 1 ||
    randC === 0 ||
    randC === n - 1 ||
    tmpBoard[randR][randC] === 0
  ) {
    // step through the rest of the board until valid element
    randR = (randR + 1) % n;
    if (randR === 0) {
      randC = (randC + 1) % n;
    }
  }
  tmpBob.targetRow = randR;
  tmpBob.targetCol = randC;
  tmpBoard[tmpBob.row][tmpBob.col] = 0; // bob cannot start on a crate

  return {
    bob: tmpBob,
    board: tmpBoard,
    score: 0,
  };
};

export const turnBob = (direction: number, initial: GameValues): GameValues => {
  const bob: Bob = { ...initial.bob };
  const score = initial.score + scores.TURN;
  bob.direction = direction;
  return {
    bob,
    board: initial.board,
    score,
  };
};

export const moveBob = (initial: GameValues): GameValues => {
  // deep copy bob
  const bob = { ...initial.bob };
  // deep copy board
  const board = initial.board.map((row) => row.slice());

  const cratesBeforeBob = countBeforeBob(initial);
  if (cratesBeforeBob.length === 0) {
    // bob cannot move forward
    return initial;
  }
  // cratesBeforeBob has a trailing 0, remove it
  cratesBeforeBob.pop();

  const score = initial.score + scores.MOVE;

  switch (bob.direction) {
    case direction.NORTH:
      // move target
      if (
        bob.row >= bob.targetRow &&
        bob.targetRow >= bob.row - cratesBeforeBob.length &&
        bob.col === bob.targetCol
      ) {
        bob.targetRow--;
      }
      // move bob
      bob.row > 0 ? bob.row-- : bob.row;
      // move all crates
      for (let i = 0; i < cratesBeforeBob.length; i++) {
        board[bob.row - (i + 1)][bob.col] = cratesBeforeBob[i];
      }
      break;
    case direction.EAST:
      // move target
      if (
        bob.col <= bob.targetCol &&
        bob.targetCol <= bob.col + cratesBeforeBob.length &&
        bob.row === bob.targetRow
      ) {
        bob.targetCol++;
      }
      // move bob
      bob.col < board[0].length - 1 ? bob.col++ : bob.col;
      // move all crates
      for (let i = 0; i < cratesBeforeBob.length; i++) {
        board[bob.row][bob.col + (i + 1)] = cratesBeforeBob[i];
      }
      break;
    case direction.SOUTH:
      // move target
      if (
        bob.row <= bob.targetRow &&
        bob.targetRow <= bob.row + cratesBeforeBob.length &&
        bob.col === bob.targetCol
      ) {
        bob.targetRow++;
      }
      // move bob
      bob.row < board.length - 1 ? bob.row++ : bob.row;
      // move all crates
      for (let i = 0; i < cratesBeforeBob.length; i++) {
        board[bob.row + (i + 1)][bob.col] = cratesBeforeBob[i];
      }
      break;
    case direction.WEST:
      // move target
      if (
        bob.col >= bob.targetCol &&
        bob.targetCol >= bob.col - cratesBeforeBob.length &&
        bob.row === bob.targetRow
      ) {
        bob.targetCol--;
      }
      // move bob
      bob.col > 0 ? bob.col-- : bob.col;
      // move all crates
      for (let i = 0; i < cratesBeforeBob.length; i++) {
        board[bob.row][bob.col - (i + 1)] = cratesBeforeBob[i];
      }
  }
  // clear the crate under bob (it was already shifted)
  board[bob.row][bob.col] = 0;

  return {
    bob,
    board,
    score,
  };
};

export const explodeCrate = (initial: GameValues): GameValues => {
  // deep copy bob
  const bob = { ...initial.bob };
  // deep copy board
  const board = initial.board.map((row) => row.slice());

  switch (bob.direction) {
    case direction.NORTH:
      if (
        (bob.targetRow === bob.row - 1 && bob.targetCol === bob.col) ||
        board[bob.row - 1][bob.col] === 0
      ) {
        return initial;
      }
      break;
    case direction.EAST:
      if (
        (bob.targetRow === bob.row && bob.targetCol === bob.col + 1) ||
        board[bob.row][bob.col + 1] === 0
      ) {
        return initial;
      }
      break;
    case direction.SOUTH:
      if (
        (bob.targetRow === bob.row + 1 && bob.targetCol === bob.col) ||
        board[bob.row + 1][bob.col] === 0
      ) {
        return initial;
      }
      break;
    case direction.WEST:
      if (
        (bob.targetRow === bob.row && bob.targetCol === bob.col - 1) ||
        board[bob.row][bob.col - 1] === 0
      ) {
        return initial;
      }
      break;
  }

  const score = initial.score + scores.EXPLODE;

  switch (bob.direction) {
    case direction.NORTH:
      if (bob.row > 0) board[bob.row - 1][bob.col] = 0;
      break;
    case direction.EAST:
      if (bob.col < board[0].length - 1) board[bob.row][bob.col + 1] = 0;
      break;
    case direction.SOUTH:
      if (bob.row < board.length - 1) board[bob.row + 1][bob.col] = 0;
      break;
    case direction.WEST:
      if (bob.col > 0) board[bob.row][bob.col - 1] = 0;
      break;
  }

  return {
    bob,
    board,
    score,
  };
};

export const checkWin = (initial: GameValues): boolean => {
  if (
    initial.bob.targetCol === initial.bob.doorCol &&
    initial.bob.targetRow === initial.board.length - 1
  ) {
    return true;
  }
  return false;
};

export const handleKeyDown = (key: string, initial: GameValues): GameValues => {
  switch (key) {
    case keycode.W:
    case keycode.UP:
      return initial.bob.direction === direction.NORTH
        ? moveBob(initial)
        : turnBob(direction.NORTH, initial);
    case keycode.A:
    case keycode.LEFT:
      return initial.bob.direction === direction.WEST
        ? moveBob(initial)
        : turnBob(direction.WEST, initial);
    case keycode.S:
    case keycode.DOWN:
      return initial.bob.direction === direction.SOUTH
        ? moveBob(initial)
        : turnBob(direction.SOUTH, initial);
    case keycode.D:
    case keycode.RIGHT:
      return initial.bob.direction === direction.EAST
        ? moveBob(initial)
        : turnBob(direction.EAST, initial);
    case keycode.SPACE:
      return explodeCrate(initial);
    default:
      return initial;
  }
};
