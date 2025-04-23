import { useThemeContext as importedUseThemeContext } from '../contexts/ThemeContext';

/**
 * Хук для использования контекста темы
 * Реэкспортирует useThemeContext из контекста
 */
export const useThemeContext = () => {
  return importedUseThemeContext();
};

export default useThemeContext; 