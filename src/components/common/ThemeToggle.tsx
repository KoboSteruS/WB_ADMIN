import React from 'react';
import useTheme from '../../hooks/useTheme';

interface ThemeToggleProps {
  /**
   * Класс для стилизации контейнера
   */
  className?: string;
  
  /**
   * Показывать ли текст рядом с переключателем
   */
  showText?: boolean;
}

/**
 * Компонент для переключения между темной и светлой темами
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showText = false }) => {
  const { theme, toggleTheme, isLoading } = useTheme();
  
  return (
    <div className={`theme-toggle d-flex align-items-center ${className}`}>
      {showText && (
        <span className="me-2">
          {theme === 'light' ? 'Светлая тема' : 'Темная тема'}
        </span>
      )}
      
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => toggleTheme()}
        disabled={isLoading}
        aria-label="Переключить тему"
        title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
      >
        {isLoading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ) : theme === 'light' ? (
          <i className="bi bi-moon-fill"></i>
        ) : (
          <i className="bi bi-sun-fill"></i>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle; 