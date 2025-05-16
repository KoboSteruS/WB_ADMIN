import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './common/ThemeSwitcher';
import './Header.css';
import { authService } from '../services/auth/auth-service';

interface SimpleHeaderProps {}

/**
 * Упрощенная версия хедера без использования библиотеки react-bootstrap
 * Используется как временная замена до установки npm-пакетов
 */
const SimpleHeader: React.FC<SimpleHeaderProps> = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Проверяем, использовали ли мы тестовый вход
      if (localStorage.getItem('isAuthenticated') === 'true') {
        // Удаляем тестовые данные
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        
        // Предотвращаем возврат
        window.history.replaceState(null, '', '/login');
        navigate('/login');
        return;
      }
      
      // Если был обычный вход через API
      await authService.logout('/login');
      // После выхода будет перенаправление на страницу логина
      // и невозможно будет вернуться назад
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      // Используем fallback на случай ошибки
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  };

  return (
    <header className="header-navbar fixed-top bg-white">
      <div className="container-fluid px-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Link to="/" className="d-flex align-items-center" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="logo-container me-2">
                <img src="/logo192.png" alt="Логотип" width="30" height="30" />
              </div>
              <span className="brand-name">Analizator.mp</span>
            </Link>
          </div>

          <div className="d-flex align-items-center">
            
            {/* Переключатель темы */}
            <div className="theme-container me-3 d-none d-md-block">
              <ThemeSwitcher variant="icon" size="sm" />
            </div>
          
            
            {/* Аккаунт */}
            <div className="account-container">
              <div className="dropdown">
                <button 
                  className="btn btn-light account-toggle dropdown-toggle"
                  type="button"
                  id="account-dropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="account-img-container me-2">
                    <img 
                      src="/profile-placeholder.png" 
                      alt="Профиль"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/40';
                      }}
                      width="32" 
                      height="32" 
                      className="rounded-circle"
                    />
                  </div>
                  <span className="account-name d-none d-md-inline">Пользователь</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="account-dropdown">
                  <li>
                    <Link to="/account-settings" className="dropdown-item">
                      <i className="bi bi-gear me-2"></i>
                      Настройки аккаунта
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Выход
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader; 