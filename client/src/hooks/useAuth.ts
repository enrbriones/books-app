import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetState } from '../store/slices/resetSlice';

interface AuthToken {
  token: string | null;
  expiresAt?: number;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getToken = useCallback((): string | null => {
    const authData = localStorage.getItem('authToken');
    if (!authData) {
      navigate('/login', { replace: true });
      return null;
    }

    try {
      const parsedData = JSON.parse(authData) as AuthToken;
      if (parsedData.expiresAt && parsedData.expiresAt < Date.now()) {
        localStorage.removeItem('authToken');
        navigate('/login', { replace: true });
        return null;
      }
      return parsedData.token;
    } catch {
      // Si el token no está en formato JSON (versión antigua), devolverlo tal cual
      return authData;
    }
  }, [navigate]);

  const setToken = useCallback((token: string, expiresIn?: number) => {
    const authData: AuthToken = {
      token,
      ...(expiresIn && { expiresAt: Date.now() + expiresIn * 1000 })
    };
    localStorage.setItem('authToken', JSON.stringify(authData));
  }, []);

  const removeToken = useCallback(() => {
    localStorage.removeItem('authToken');
    dispatch(resetState());
  }, [dispatch]);

  const isAuthenticated = useCallback(() => {
    return !!getToken();
  }, [getToken]);

  const handleAuthError = useCallback(() => {
    removeToken();
    navigate('/login');
  }, [navigate, removeToken]);

  return {
    getToken,
    setToken,
    removeToken,
    isAuthenticated,
    handleAuthError
  };
};
