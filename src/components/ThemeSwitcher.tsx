import React from 'react';
import useTheme from '../hooks/useTheme';

interface ThemeSwitcherProps {
  /**
   * CSS классы для стилизации компонента
   */
  className?: string;
  
  /**
   * Стиль отображения (кнопка или переключатель)
   */
  variant?: 'button' | 'switch';
  
  /**
   * Размер компонента
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Компонент для переключения между светлой и темной темой
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  className = '', 
  variant = 'button',
  size = 'md'
}) => {
  const { theme, toggleTheme, isLoading } = useTheme();
  
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return '';
    }
  };
  
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'fs-6';
      case 'lg': return 'fs-4';
      default: return 'fs-5';
    }
  };
  
  // Обработчик клика по переключателю темы
  const handleThemeToggle = async () => {
    await toggleTheme();
  };
  
  // Вариант с кнопкой
  if (variant === 'button') {
    return (
      <button
        className={`btn ${theme === 'dark' ? 'btn-dark' : 'btn-light'} ${getButtonSize()} ${className}`}
        onClick={handleThemeToggle}
        disabled={isLoading}
        aria-label="Переключить тему"
        title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
      >
        {isLoading ? (
          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        ) : null}
        <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'} ${getIconSize()}`}></i>
        <span className="ms-2 d-none d-md-inline">
          {theme === 'light' ? 'Темная тема' : 'Светлая тема'}
        </span>
      </button>
    );
  }
  
  // Вариант с переключателем
  return (
    <div className={`form-check form-switch ${className}`}>
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id="themeSwitcher"
        checked={theme === 'dark'}
        onChange={handleThemeToggle}
        disabled={isLoading}
        aria-label="Переключить тему"
      />
      <label className="form-check-label ms-2" htmlFor="themeSwitcher">
        {isLoading ? (
          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        ) : null}
        <i className={`bi ${theme === 'light' ? 'bi-sun' : 'bi-moon'} ${getIconSize()} me-1`}></i>
        {theme === 'light' ? 'Светлая тема' : 'Темная тема'}
      </label>
    </div>
  );
};

export default ThemeSwitcher; 