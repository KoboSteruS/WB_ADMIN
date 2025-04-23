# API Клиент и Сервисы

Этот модуль содержит клиент для работы с REST API и набор сервисов для взаимодействия с различными эндпоинтами.

## Структура

- `api-client.ts` - Базовый класс для HTTP-запросов с поддержкой авторизации
- `api-service.ts` - Сервисы для работы с конкретными эндпоинтами API
- `types.ts` - Типы данных для запросов и ответов
- `index.ts` - Экспорт сервисов и типов
- `example-usage.ts` - Примеры использования сервисов в React-компонентах

## API Клиент

`ApiClient` класс предоставляет следующие возможности:

- Базовые HTTP методы (GET, POST, PUT, PATCH, DELETE)
- Автоматическое обновление токена при ошибке 401
- Обработка ошибок API
- Загрузка и скачивание файлов
- Отслеживание прогресса загрузки/скачивания
- Перехватчики запросов и ответов

### Пример использования

```typescript
import apiClient from './api-client';

// GET запрос
const data = await apiClient.get<ResponseType>('/endpoint', { param1: 'value1' });

// POST запрос
const result = await apiClient.post<ResultType>('/endpoint', { field1: 'value1' });

// Загрузка файла
const formData = new FormData();
formData.append('file', fileObject);
const response = await apiClient.uploadFile<UploadResponseType>(
  '/upload',
  formData,
  (progressEvent) => {
    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    console.log(`Прогресс загрузки: ${progress}%`);
  }
);

// Скачивание файла
await apiClient.downloadFile(
  '/download/report',
  { reportId: '123' },
  'report.pdf',
  (progressEvent) => {
    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    console.log(`Прогресс скачивания: ${progress}%`);
  }
);
```

## API Сервис

`ApiService` включает следующие сервисы:

### Авторизация (`auth`)

- `login` - Вход в систему
- `register` - Регистрация нового пользователя
- `logout` - Выход из системы
- `requestPasswordReset` - Запрос на сброс пароля
- `resetPassword` - Сброс пароля
- `verifyEmail` - Подтверждение email
- `isAuthenticated` - Проверка авторизации

### Профиль пользователя (`profile`)

- `getProfile` - Получение профиля
- `updateProfile` - Обновление профиля
- `updateAvatar` - Обновление аватара
- `changePassword` - Изменение пароля
- `setTheme` - Изменение темы интерфейса (светлая/темная)

### Маркетплейсы (`marketplaceCredentials`)

- `getAll` - Получение всех учетных данных
- `getById` - Получение учетных данных по ID
- `create` - Создание новых учетных данных
- `createMultiple` - Массовое создание учетных данных (несколько маркетплейсов)
- `update` - Обновление учетных данных
- `delete` - Удаление учетных данных
- `testConnection` - Проверка подключения

### Подписки (`subscriptions`)

- `getCurrentSubscription` - Получение текущей подписки
- `getAllPlans` - Получение всех планов
- `changePlan` - Смена плана
- `cancelSubscription` - Отмена подписки

### Платежи (`payments`)

- `getTransactions` - История транзакций
- `createPayment` - Создание платежа
- `getPaymentInfo` - Информация о платеже
- `getInvoice` - Получение счета-фактуры

### Аналитика (`analytics`)

- `getSalesData` - Данные о продажах
- `getProductStatistics` - Статистика по продуктам
- `exportToCSV` - Экспорт данных в CSV

### Группы продуктов (`productGroups`)

- `getAll` - Получение всех групп
- `getById` - Получение группы по ID
- `create` - Создание группы
- `update` - Обновление группы
- `delete` - Удаление группы

### Уведомления (`notifications`)

- `getAll` - Получение всех уведомлений
- `markAsRead` - Отметить как прочитанное
- `markAllAsRead` - Отметить все как прочитанные
- `delete` - Удаление уведомления
- `updatePreferences` - Настройка предпочтений

## Работа с маркетплейсами

### Добавление ИНН

Для всех маркетплейсов теперь доступно поле `inn` (ИНН компании). Это поле используется для идентификации компании в системах маркетплейсов.

```typescript
// Пример добавления маркетплейса с ИНН
const credential = await apiService.marketplaceCredentials.create({
  marketplace: MarketplaceType.WILDBERRIES,
  api_key: 'your_api_key',
  inn: '1234567890'
});
```

### Добавление нескольких маркетплейсов

Теперь можно добавлять несколько маркетплейсов одновременно с помощью метода `createMultiple`:

```typescript
// Пример добавления нескольких маркетплейсов
const credentials = await apiService.marketplaceCredentials.createMultiple([
  {
    marketplace: MarketplaceType.WILDBERRIES,
    api_key: 'wb_api_key',
    inn: '1234567890'
  },
  {
    marketplace: MarketplaceType.OZON,
    api_key: 'ozon_api_key',
    client_id: 'ozon_client_id',
    inn: '1234567890'
  }
]);
```

Это позволяет оптимизировать запросы к API и упростить интеграцию с несколькими торговыми площадками.

## Управление темой (светлая/темная)

Теперь приложение поддерживает светлую и темную темы. Предпочтение темы сохраняется в профиле пользователя.

```typescript
// Пример изменения темы через API
await apiService.profile.setTheme('dark');
```

Для удобства работы с темой создан специальный хук `useTheme`:

```tsx
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
    </button>
  );
};
```

Также разработан компонент `ThemeToggle` для удобного переключения тем:

```tsx
import ThemeToggle from '../components/common/ThemeToggle';

const Header = () => {
  return (
    <header>
      <h1>WB Admin</h1>
      <ThemeToggle showText={true} />
    </header>
  );
};
```

## Использование в React-компонентах

Для удобства работы с API, мы создали несколько React-хуков:

- `useAuth` - Авторизация, выход
- `useProfile` - Работа с профилем
- `useMarketplaceCredentials` - Работа с маркетплейсами
- `useAnalytics` - Работа с аналитикой
- `useTheme` - Управление темой (светлая/темная)

Примеры использования хуков смотрите в файле `example-usage.ts`.

## Обработка ошибок

API-клиент автоматически обрабатывает следующие ситуации:

1. Истекший токен авторизации (код 401)
2. Ошибки сети
3. Ошибки API с кодами состояния

При возникновении ошибки 401 происходит попытка обновить токен и повторить запрос.
Если обновление токена не удалось, пользователь перенаправляется на страницу входа.

## Конфигурация

Базовый URL API настраивается в конфигурации окружения в переменной `REACT_APP_API_URL`.
Если переменная не определена, используется URL по умолчанию: `https://api.wb-admin.com/api/v1`.

## Типы данных

Все типы данных для запросов и ответов определены в файле `types.ts`. 