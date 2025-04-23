import React from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import './ThemeSwitcher.css';

interface ThemeSwitcherProps {
  /**
   * CSS классы для стилизации компонента
   */
  className?: string;
  
  /**
   * Стиль отображения (кнопка, переключатель, иконка)
   */
  variant?: 'button' | 'switch' | 'icon';
  
  /**
   * Размер компонента
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Показывать ли текст (для варианта с кнопкой или переключателем)
   */
  showText?: boolean;

  /**
   * Сохранять предпочтения в профиле пользователя
   */
  saveToProfile?: boolean;
}

/**
 * Улучшенный компонент для переключения темы приложения
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  variant = 'button',
  size = 'md',
  showText = true,
  saveToProfile = false
}) => {
  const { theme, toggleTheme, isLoading, error } = useThemeContext();
  
  // Определяем классы размера и иконки в зависимости от настроек
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

  const getIconClass = () => {
    return theme === 'light' ? 'bi-moon' : 'bi-sun';
  };
  
  // Обработчик клика по переключателю темы
  const handleThemeToggle = async () => {
    await toggleTheme(saveToProfile);
  };
  
  // Отображение ошибки
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="theme-switcher-error" title={error}>
        <i className="bi bi-exclamation-triangle-fill text-warning"></i>
      </div>
    );
  };
  
  // Вариант с иконкой (самый компактный)
  if (variant === 'icon') {
    return (
      <div className={`theme-switcher theme-switcher-icon ${className}`}>
        <button
          type="button"
          className={`btn btn-icon ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}
          onClick={handleThemeToggle}
          disabled={isLoading}
          aria-label="Переключить тему"
          title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <i className={`bi ${getIconClass()} ${getIconSize()}`}></i>
          )}
        </button>
        {renderError()}
      </div>
    );
  }
  
  // Вариант с кнопкой
  if (variant === 'button') {
    return (
      <div className={`theme-switcher theme-switcher-button ${className}`}>
        <button
          type="button"
          className={`btn ${theme === 'dark' ? 'btn-dark' : 'btn-light'} ${getButtonSize()}`}
          onClick={handleThemeToggle}
          disabled={isLoading}
          aria-label="Переключить тему"
          title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          ) : (
            <i className={`bi ${getIconClass()} ${getIconSize()} me-2`}></i>
          )}
          {showText && (
            <span className={size === 'sm' ? 'd-none d-md-inline' : ''}>
              {theme === 'light' ? 'Темная тема' : 'Светлая тема'}
            </span>
          )}
        </button>
        {renderError()}
      </div>
    );
  }
  
  // Вариант с переключателем
  return (
    <div className={`theme-switcher theme-switcher-switch ${className}`}>
      <div className="form-check form-switch">
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
        {showText && (
          <label className="form-check-label ms-2" htmlFor="themeSwitcher">
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            ) : (
              <i className={`bi ${getIconClass()} ${getIconSize()} me-1`}></i>
            )}
            {theme === 'light' ? 'Светлая тема' : 'Темная тема'}
          </label>
        )}
      </div>
      {renderError()}
    </div>
  );
};

export default ThemeSwitcher; 