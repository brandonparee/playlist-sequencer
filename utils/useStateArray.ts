import { filter, isEqual } from 'lodash';
import { useCallback, useMemo, useState } from 'react';

export default function useStateArray<T>() {
  const [state, setState] = useState<T[]>([]);

  const addItem = useCallback((newItem: T) => {
    setState((prevState) => {
      return [...prevState, newItem];
    });
  }, []);

  const removeItem = useCallback((itemToRemove: T) => {
    setState((prevState) => {
      return filter(
        prevState,
        (singleItem) => !isEqual(singleItem, itemToRemove)
      );
    });
  }, []);

  const reset = useCallback(() => {
    setState([]);
  }, []);

  const setStateValue = useMemo(
    () => ({
      addItem,
      removeItem,
      reset,
    }),
    [addItem, removeItem, reset]
  );

  return [state, setStateValue] as const;
}
