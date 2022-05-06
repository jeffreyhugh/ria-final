import { useState } from 'react';

export default function useSynchronousState<T>(
  initialState: T
): [() => T, (state: T) => T] {
  const [syncState, setSyncState] = useState(initialState);

  let current = syncState;

  const get = () => current;

  const set = (newState: T): T => {
    current = newState;
    setSyncState(newState);
    return current;
  };

  return [get, set];
}
