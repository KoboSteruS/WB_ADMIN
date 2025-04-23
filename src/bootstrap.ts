/**
 * Этот файл обеспечивает загрузку CSS Bootstrap и Bootstrap Icons
 * Все необходимые стили и скрипты встроены непосредственно в приложение
 */

// Расширяем интерфейс Window для TypeScript
declare global {
  interface Window {
    bootstrap?: {
      Tooltip: new (element: Element) => any;
      Popover: new (element: Element) => any;
      Modal?: {
        getInstance: (element: Element) => any;
        new (element: Element): any;
      };
      [key: string]: any;
    };
  }
}

// Функция для создания и добавления тега link с обработкой ошибок
const addStylesheet = (href: string): void => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  
  // Добавляем обработчик ошибки для случая, если CDN недоступен
  link.onerror = () => {
    console.warn(`Не удалось загрузить стили: ${link.href}`);
    // Добавляем базовые стили Bootstrap, если загрузка CDN не сработала
    addFallbackBootstrapStyles();
  };
  
  document.head.appendChild(link);
};

// Загрузка Bootstrap CSS (основной)
addStylesheet('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');

// Загрузка Bootstrap Icons
addStylesheet('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');

// Добавление встроенных стилей для имитации react-bootstrap
const addReactBootstrapStyles = (): void => {
  const style = document.createElement('style');
  style.textContent = `
    /* Встроенные стили для react-bootstrap компонентов */
    .dropdown-toggle.no-caret::after {
      display: none;
    }
    
    .nav-link {
      cursor: pointer;
    }
    
    .card-body .table {
      margin-bottom: 0;
    }
    
    .modal-backdrop {
      z-index: 1040;
    }
    
    .modal {
      z-index: 1050;
    }
    
    .toast-container {
      z-index: 1060;
    }
    
    .card-header-tabs {
      margin-right: -1rem;
      margin-bottom: -0.5rem;
      margin-left: -1rem;
      border-bottom: 0;
    }
    
    .card-header-pills {
      margin-right: -1rem;
      margin-left: -1rem;
    }

    /* Вспомогательные стили для react-bootstrap компонентов */
    .fade {
      transition: opacity 0.15s linear;
    }
    
    .collapse:not(.show) {
      display: none;
    }
    
    .collapsing {
      height: 0;
      overflow: hidden;
      transition: height 0.35s ease;
    }
    
    /* Фиксы для overlay компонентов */
    .overlay-container {
      position: relative;
    }
    
    .tooltip-inner {
      max-width: 200px;
      padding: 0.25rem 0.5rem;
      color: #fff;
      text-align: center;
      background-color: #000;
      border-radius: 0.25rem;
    }
    
    /* Улучшения для навигации */
    .navbar-nav .nav-link.active {
      font-weight: bold;
    }
    
    /* Улучшения для форм */
    .was-validated .form-control:valid,
    .form-control.is-valid {
      border-color: #198754;
      padding-right: calc(1.5em + 0.75rem);
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
    
    .was-validated .form-control:invalid,
    .form-control.is-invalid {
      border-color: #dc3545;
      padding-right: calc(1.5em + 0.75rem);
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
  `;
  document.head.appendChild(style);
};

// Добавляем стили для React Bootstrap сразу
addReactBootstrapStyles();

// Fallback для Bootstrap CSS если CDN недоступен
const addFallbackBootstrapStyles = (): void => {
  const style = document.createElement('style');
  style.textContent = `
    /* Минимальный набор Bootstrap стилей для обеспечения работы приложения */
    :root {
      --bs-primary: #0d6efd;
      --bs-secondary: #6c757d;
      --bs-success: #198754;
      --bs-info: #0dcaf0;
      --bs-warning: #ffc107;
      --bs-danger: #dc3545;
      --bs-light: #f8f9fa;
      --bs-dark: #212529;
    }
    
    .btn {
      display: inline-block;
      font-weight: 400;
      line-height: 1.5;
      text-align: center;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    
    .btn-primary {
      color: #fff;
      background-color: var(--bs-primary);
      border-color: var(--bs-primary);
    }
    
    .btn-secondary {
      color: #fff;
      background-color: var(--bs-secondary);
      border-color: var(--bs-secondary);
    }
    
    .container {
      width: 100%;
      padding-right: 15px;
      padding-left: 15px;
      margin-right: auto;
      margin-left: auto;
    }
    
    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -15px;
      margin-left: -15px;
    }
    
    .col {
      flex-basis: 0;
      flex-grow: 1;
      max-width: 100%;
      padding-right: 15px;
      padding-left: 15px;
    }
    
    .table {
      width: 100%;
      margin-bottom: 1rem;
      color: #212529;
      border-collapse: collapse;
    }
    
    .table th,
    .table td {
      padding: 0.75rem;
      vertical-align: top;
      border-top: 1px solid #dee2e6;
    }
  `;
  document.head.appendChild(style);
};

