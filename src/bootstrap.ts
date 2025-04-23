/**
 * Этот файл обеспечивает загрузку CSS Bootstrap и Bootstrap Icons через CDN
 * Используется как временная альтернатива установке npm-пакетов
 */

// Функция для создания и добавления тега link
const addStylesheet = (href: string): void => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

// Загрузка Bootstrap CSS
addStylesheet('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');

// Загрузка Bootstrap Icons
addStylesheet('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');

// Дополнительные стили для имитации react-bootstrap
addStylesheet('https://cdn.jsdelivr.net/npm/bootstrap-react-bridge@1.0.0/css/bridge.min.css');

// Загрузка Bootstrap JavaScript
const addScript = (src: string): void => {
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  document.body.appendChild(script);
};

// Загрузка Bootstrap JS (необходима для некоторых компонентов)
addScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js');

// Добавление специальных скриптов для имитации react-bootstrap компонентов
addScript('https://cdn.jsdelivr.net/npm/bootstrap-react-bridge@1.0.0/js/bridge.min.js');

// Добавление глобальных стилей для бесшовной интеграции
const addGlobalStyles = (): void => {
  const style = document.createElement('style');
  style.textContent = `
    /* Фикс для Navbar.Brand */
    .navbar-brand a { 
      text-decoration: none; 
      color: inherit; 
    }
    
    /* Фикс для Card компонентов */
    .card-header h5, .card-header h6 {
      margin-bottom: 0;
    }
    
    /* Фикс для Dropdown компонентов */
    .dropdown-toggle::after {
      display: inline-block;
      margin-left: 0.255em;
      vertical-align: 0.255em;
      content: "";
      border-top: 0.3em solid;
      border-right: 0.3em solid transparent;
      border-bottom: 0;
      border-left: 0.3em solid transparent;
    }
    
    /* Стили для Badges */
    .badge.notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      font-size: 0.6rem;
    }
  `;
  document.head.appendChild(style);
};

addGlobalStyles();

// Функция инициализации компонентов bootstrap
window.addEventListener('DOMContentLoaded', () => {
  // Инициализация всех тултипов
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map((tooltipTriggerEl) => {
    return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Инициализация всех поповеров
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map((popoverTriggerEl) => {
    return new (window as any).bootstrap.Popover(popoverTriggerEl);
  });
});

export default {}; 