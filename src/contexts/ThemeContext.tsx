import React, { createContext, useContext, ReactNode } from 'react';
import useEnhancedTheme, { Theme } from '../hooks/useEnhancedTheme';

// Интерфейс контекста темы
interface ThemeContextType {
  /** Текущая тема приложения */
  theme: Theme;
  /** Функция для переключения между светлой и темной темой */
  toggleTheme: (saveToProfile?: boolean) => Promise<void>;
  /** Функция для установки конкретной темы */
  setTheme: (theme: Theme, saveToProfile?: boolean) => Promise<void>;
  /** Флаг загрузки при взаимодействии с API */
  isLoading: boolean;
  /** Сообщение об ошибке, если возникла проблема */
  error: string | null;
  /** Функция для загрузки темы из профиля пользователя */
  loadThemeFromProfile: () => Promise<void>;
}

// Создание контекста с начальными значениями
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Провайдер контекста темы, оборачивающий все приложение
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Используем хук для получения всех необходимых функций и состояний
  const themeData = useEnhancedTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Хук для использования контекста темы в компонентах
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext должен использоваться внутри ThemeProvider');
  }
  
  return context;
};

export default ThemeContext; 