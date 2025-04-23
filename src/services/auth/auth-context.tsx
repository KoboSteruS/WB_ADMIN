import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../../types/auth';
import { authService } from './auth-service';
import { useNavigate } from 'react-router-dom';

/**
 * Начальное состояние аутентификации
 */
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

/**
 * Интерфейс контекста аутентификации
 */
interface AuthContextType extends AuthState {
  /** Авторизация пользователя */
  login: (username: string, password: string) => Promise<void>;
  /** Выход из системы */
  logout: () => Promise<void>;
  /** Регистрация нового пользователя */
  register: (username: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  /** Обновление данных пользователя */
  updateUser: (userData: Partial<User>) => Promise<void>;
  /** Изменение пароля пользователя */
  changePassword: (currentPassword: string, newPassword: string, newPasswordConfirm: string) => Promise<void>;
  /** Сброс пароля пользователя */
  resetPassword: (email: string) => Promise<void>;
  /** Подтверждение сброса пароля */
  confirmResetPassword: (token: string, uid: string, newPassword: string, newPasswordConfirm: string) => Promise<void>;
  /** Сброс ошибки */
  clearError: () => void;
}

/**
 * Создание контекста аутентификации
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Провайдер контекста аутентификации
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const navigate = useNavigate();

  /**
   * Установить ошибку аутентификации
   * @param message - сообщение об ошибке
   */
  const setError = (message: string) => {
    setAuthState(prev => ({ ...prev, error: message }));
  };

  /**
   * Очистить ошибку аутентификации
   */
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  /**
   * Загрузка данных текущего пользователя
   */
  const loadUser = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const user = await authService.getCurrentUser();
      
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке пользователя:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Не удалось загрузить данные пользователя',
      });
    }
  };

  /**
   * Авторизация пользователя
   * @param username - имя пользователя
   * @param password - пароль
   */
  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.login(username, password);
      await loadUser();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Ошибка при входе:', error);
      setError(error?.response?.data?.detail || 'Ошибка при входе в систему');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Выход из системы
   */
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await authService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Регистрация нового пользователя
   * @param username - имя пользователя
   * @param email - email пользователя
   * @param password - пароль
   * @param passwordConfirm - подтверждение пароля
   */
  const register = async (username: string, email: string, password: string, passwordConfirm: string) => {
    try {
      if (password !== passwordConfirm) {
        throw new Error('Пароли не совпадают');
      }
      
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.register({ username, email, password, passwordConfirm });
      navigate('/login', { state: { message: 'Регистрация успешна. Пожалуйста, войдите в систему.' } });
    } catch (error: any) {
      console.error('Ошибка при регистрации:', error);
      setError(error?.response?.data?.detail || error?.message || 'Ошибка при регистрации');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Обновление данных пользователя
   * @param userData - данные пользователя для обновления
   */
  const updateUser = async (userData: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const updatedUser = await authService.updateUser(userData);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Ошибка при обновлении пользователя:', error);
      setError(error?.response?.data?.detail || 'Ошибка при обновлении данных пользователя');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Изменение пароля пользователя
   * @param currentPassword - текущий пароль
   * @param newPassword - новый пароль
   * @param newPasswordConfirm - подтверждение нового пароля
   */
  const changePassword = async (currentPassword: string, newPassword: string, newPasswordConfirm: string) => {
    try {
      if (newPassword !== newPasswordConfirm) {
        throw new Error('Новые пароли не совпадают');
      }
      
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      console.error('Ошибка при изменении пароля:', error);
      setError(error?.response?.data?.detail || error?.message || 'Ошибка при изменении пароля');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Запрос на сброс пароля
   * @param email - email пользователя
   */
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.resetPassword({ email });
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      console.error('Ошибка при запросе сброса пароля:', error);
      setError(error?.response?.data?.detail || 'Ошибка при запросе сброса пароля');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Подтверждение сброса пароля
   * @param token - токен для сброса пароля
   * @param uid - идентификатор пользователя
   * @param newPassword - новый пароль
   * @param newPasswordConfirm - подтверждение нового пароля
   */
  const confirmResetPassword = async (token: string, uid: string, newPassword: string, newPasswordConfirm: string) => {
    try {
      if (newPassword !== newPasswordConfirm) {
        throw new Error('Пароли не совпадают');
      }
      
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.confirmResetPassword({
        token,
        uid,
        newPassword,
        newPasswordConfirm,
      });
      navigate('/login', { state: { message: 'Пароль успешно изменен. Пожалуйста, войдите в систему.' } });
    } catch (error: any) {
      console.error('Ошибка при подтверждении сброса пароля:', error);
      setError(error?.response?.data?.detail || error?.message || 'Ошибка при сбросе пароля');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Загрузка данных пользователя при инициализации
   */
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        updateUser,
        changePassword,
        resetPassword,
        confirmResetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Хук для использования контекста аутентификации
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 