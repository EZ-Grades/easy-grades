import { useState, useCallback, useRef } from 'react';

/**
 * A hook for managing game state safely to prevent infinite loops
 * and provide consistent game state management across all game components.
 */
export function useGameState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const updateCountRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);
  
  const safeSetState = useCallback((newState: T | ((prev: T) => T)) => {
    const now = Date.now();
    
    // Prevent rapid updates that could cause infinite loops
    if (now - lastUpdateRef.current < 50) { // 50ms minimum between updates
      updateCountRef.current++;
      if (updateCountRef.current > 20) {
        console.warn('Prevented potential infinite loop in game state updates');
        return;
      }
    } else {
      updateCountRef.current = 0;
    }
    
    lastUpdateRef.current = now;
    
    setState(prevState => {
      const nextState = typeof newState === 'function' ? (newState as Function)(prevState) : newState;
      
      // Prevent setting the same state (shallow comparison for objects)
      if (typeof nextState === 'object' && nextState !== null && prevState !== null) {
        if (JSON.stringify(nextState) === JSON.stringify(prevState)) {
          return prevState;
        }
      } else if (nextState === prevState) {
        return prevState;
      }
      
      return nextState;
    });
  }, []);
  
  const resetState = useCallback(() => {
    updateCountRef.current = 0;
    lastUpdateRef.current = 0;
    setState(initialState);
  }, [initialState]);
  
  return [state, safeSetState, resetState] as const;
}

/**
 * A hook specifically for managing turn-based game state
 * to prevent infinite loops in games like TicTacToe.
 */
export function useTurnBasedGame<PlayerType>(
  initialPlayer: PlayerType,
  players: PlayerType[]
) {
  const [currentPlayer, setCurrentPlayer] = useGameState(initialPlayer);
  const [gameActive, setGameActive] = useGameState(true);
  const turnCountRef = useRef(0);
  
  const switchPlayer = useCallback(() => {
    if (!gameActive) return;
    
    turnCountRef.current++;
    
    // Prevent too many rapid turns (safety check)
    if (turnCountRef.current > 100) {
      console.warn('Game ended due to too many turns');
      setGameActive(false);
      return;
    }
    
    setCurrentPlayer(prev => {
      const currentIndex = players.indexOf(prev);
      const nextIndex = (currentIndex + 1) % players.length;
      return players[nextIndex];
    });
  }, [players, gameActive, setCurrentPlayer, setGameActive]);
  
  const resetGame = useCallback(() => {
    turnCountRef.current = 0;
    setCurrentPlayer(initialPlayer);
    setGameActive(true);
  }, [initialPlayer, setCurrentPlayer, setGameActive]);
  
  const endGame = useCallback(() => {
    setGameActive(false);
  }, [setGameActive]);
  
  return {
    currentPlayer,
    gameActive,
    turnCount: turnCountRef.current,
    switchPlayer,
    resetGame,
    endGame
  };
}