import { useRef, useState } from 'react';
import seedrandom from 'seedrandom';

import {
  crateWeights,
  direction,
  keycode,
  maxPush,
  nMax,
  nMin,
  scores,
} from './game_const';
import useSynchronousState from './useSynchronousState';

export interface Bob {
  row: number;
  col: number;
  direction: number;
  doorCol: number;
  targetRow: number;
  targetCol: number;
}

export interface GameState {
  Init: (seed: string) => void;
  TurnBob: (direction: number) => void;
  MoveBob: () => void;
  ExplodeCrate: () => void;
  CheckWin: () => boolean;
  GetScore: () => number;
  GetBoard: () => number[][];
  GetBob: () => Bob;
  GetAllData: () => string;
  SetAllData: (data: string) => void;
  HandleKeyDown: (key: string) => void;
  ClearLastSeed: () => void;
}

export default function useGameState(): GameState {
  // !HOOKS

  // const [getLastSeed, setLastSeed] = useSynchronousState('');
  // let lastSeed = '';
  const lastSeed = useRef('');
  const [getBoard, setBoard] = useSynchronousState<number[][]>([]);
  const [getBob, setBob] = useSynchronousState<Bob>({
    row: 0,
    col: 0,
    direction: direction.NORTH,
    doorCol: 0,
    targetRow: 0,
    targetCol: 0,
  });
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // !UTILS

  // count the number of crates in front of bob
  // return an array of crate values or an empty array if bob cannot move forward
  const countBeforeBob = () => {
    // deep copy bob
    const tempBob = { ...getBob() };
    // deep copy board
    const tempBoard = getBoard().map((row) => row.slice());

    const result = [];

    for (let i = 1; ; i++) {
      let crate = -1;
      switch (tempBob.direction) {
        case direction.NORTH:
          crate =
            tempBob.row - i >= 0 ? tempBoard[tempBob.row - i][tempBob.col] : -1;
          break;
        case direction.EAST:
          crate =
            tempBob.col + i < tempBoard[0].length
              ? tempBoard[tempBob.row][tempBob.col + i]
              : -1;
          break;
        case direction.SOUTH:
          crate =
            tempBob.row + i < tempBoard.length
              ? tempBoard[tempBob.row + i][tempBob.col]
              : -1;
          break;
        case direction.WEST:
          crate =
            tempBob.col - i >= 0 ? tempBoard[tempBob.row][tempBob.col - i] : -1;
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

  interface AllData {
    board: number[][];
    bob: Bob;
    isPlaying: boolean;
  }

  const GetAllData = () => {
    const data: AllData = {
      board: getBoard(),
      bob: getBob(),
      isPlaying,
    };

    return JSON.stringify(data);
  };

  const SetAllData = (data: string) => {
    const parsedData = JSON.parse(data) as AllData;
    setBoard(parsedData.board);
    setBob(parsedData.bob);
    setIsPlaying(parsedData.isPlaying);
  };

  // !EXPORTED

  const Init = (seed: string) => {
    if (lastSeed.current === seed) return;

    lastSeed.current = seed;

    const random = seedrandom(seed);

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

  const TurnBob = (direction: number) => {
    setBob({ ...getBob(), direction });
    setScore((score) => score + scores.TURN);
  };

  const MoveBob = () => {
    // deep copy bob
    const tempBob = { ...getBob() };
    // deep copy board
    const tempBoard = getBoard().map((row) => row.slice());

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

  const ExplodeCrate = () => {
    // deep copy bob
    const tempBob = { ...getBob() };
    // deep copy board
    const tempBoard = getBoard().map((row) => row.slice());

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

  const CheckWin = () => {
    if (
      getBob().targetCol === getBob().doorCol &&
      getBob().targetRow === getBoard().length - 1
    ) {
      setIsPlaying(false);
      return true;
    }
    return false;
  };

  const GetScore = () => {
    return score;
  };

  const GetBoard = () => {
    return getBoard();
  };

  const GetBob = () => {
    return getBob();
  };

  const HandleKeyDown = (key: string) => {
    if (!isPlaying) {
      return;
    }

    switch (key) {
      case keycode.W:
      case keycode.UP:
        getBob().direction === direction.NORTH
          ? MoveBob()
          : TurnBob(direction.NORTH);
        break;
      case keycode.A:
      case keycode.LEFT:
        getBob().direction === direction.WEST
          ? MoveBob()
          : TurnBob(direction.WEST);
        break;
      case keycode.S:
      case keycode.DOWN:
        getBob().direction === direction.SOUTH
          ? MoveBob()
          : TurnBob(direction.SOUTH);
        break;
      case keycode.D:
      case keycode.RIGHT:
        getBob().direction === direction.EAST
          ? MoveBob()
          : TurnBob(direction.EAST);
        break;
      case keycode.SPACE:
        ExplodeCrate();
        break;
    }
  };

  const ClearLastSeed = () => {
    lastSeed.current = '';
  };

  return {
    Init,
    TurnBob,
    MoveBob,
    ExplodeCrate,
    CheckWin,
    GetScore,
    GetBoard,
    GetBob,
    GetAllData,
    SetAllData,
    HandleKeyDown,
    ClearLastSeed,
  };
}
