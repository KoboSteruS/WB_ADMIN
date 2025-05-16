import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import ThemeSwitcher from './common/ThemeSwitcher';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSubActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li className={`sidebar-item ${isActive('/') ? 'active' : ''}`}>
          <Link to="/" className="sidebar-link" title="Dashboard">
            <span className="marketplace-badge db">ГЛ</span>
          </Link>
        </li>
        
        <li className={`sidebar-item ${isActive('/legal-entities') ? 'active' : ''}`}>
          <Link to="/legal-entities" className="sidebar-link" title="Юридические лица">
            <span className="marketplace-badge le">ЮР</span>
          </Link>
        </li>
        
        <li className={`sidebar-item ${isSubActive('/marketplace-settings/wildberries') ? 'active' : ''}`}>
          <Link to="/marketplace-settings/wildberries" className="sidebar-link" title="Wildberries">
            <span className="marketplace-badge wb">WB</span>
          </Link>
        </li>
        
        <li className={`sidebar-item ${isSubActive('/marketplace-settings/ozon') ? 'active' : ''}`}>
          <Link to="/marketplace-settings/ozon" className="sidebar-link" title="Ozon">
            <span className="marketplace-badge oz">OZ</span>
          </Link>
        </li>
        
        <li className={`sidebar-item ${isSubActive('/marketplace-settings/yandex-market') ? 'active' : ''}`}>
          <Link to="/marketplace-settings/yandex-market" className="sidebar-link" title="YandexMarket">
            <span className="marketplace-badge ym">YM</span>
          </Link>
        </li>
      </ul>
      
      <div className="sidebar-footer">
        <ThemeSwitcher 
          variant="icon" 
          showText={false} 
          size="sm"
        />
      </div>
    </div>
  );
};

export default Sidebar; 