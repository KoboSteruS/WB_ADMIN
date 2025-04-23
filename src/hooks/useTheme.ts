import { useState, useEffect } from 'react';
import apiService from '../services/api';

// Типы тем
type Theme = 'light' | 'dark';

// Ключ для хранения темы в localStorage
const THEME_STORAGE_KEY = 'theme';

/**
 * Хук для управления темой приложения
 * 
 * @returns {Object} - Объект с текущей темой и функцией для переключения темы
 */
export const useTheme = () => {
  // Получаем сохраненную тему из localStorage или используем системные настройки
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    
    // Если тема была сохранена, используем её
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Иначе используем системные настройки
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  // Состояние для текущей темы
  const [theme, setTheme] = useState<Theme>(getInitialTheme());
  // Состояние для отслеживания загрузки
  const [isLoading, setIsLoading] = useState(false);

  // Применение темы к документу
  useEffect(() => {
    // Добавляем класс темы к body
    document.body.setAttribute('data-theme', theme);
    
    // Также добавляем дата-атрибуты для Bootstrap
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    // Сохраняем тему в localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
  }, [theme]);

  // Функция для переключения темы
  const toggleTheme = async (saveToProfile: boolean = false) => {
    setIsLoading(true);
    
    try {
      // Определяем новую тему
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      
      // Если пользователь авторизован и нужно сохранить в профиле
      if (saveToProfile && apiService.auth && apiService.auth.isAuthenticated && apiService.auth.isAuthenticated()) {
        try {
          if (apiService.profile && apiService.profile.setTheme) {
            // Сохраняем настройки темы в профиле пользователя
            await apiService.profile.setTheme(newTheme);
          }
        } catch (error) {
          console.error('Ошибка при сохранении темы в профиле:', error);
          // Продолжаем выполнение, даже если не удалось сохранить тему в профиле
        }
      }
      
      // Устанавливаем новую тему
      setTheme(newTheme);
    } catch (error) {
      console.error('Ошибка при смене темы:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для установки конкретной темы
  const setSpecificTheme = async (newTheme: Theme, saveToProfile: boolean = false) => {
    if (newTheme === theme) return; // Если тема та же, ничего не делаем
    
    setIsLoading(true);
    
    try {
      // Если пользователь авторизован и нужно сохранить в профиле
      if (saveToProfile && apiService.auth && apiService.auth.isAuthenticated && apiService.auth.isAuthenticated()) {
        try {
          if (apiService.profile && apiService.profile.setTheme) {
            // Сохраняем настройки темы в профиле пользователя
            await apiService.profile.setTheme(newTheme);
          }
        } catch (error) {
          console.error('Ошибка при сохранении темы в профиле:', error);
          // Продолжаем выполнение, даже если не удалось сохранить тему в профиле
        }
      }
      
      // Устанавливаем новую тему
      setTheme(newTheme);
    } catch (error) {
      console.error('Ошибка при смене темы:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка темы из профиля пользователя при авторизации
  const loadThemeFromProfile = async () => {
    try {
      if (apiService.auth && apiService.auth.isAuthenticated && apiService.auth.isAuthenticated() && 
          apiService.profile && apiService.profile.getProfile) {
        const profile = await apiService.profile.getProfile();
        
        // Если в профиле указана тема, используем её
        if (profile.theme_preference) {
          setTheme(profile.theme_preference);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке темы из профиля:', error);
    }
  };

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isLoading,
    loadThemeFromProfile
  };
};

export default useTheme; 