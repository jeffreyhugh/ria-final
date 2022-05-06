import { useHotkeys } from 'react-hotkeys-hook';

import { GameState } from './game';
import { keycode } from './game_const';

const useGameStateHotkeys = (gameState: GameState) => {
  useHotkeys(keycode.W, () => gameState.HandleKeyDown(keycode.W));
  useHotkeys(keycode.A, () => gameState.HandleKeyDown(keycode.A));
  useHotkeys(keycode.S, () => gameState.HandleKeyDown(keycode.S));
  useHotkeys(keycode.D, () => gameState.HandleKeyDown(keycode.D));
  useHotkeys(keycode.UP, () => gameState.HandleKeyDown(keycode.UP));
  useHotkeys(keycode.LEFT, () => gameState.HandleKeyDown(keycode.LEFT));
  useHotkeys(keycode.DOWN, () => gameState.HandleKeyDown(keycode.DOWN));
  useHotkeys(keycode.RIGHT, () => gameState.HandleKeyDown(keycode.RIGHT));
  useHotkeys(keycode.SPACE, () => gameState.HandleKeyDown(keycode.SPACE));
};

export default useGameStateHotkeys;