// Загрузка Bootstrap JavaScript
const addScript = (src: string): void => {
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  
  // Добавляем обработчик ошибки для случая, если CDN недоступен
  script.onerror = () => {
    console.warn(`Не удалось загрузить скрипт: ${script.src}`);
    // Если это Bootstrap JS, добавляем базовые полифилы
    if (script.src.includes('bootstrap.bundle.min.js')) {
      addBootstrapPolyfill();
    }
  };
  
  document.body.appendChild(script);
};

// Загрузка Bootstrap JS (необходима для некоторых компонентов)
addScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js');

// Добавляем базовый полифил для Bootstrap JS
const addBootstrapPolyfill = (): void => {
  const script = document.createElement('script');
  script.textContent = `
    // Минимальный полифил для Bootstrap
    if (!window.bootstrap) {
      window.bootstrap = {
        Tooltip: function(el) {
          this.element = el;
          this.show = function() { console.log('Tooltip show polyfill'); };
          this.hide = function() { console.log('Tooltip hide polyfill'); };
        },
        Popover: function(el) {
          this.element = el;
          this.show = function() { console.log('Popover show polyfill'); };
          this.hide = function() { console.log('Popover hide polyfill'); };
        },
        Modal: function(el) {
          this.element = el;
          this.show = function() {
            if (this.element) {
              this.element.style.display = 'block';
              document.body.classList.add('modal-open');
              const backdrop = document.createElement('div');
              backdrop.className = 'modal-backdrop show';
              document.body.appendChild(backdrop);
            }
          };
          this.hide = function() {
            if (this.element) {
              this.element.style.display = 'none';
              document.body.classList.remove('modal-open');
              const backdrop = document.querySelector('.modal-backdrop');
              if (backdrop) {
                backdrop.parentNode.removeChild(backdrop);
              }
            }
          };
          
          this.element.querySelector('[data-bs-dismiss="modal"]')?.addEventListener('click', () => {
            this.hide();
          });
        }
      };
      
      window.bootstrap.Modal.getInstance = function(el) {
        return new window.bootstrap.Modal(el);
      };
      
      console.log('Bootstrap polyfill initialized');
    }
  `;
  document.body.appendChild(script);
};

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
  try {
    // Инициализация всех тултипов
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (window.bootstrap?.Tooltip) {
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        new window.bootstrap!.Tooltip(tooltipTriggerEl);
      });
    }
    
    // Инициализация всех поповеров
    const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
    if (window.bootstrap?.Popover) {
      popoverTriggerList.forEach((popoverTriggerEl) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        new window.bootstrap!.Popover(popoverTriggerEl);
      });
    }
    
    // Инициализация всех сворачиваемых элементов
    const collapseTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="collapse"]'));
    collapseTriggerList.forEach((collapseTriggerEl: Element) => {
      collapseTriggerEl.addEventListener('click', (event: Event) => {
        event.preventDefault();
        const targetSelector = collapseTriggerEl.getAttribute('data-bs-target') || 
                              (collapseTriggerEl as HTMLAnchorElement).getAttribute('href');
        
        if (targetSelector) {
          const targetElement = document.querySelector(targetSelector);
          
          if (targetElement) {
            if (targetElement.classList.contains('show')) {
              targetElement.classList.remove('show');
              if (targetElement instanceof HTMLElement) {
                targetElement.style.height = '0px';
              }
            } else {
              targetElement.classList.add('show');
              if (targetElement instanceof HTMLElement) {
                targetElement.style.height = targetElement.scrollHeight + 'px';
              }
            }
          }
        }
      });
    });
  } catch (e) {
    console.warn('Ошибка при инициализации Bootstrap компонентов:', e);
  }
});

export default {}; 