import { useState } from 'react';

export default function useSetHook<T>() {
  const [state, setState] = useState<Set<T>>(() => new Set());

  const addItem = (newItem: T) => {
    setState((prevState) => {
      return new Set(prevState).add(newItem);
    });
  };

  const removeItem = (item: T) => {
    setState((prevState) => {
      const nextSet = new Set(prevState);

      nextSet.delete(item);
      return nextSet;
    });
  };

  return { state, addItem, removeItem, stateAsArray: Array.from(state) };
}
