import React, { useState, useEffect } from 'react';
import { Navbar, Container, Button, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import ThemeSwitcher from './common/ThemeSwitcher';
import { authService } from '../services/auth/auth-service';
import { useThemeContext } from '../contexts/ThemeContext';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  
  // Получаем данные пользователя из localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Получение инициалов пользователя
  const getUserInitials = () => {
    if (!user) return '?';
    
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '?';
  };
  
  // Получение случайного цвета на основе имени пользователя
  const getAvatarColor = () => {
    if (!user) return '#3498db'; // Цвет по умолчанию
    
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', 
      '#1abc9c', '#e67e22', '#34495e', '#16a085', '#d35400'
    ];
    
    const seed = user.id || user.email || user.name || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
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
    <Navbar fixed="top" className="header-navbar">
      <Container fluid className="px-3">
        <div className="d-flex align-items-center">
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <div className="logo-container me-2">
              <img src="/logo192.png" alt="Логотип" width="30" height="30" />
            </div>
            <span className="brand-name">Analizator.mp</span>
          </Navbar.Brand>
        </div>

        <div className="d-flex align-items-center">
          {/* Аккаунт */}
          <div className="account-container">
            <Dropdown onToggle={(isOpen: boolean) => setShowAccountMenu(isOpen)}>
              <Dropdown.Toggle id="account-dropdown" className="account-toggle">
                <div className="account-img-container me-2">
                  <div 
                    className="user-avatar"
                    style={{ backgroundColor: getAvatarColor() }}
                  >
                    {getUserInitials()}
                  </div>
                </div>
                <span className="account-name d-none d-md-inline">{user ? user.name || user.email : 'Пользователь'}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="account-menu">
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Выход
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header; 