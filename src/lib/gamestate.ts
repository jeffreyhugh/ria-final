import { useState } from 'react';
import seedrandom from 'seedrandom';

import {
  crateWeights,
  direction,
  maxPush,
  nMax,
  nMin,
  scores,
} from './gamestate_const';

interface Bob {
  row: number;
  col: number;
  direction: number;
  doorCol: number;
  targetRow: number;
  targetCol: number;
}

export default function useGameState(seed: string) {
  const random = seedrandom(seed);

  // !HOOKS

  const [hasInit, setHasInit] = useState(false);
  const [board, setBoard] = useState<number[][]>([]);
  const [bob, setBob] = useState<Bob>({
    row: 0,
    col: 0,
    direction: direction.NORTH,
    doorCol: 0,
    targetRow: 0,
    targetCol: 0,
  });
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // !UTILS

  // count the number of crates in front of bob
  // return an array of crate values or an empty array if bob cannot move forward
  const countBeforeBob = () => {
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
        result.push(i);
        return result.reduce((a, b) => a + b, 0) <= maxPush ? result : [];
      } else {
        result.push(crate);
        continue;
      }
    }
  };

  const getAllData = () => {
    const data = {
      board,
      bob,
      isPlaying,
    };

    return JSON.stringify(data);
  };

  const setAllData = (data: string) => {
    const parsedData = JSON.parse(data);
    setBoard(parsedData.board);
    setBob(parsedData.bob);
    setIsPlaying(parsedData.isPlaying);
  };

  // !EXPORTED

  const init = () => {
    if (hasInit) return;

    // seed the random number generator using a library
    // const random = seedrandom(seed);

    setHasInit(true);

    const n = Math.floor(random() * (nMax - nMin + 1)) + nMin;

    const tempBoard: number[][] = [];

    for (let i = 0; i < n; i++) {
      tempBoard.push([]);
      for (let j = 0; j < n; j++) {
        const r = random();
        for (let k = 0; k < crateWeights.length; k++) {
          if (r < crateWeights[k]) {
            tempBoard[i].push(k);
            break;
          }
        }
      }
    }

    const startingCol = Math.floor(random() * n);
    const tempBob: Bob = {
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
      tempBoard[randR][randC] === 0
    ) {
      // step through the rest of the board until valid element
      randR = (randR + 1) % n;
      if (randR === 0) {
        randC = (randC + 1) % n;
      }
    }
    tempBob.targetRow = randR;
    tempBob.targetCol = randC;
    tempBoard[tempBob.row][tempBob.col] = 0; // bob cannot start on a crate

    // useState will re-render the page whenever it changes
    // avoid unnecessary re-renders by only updating the board and bob once
    setBoard(tempBoard);
    setBob(tempBob);
  };

  const turnBob = (direction: number) => {
    const tempBob = { ...bob };
    tempBob.direction = direction;
    setBob(tempBob);
    setScore((score) => score + scores.TURN);
  };

  const moveBob = () => {
    const tempBob = { ...bob };
    const tempBoard = [...board];

    const cratesBeforeBob = countBeforeBob();
    if (cratesBeforeBob.length === 0) {
      // bob cannot move forward
      return;
    }
    // cratesBeforeBob has a trailing 0, remove it
    cratesBeforeBob.pop();

    setScore((score) => score + scores.MOVE);

    switch (tempBob.direction) {
      case direction.NORTH:
        // move target
        if (
          tempBob.row >= tempBob.targetRow &&
          tempBob.targetRow >= tempBob.row - cratesBeforeBob.length &&
          tempBob.col === tempBob.targetCol
        ) {
          tempBob.targetRow--;
        }
        // move bob
        tempBob.row > 0 ? tempBob.row-- : tempBob.row;
        // move all crates
        for (let i = 0; i < cratesBeforeBob.length; i++) {
          tempBoard[tempBob.row - (i + 1)][tempBob.col] = cratesBeforeBob[i];
        }
        break;
      case direction.EAST:
        // move target
        if (
          tempBob.col <= tempBob.targetCol &&
          tempBob.targetCol <= tempBob.col + cratesBeforeBob.length &&
          tempBob.row === tempBob.targetRow
        ) {
          tempBob.targetCol++;
        }
        // move bob
        tempBob.col < tempBoard[0].length - 1 ? tempBob.col++ : tempBob.col;
        // move all crates
        for (let i = 0; i < cratesBeforeBob.length; i++) {
          tempBoard[tempBob.row][tempBob.col + (i + 1)] = cratesBeforeBob[i];
        }
        break;
      case direction.SOUTH:
        // move target
        if (
          tempBob.row <= tempBob.targetRow &&
          tempBob.targetRow <= tempBob.row + cratesBeforeBob.length &&
          tempBob.col === tempBob.targetCol
        ) {
          tempBob.targetRow++;
        }
        // move bob
        tempBob.row < tempBoard.length - 1 ? tempBob.row++ : tempBob.row;
        // move all crates
        for (let i = 0; i < cratesBeforeBob.length; i++) {
          tempBoard[tempBob.row + (i + 1)][tempBob.col] = cratesBeforeBob[i];
        }
        break;
      case direction.WEST:
        // move target
        if (
          tempBob.col >= tempBob.targetCol &&
          tempBob.targetCol >= tempBob.col - cratesBeforeBob.length &&
          tempBob.row === tempBob.targetRow
        ) {
          tempBob.targetCol--;
        }
        // move bob
        tempBob.col > 0 ? tempBob.col-- : tempBob.col;
        // move all crates
        for (let i = 0; i < cratesBeforeBob.length; i++) {
          tempBoard[tempBob.row][tempBob.col - (i + 1)] = cratesBeforeBob[i];
        }
    }
    // clear the crate under bob (it was already shifted)
    tempBoard[tempBob.row][tempBob.col] = 0;

    // write the new board and bob
    setBoard(tempBoard);
    setBob(tempBob);
  };

  const explodeCrate = () => {
    const tempBoard = [...board];
    const tempBob = { ...bob };
    switch (tempBob.direction) {
      case direction.NORTH:
        if (
          (tempBob.targetRow === tempBob.row - 1 &&
            tempBob.targetCol === tempBob.col) ||
          tempBoard[tempBob.row - 1][tempBob.col] === 0
        ) {
          return;
        }
        break;
      case direction.EAST:
        if (
          (tempBob.targetRow === tempBob.row &&
            tempBob.targetCol === tempBob.col + 1) ||
          tempBoard[tempBob.row][tempBob.col + 1] === 0
        ) {
          return;
        }
        break;
      case direction.SOUTH:
        if (
          (tempBob.targetRow === tempBob.row + 1 &&
            tempBob.targetCol === tempBob.col) ||
          tempBoard[tempBob.row + 1][tempBob.col] === 0
        ) {
          return;
        }
        break;
      case direction.WEST:
        if (
          (tempBob.targetRow === tempBob.row &&
            tempBob.targetCol === tempBob.col - 1) ||
          tempBoard[tempBob.row][tempBob.col - 1] === 0
        ) {
          return;
        }
        break;
    }

    setScore((score) => score + scores.EXPLODE);

    switch (tempBob.direction) {
      case direction.NORTH:
        if (tempBob.row > 0) tempBoard[tempBob.row - 1][tempBob.col] = 0;
        break;
      case direction.EAST:
        if (tempBob.col < tempBoard[0].length - 1)
          tempBoard[tempBob.row][tempBob.col + 1] = 0;
        break;
      case direction.SOUTH:
        if (tempBob.row < tempBoard.length - 1)
          tempBoard[tempBob.row + 1][tempBob.col] = 0;
        break;
      case direction.WEST:
        if (tempBob.col > 0) tempBoard[tempBob.row][tempBob.col - 1] = 0;
        break;
    }

    setBoard(tempBoard);
    // TODO is this required?
    setBob(tempBob);
  };

  const checkWin = () => {
    if (bob.targetCol === bob.doorCol && bob.targetRow === n - 1) {
      setIsPlaying(false);
      return true;
    }
    return false;
  };

  const getScore = () => {
    return score;
  };

  const getBoard = () => {
    return board;
  };

  const getBob = () => {
    return bob;
  };

  init();

  return {
    init,
    turnBob,
    moveBob,
    explodeCrate,
    checkWin,
    getScore,
    getBoard,
    getBob,
    getAllData,
    setAllData,
  };
}
