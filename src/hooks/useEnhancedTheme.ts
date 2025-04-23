import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Типы тем
export type Theme = 'light' | 'dark';

// Типы событий для подписки на изменение темы
type ThemeChangeListener = (theme: Theme) => void;

// Ключ для хранения в localStorage
const THEME_STORAGE_KEY = 'app_theme_preference';

// Глобальное хранилище слушателей
const themeChangeListeners: ThemeChangeListener[] = [];

/**
 * Глобальная функция для получения текущей темы
 * (полезно для использования вне React-компонентов)
 */
export const getCurrentTheme = (): Theme => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  
  // Если тема была сохранена, используем её
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    return savedTheme;
  }
  
  // Иначе используем системные настройки
  try {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch (error) {
    // Если не удалось определить системные настройки, используем светлую тему по умолчанию
    console.error('Ошибка при определении системной темы:', error);
    return 'light';
  }
};

/**
 * Глобальная функция для применения темы к документу
 */
export const applyThemeToDocument = (theme: Theme): void => {
  try {
    // Добавляем класс темы к body
    document.body.setAttribute('data-theme', theme);
    
    // Также добавляем дата-атрибуты для Bootstrap
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    // Сохраняем тему в localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Уведомляем всех слушателей об изменении темы
    themeChangeListeners.forEach(listener => listener(theme));
  } catch (error) {
    console.error('Ошибка при применении темы:', error);
  }
};

/**
 * Глобальная функция для подписки на изменение темы
 */
export const subscribeToThemeChange = (listener: ThemeChangeListener): () => void => {
  themeChangeListeners.push(listener);
  
  // Возвращаем функцию для отписки
  return () => {
    const index = themeChangeListeners.indexOf(listener);
    if (index !== -1) {
      themeChangeListeners.splice(index, 1);
    }
  };
};

/**
 * Расширенный хук для управления темой приложения
 */
export const useEnhancedTheme = () => {
  // Состояние для текущей темы
  const [theme, setThemeState] = useState<Theme>(getCurrentTheme());
  // Состояние для отслеживания загрузки
  const [isLoading, setIsLoading] = useState(false);
  // Состояние для отслеживания ошибок
  const [error, setError] = useState<string | null>(null);

  // Функция установки темы с обновлением всех необходимых состояний
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDocument(newTheme);
  }, []);

  // Применение темы к документу при инициализации
  useEffect(() => {
    applyThemeToDocument(theme);
    
    // Добавляем слушатель изменения системной темы
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        // Применяем системную тему только если пользователь не установил свою
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };
      
      // Добавляем слушатель для современных браузеров
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      // Очистка слушателя при размонтировании
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    } catch (error) {
      console.error('Ошибка при настройке слушателя системной темы:', error);
    }
  }, [setTheme]);

  // Функция для переключения темы
  const toggleTheme = useCallback(async (saveToProfile: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Определяем новую тему
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      
      // Если пользователь авторизован и нужно сохранить в профиле
      if (saveToProfile && apiService && apiService.auth && apiService.auth.isAuthenticated && apiService.auth.isAuthenticated()) {
        try {
          if (apiService.profile && apiService.profile.setTheme) {
            // Сохраняем настройки темы в профиле пользователя
            await apiService.profile.setTheme(newTheme);
          }
        } catch (profileError) {
          console.error('Ошибка при сохранении темы в профиле:', profileError);
          // Продолжаем выполнение, даже если не удалось сохранить тему в профиле
        }
      }
      
      // Устанавливаем новую тему
      setTheme(newTheme);
    } catch (error) {
      console.error('Ошибка при смене темы:', error);
      setError('Не удалось сохранить настройки темы. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }, [theme, setTheme]);

  // Функция для установки конкретной темы
  const setSpecificTheme = useCallback(async (newTheme: Theme, saveToProfile: boolean = false) => {
    if (newTheme === theme) return; // Если тема та же, ничего не делаем
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Если пользователь авторизован и нужно сохранить в профиле
      if (saveToProfile && apiService && apiService.auth && apiService.auth.isAuthenticated && apiService.auth.isAuthenticated()) {
        try {
          if (apiService.profile && apiService.profile.setTheme) {
            // Сохраняем настройки темы в профиле пользователя
            await apiService.profile.setTheme(newTheme);
          }
        } catch (profileError) {
          console.error('Ошибка при сохранении темы в профиле:', profileError);
          // Продолжаем выполнение, даже если не удалось сохранить тему в профиле
        }
      }
      
      // Устанавливаем новую тему
      setTheme(newTheme);
    } catch (error) {
      console.error('Ошибка при смене темы:', error);
      setError('Не удалось сохранить настройки темы. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }, [theme, setTheme]);

  // Загрузка темы из профиля пользователя при авторизации
  const loadThemeFromProfile = useCallback(async () => {
    if (!apiService || !apiService.auth || !apiService.auth.isAuthenticated || !apiService.auth.isAuthenticated()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (apiService.profile && apiService.profile.getProfile) {
        const profile = await apiService.profile.getProfile();
        
        // Если в профиле указана тема, используем её
        if (profile.theme_preference) {
          setTheme(profile.theme_preference as Theme);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке темы из профиля:', error);
      setError('Не удалось загрузить настройки темы из профиля.');
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isLoading,
    error,
    loadThemeFromProfile
  };
};

export default useEnhancedTheme; 