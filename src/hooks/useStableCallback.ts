import { useCallback, useRef } from 'react';

/**
 * A hook that provides a stable callback reference that doesn't change between renders
 * even when its dependencies might change. This helps prevent infinite loops in useEffect.
 * 
 * Use this when you need a callback that should be stable but still access current state values.
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback);
  
  // Update the ref with the latest callback
  callbackRef.current = callback;
  
  // Return a stable callback that always calls the latest version
  return useCallback(((...args: any[]) => {
    return callbackRef.current(...args);
  }) as T, []);
}

/**
 * A hook that helps prevent rapid state updates that could cause infinite loops
 * by debouncing state updates.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import { useState, useEffect } from 'react';

/**
 * A hook that provides safe state updates with validation to prevent
 * common patterns that lead to infinite re-renders.
 */
export function useSafeState<T>(
  initialState: T | (() => T),
  validator?: (newValue: T, currentValue: T) => boolean
): [T, (newValue: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialState);
  const updateCountRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);
  
  const safeSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    const now = Date.now();
    
    // Prevent rapid updates (more than 10 per second)
    if (now - lastUpdateRef.current < 100) {
      updateCountRef.current++;
      if (updateCountRef.current > 10) {
        console.warn('Prevented potential infinite loop in state updates');
        return;
      }
    } else {
      updateCountRef.current = 0;
    }
    
    lastUpdateRef.current = now;
    
    setState(prev => {
      const nextValue = typeof newValue === 'function' ? (newValue as Function)(prev) : newValue;
      
      // Run validator if provided
      if (validator && !validator(nextValue, prev)) {
        console.warn('State update blocked by validator');
        return prev;
      }
      
      return nextValue;
    });
  }, [validator]);
  
  return [state, safeSetState];
}

import { useRef } from 'react';