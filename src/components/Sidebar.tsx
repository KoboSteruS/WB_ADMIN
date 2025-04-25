import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import ThemeSwitcher from './common/ThemeSwitcher';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    marketplaces: false
  });

  const toggleSubmenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSubActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <ul className="sidebar-menu">
        <li className={`sidebar-item ${isActive('/') ? 'active' : ''}`}>
          <Link to="/" className="sidebar-link">
            <i className="bi bi-grid me-3"></i>
            <span className="sidebar-text">Dashboard</span>
          </Link>
        </li>
        

        
        <li className={`sidebar-item has-submenu ${isSubActive('/marketplace-settings') ? 'active' : ''}`}>
          <div 
            className={`sidebar-link ${expandedMenus.marketplaces ? 'expanded' : ''}`}
            onClick={() => toggleSubmenu('marketplaces')}
          >
            <i className="bi bi-shop me-3"></i>
            <span className="sidebar-text">Настройки</span>
            <i className={`bi ${expandedMenus.marketplaces ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto submenu-icon`}></i>
          </div>
          
          <ul className={`submenu ${expandedMenus.marketplaces ? 'show' : ''}`}>
            <li className={`sidebar-item ${isActive('/legal-entities') ? 'active' : ''}`}>
              <Link to="/legal-entities" className="sidebar-link">
                <i className="bi bi-building me-3"></i>
                <span className="sidebar-text">Юридические лица</span>
              </Link>
            </li>
            <li className={`submenu-item ${isActive('/marketplace-settings/wildberries') ? 'active' : ''}`}>
              <Link to="/marketplace-settings/wildberries" className="submenu-link">
                <span className="sidebar-text">Wildberries</span>
              </Link>
            </li>
            <li className={`submenu-item ${isActive('/marketplace-settings/ozon') ? 'active' : ''}`}>
              <Link to="/marketplace-settings/ozon" className="submenu-link">
                <span className="sidebar-text">Ozon</span>
              </Link>
            </li>
            <li className={`submenu-item ${isActive('/marketplace-settings/yandex-market') ? 'active' : ''}`}>
              <Link to="/marketplace-settings/yandex-market" className="submenu-link">
                <span className="sidebar-text">YandexMarket</span>
              </Link>
            </li>
          </ul>
        </li>
        
      </ul>
      
      <div className="sidebar-footer">
        <ThemeSwitcher 
          className="mb-3" 
          variant={isOpen ? "switch" : "icon"} 
          showText={isOpen} 
          size="sm"
        />
        <div className="sidebar-footer-content">
          <img 
            src="/logo192.png" 
            alt="Логотип"
            width="24" 
            height="24" 
            className="me-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/24';
            }}
          />
          <span className="sidebar-text app-version">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 