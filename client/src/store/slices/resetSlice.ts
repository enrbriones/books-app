import { createAction } from '@reduxjs/toolkit';

export const RESET_STATE = 'RESET_STATE';

export const resetState = createAction(RESET_STATE);

// Este es un middleware que escuchará la acción de reset
import type { Middleware } from '@reduxjs/toolkit';

export const resetStateMiddleware: Middleware = store => next => action => {
  const result = next(action);
  
  if (resetState.match(action)) {
    // Obtener todos los reducers
    const state = store.getState();
    // Reiniciar cada slice a su estado inicial
    Object.keys(state).forEach((key) => {
      if (key !== 'reset') {
        store.dispatch({ type: `${key}/reset` });
      }
    });
  }
  
  return result;
};
