# WB Admin Panel

Административная панель для управления интеграциями с маркетплейсами (Wildberries, Ozon, Яндекс.Маркет).

## Функциональность

- Адаптивная кроссбраузерная административная панель
- Интеграция с популярными маркетплейсами
- Аналитика и отчеты по продажам
- Группировка товаров для удобного анализа
- Управление учетной записью и подписками

## Технологии

- React + TypeScript
- React Router
- React Bootstrap
- Bootstrap 5
- Bootstrap Icons

## Требования

- Node.js 14.0.0 или выше
- npm 6.0.0 или выше

## Установка

1. Клонирование репозитория:
```bash
git clone https://github.com/your-username/wb-admin.git
cd wb-admin
```

2. Установка зависимостей:
```bash
npm install
```

3. Запуск приложения в режиме разработки:
```bash
npm start
```

4. Сборка для production:
```bash
npm run build
```

## Структура проекта

```
src/
├── components/          # Компоненты интерфейса
├── pages/               # Страницы приложения
│   └── marketplaces/    # Компоненты для маркетплейсов
├── assets/              # Статические ресурсы
├── services/            # Сервисы для работы с API
├── hooks/               # Пользовательские хуки
├── utils/               # Вспомогательные функции
└── App.tsx              # Корневой компонент
```

## Необходимые зависимости

Установка зависимостей вручную (если не работает `npm install`):

```bash
npm install react react-dom react-router-dom react-bootstrap bootstrap bootstrap-icons typescript @types/react @types/react-dom @types/react-router-dom
```

## Решение проблем с линтером

Если возникают ошибки линтера типа "Cannot find module 'react-bootstrap' or its corresponding type declarations", убедитесь, что установлены все необходимые зависимости:

```bash
npm install --save @types/react-bootstrap
```

## Скриншоты

### Дашборд

![Дашборд](/screenshots/dashboard.png)

### Настройки маркетплейсов

![Настройки маркетплейсов](/screenshots/marketplace-settings.png)

### Подписки

![Подписки](/screenshots/subscriptions.png)

### Мобильная версия

![Мобильная версия](/screenshots/mobile.png)
