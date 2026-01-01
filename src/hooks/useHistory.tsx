import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseHistoryOptions {
  maxHistory?: number;
}

export function useHistory<T>(
  initialState: T,
  options: UseHistoryOptions = {}
) {
  const { maxHistory = 50 } = options;
  
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track if the last action was an undo/redo to prevent double recording
  const isUndoRedo = useRef(false);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    setHistory(prev => {
      const resolved = typeof newPresent === 'function'
        ? (newPresent as (prev: T) => T)(prev.present)
        : newPresent;

      // Don't add to history if the value hasn't changed
      if (JSON.stringify(resolved) === JSON.stringify(prev.present)) {
        return prev;
      }

      const newPast = [...prev.past, prev.present].slice(-maxHistory);

      return {
        past: newPast,
        present: resolved,
        future: [],
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      isUndoRedo.current = true;

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      isUndoRedo.current = true;

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setHistory({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  const clear = useCallback(() => {
    setHistory(prev => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    reset,
    clear,
    canUndo,
    canRedo,
    historyLength: history.past.length,
    futureLength: history.future.length,
  };
}
