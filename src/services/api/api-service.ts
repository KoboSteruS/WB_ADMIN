import apiClient from './api-client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  PaginatedResponse,
  MarketplaceCredential,
  MarketplaceType,
  MarketplaceCredentialRequest,
  SalesData,
  ProductStatistics,
  WildberriesToken,
  OzonToken
} from './types';

/**
 * Сервис для работы с API
 */
export class ApiService {
  /**
   * Сервис аутентификации
   */
  public auth = {
    /**
     * Вход в систему
     * @param data - Данные для авторизации
     */
    login: (data: LoginRequest): Promise<LoginResponse> => {
      return apiClient.post<LoginResponse>('/auth/login', data);
    },

    /**
     * Регистрация нового пользователя
     * @param data - Данные для регистрации
     */
    register: (data: RegisterRequest): Promise<RegisterResponse> => {
      return apiClient.post<RegisterResponse>('/auth/register', data);
    },

    /**
     * Выход из системы
     */
    logout: (): Promise<void> => {
      return apiClient.post<void>('/auth/logout');
    },

    /**
     * Запрос на сброс пароля
     * @param email - Email пользователя
     */
    requestPasswordReset: (email: string): Promise<void> => {
      return apiClient.post<void>('/auth/reset-password/request', { email });
    },

    /**
     * Сброс пароля
     * @param token - Токен для сброса пароля
     * @param password - Новый пароль
     */
    resetPassword: (token: string, password: string): Promise<void> => {
      return apiClient.post<void>('/auth/reset-password/confirm', { token, password });
    },

    /**
     * Подтверждение email
     * @param token - Токен для подтверждения email
     */
    verifyEmail: (token: string): Promise<void> => {
      return apiClient.post<void>('/auth/verify-email', { token });
    },

    /**
     * Проверка, авторизован ли пользователь
     */
    isAuthenticated: (): boolean => {
      return !!localStorage.getItem('access_token');
    }
  };

  /**
   * Сервис для работы с профилем пользователя
   */
  public profile = {
    /**
     * Получение профиля пользователя
     */
    getProfile: (): Promise<UserProfile> => {
      return apiClient.get<UserProfile>('/users/profile');
    },

    /**
     * Обновление профиля пользователя
     * @param data - Данные профиля для обновления
     */
    updateProfile: (data: Partial<UserProfile>): Promise<UserProfile> => {
      return apiClient.put<UserProfile>('/users/profile', data);
    },

    /**
     * Обновление аватара пользователя
     * @param file - Файл изображения аватара
     * @param onProgress - Callback для отслеживания прогресса загрузки
     */
    updateAvatar: (file: File, onProgress?: (progressEvent: any) => void): Promise<UserProfile> => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.uploadFile<UserProfile>('/users/profile/avatar', file, onProgress);
    },

    /**
     * Изменение пароля пользователя
     * @param currentPassword - Текущий пароль
     * @param newPassword - Новый пароль
     */
    changePassword: (currentPassword: string, newPassword: string): Promise<void> => {
      return apiClient.post<void>('/users/profile/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
    },

    /**
     * Изменение темы интерфейса
     * @param theme - Тема интерфейса ('light' или 'dark')
     */
    setTheme: (theme: 'light' | 'dark'): Promise<UserProfile> => {
      return apiClient.post<UserProfile>('/users/profile/theme', { theme_preference: theme });
    }
  };

  /**
   * Сервис для работы с учетными данными маркетплейсов
   */
  public marketplaceCredentials = {
    /**
     * Получение списка всех учетных данных маркетплейсов
     */
    getAll: (): Promise<MarketplaceCredential[]> => {
      return apiClient.get('/marketplace-credentials');
    },

    /**
     * Получение учетных данных по ID
     * @param id - ID учетных данных
     */
    getById: (id: string): Promise<MarketplaceCredential> => {
      return apiClient.get(`/marketplace-credentials/${id}`);
    },

    /**
     * Создание новых учетных данных маркетплейса
     * @param data - Данные для создания
     */
    create: (data: MarketplaceCredentialRequest): Promise<MarketplaceCredential> => {
      return apiClient.post('/marketplace-credentials', data);
    },

    /**
     * Массовое создание учетных данных маркетплейсов
     * @param dataArray - Массив данных для создания
     */
    createMultiple: (dataArray: MarketplaceCredentialRequest[]): Promise<MarketplaceCredential[]> => {
      return apiClient.post('/marketplace-credentials/batch', { credentials: dataArray });
    },

    /**
     * Обновление учетных данных маркетплейса
     * @param id - ID учетных данных
     * @param data - Данные для обновления
     */
    update: (id: string, data: Partial<MarketplaceCredentialRequest>): Promise<MarketplaceCredential> => {
      return apiClient.put(`/marketplace-credentials/${id}`, data);
    },

    /**
     * Удаление учетных данных маркетплейса
     * @param id - ID учетных данных
     */
    delete: (id: string): Promise<void> => {
      return apiClient.delete(`/marketplace-credentials/${id}`);
    },

    /**
     * Получение учетных данных по типу
     * @param type - Тип учетных данных
     */
    getByType: (type: string): Promise<any> => {
      return apiClient.get(`/marketplace-credentials/type/${type}`);
    },

    /**
     * Проверка подключения к маркетплейсу
     * @param type - Тип учетных данных
     */
    test: (type: string): Promise<{ success: boolean; message: string }> => {
      return apiClient.post(`/marketplace-credentials/test`, { type });
    },

    /**
     * Получение токенов Ozon
     */
    getOzonTokens: (): Promise<any> => {
      return apiClient.get('/marketplace/ozon/tokens');
    },

    /**
     * Создание нового токена Ozon
     * @param data - Данные для создания токена Ozon
     */
    createOzonToken: (data: { name: string; token: string }): Promise<any> => {
      return apiClient.post('/marketplace/ozon/tokens', data);
    },

    /**
     * Обновление токена Ozon
     * @param data - Данные для обновления токена Ozon
     */
    updateOzonToken: (data: { id: string; name: string }): Promise<any> => {
      return apiClient.put(`/marketplace/ozon/tokens/${data.id}`, { name: data.name });
    },

    /**
     * Удаление токена Ozon
     * @param id - ID токена
     */
    deleteOzonToken: (id: string): Promise<any> => {
      return apiClient.delete(`/marketplace/ozon/tokens/${id}`);
    },

    /**
     * Переключение активации токена Ozon
     * @param id - ID токена
     * @param isActive - Флаг активации
     */
    toggleOzonTokenActive: (id: string, isActive: boolean): Promise<any> => {
      return apiClient.patch(`/marketplace/ozon/tokens/${id}/toggle-active`, { is_active: isActive });
    },

    /**
     * Проверка работоспособности токена Ozon
     * @param id - ID токена
     */
    testOzonToken: (id: string): Promise<any> => {
      return apiClient.post(`/marketplace/ozon/tokens/${id}/test`);
    },

    /**
     * Проверка подключения учетных данных маркетплейса
     * @param id - ID учетных данных
     */
    testConnection: (id: string): Promise<{ success: boolean; message: string }> => {
      return apiClient.post(`/marketplace-credentials/${id}/test`);
    }
  };

  /**
   * Сервис для работы с аналитикой и статистикой
   */
  public analytics = {
    /**
     * Получение данных о продажах за период
     * @param startDate - Начало периода
     * @param endDate - Конец периода
     * @param marketplaceType - Тип маркетплейса (опционально)
     */
    getSalesData: (
      startDate: string,
      endDate: string,
      marketplaceType?: MarketplaceType
    ): Promise<SalesData> => {
      return apiClient.get<SalesData>('/analytics/sales', {
        start_date: startDate,
        end_date: endDate,
        marketplace_type: marketplaceType
      });
    },

    /**
     * Получение статистики по продуктам
     * @param startDate - Начало периода
     * @param endDate - Конец периода
     * @param page - Номер страницы
     * @param limit - Количество элементов на странице
     */
    getProductStatistics: (
      startDate: string,
      endDate: string,
      page: number = 1,
      limit: number = 20
    ): Promise<PaginatedResponse<ProductStatistics>> => {
      return apiClient.get<PaginatedResponse<ProductStatistics>>('/analytics/products', {
        start_date: startDate,
        end_date: endDate,
        page,
        limit
      });
    },

    /**
     * Экспорт аналитических данных в CSV
     * @param startDate - Начало периода
     * @param endDate - Конец периода
     * @param type - Тип отчета ('sales' | 'products' | 'inventory')
     */
    exportToCSV: (startDate: string, endDate: string, type: 'sales' | 'products' | 'inventory'): Promise<void> => {
      const params = { start_date: startDate, end_date: endDate, type };
      const filename = `${type}-report-${startDate}-${endDate}.csv`;
      return apiClient.downloadFile(`/analytics/export?start_date=${startDate}&end_date=${endDate}&type=${type}`, filename);
    }
  };

  /**
   * Сервис для работы с токенами Wildberries
   */
  public wildberriesTokens = {
    /**
     * Получение всех токенов Wildberries
     */
    getAll: (): Promise<WildberriesToken[]> => {
      return apiClient.get<WildberriesToken[]>('/wb-tokens/');
    },

    /**
     * Получение токена по ID
     * @param id - ID токена
     */
    getById: (id: number): Promise<WildberriesToken> => {
      return apiClient.get<WildberriesToken>(`/wb-tokens/${id}/`);
    },

    /**
     * Создание нового токена Wildberries
     * @param token - Токен API Wildberries
     * @param name - Название токена (например, магазин или тип доступа)
     */
    create: (token: string, name: string): Promise<WildberriesToken> => {
      return apiClient.post<WildberriesToken>('/wb-tokens/', { token, name });
    },

    /**
     * Обновление токена Wildberries
     * @param id - ID токена
     * @param data - Данные для обновления
     */
    update: (id: number, data: Partial<WildberriesToken>): Promise<WildberriesToken> => {
      return apiClient.put<WildberriesToken>(`/wb-tokens/${id}/`, data);
    },

    /**
     * Удаление токена Wildberries
     * @param id - ID токена
     */
    delete: (id: number): Promise<void> => {
      return apiClient.delete<void>(`/wb-tokens/${id}/`);
    },

    /**
     * Проверка работоспособности токена Wildberries
     * @param id - ID токена для проверки
     */
    testConnection: (id: number): Promise<{ success: boolean; message: string }> => {
      return apiClient.post<{ success: boolean; message: string }>(`/wb-tokens/${id}/test/`);
    }
  };

  /**
   * Сервис для работы с токенами Ozon
   */
  public ozonTokens = {
    /**
     * Получение всех токенов Ozon
     */
    getAll: (): Promise<OzonToken[]> => {
      return apiClient.get<OzonToken[]>('/ozon-tokens/');
    },

    /**
     * Получение токена по ID
     * @param id - ID токена
     */
    getById: (id: number): Promise<OzonToken> => {
      return apiClient.get<OzonToken>(`/ozon-tokens/${id}/`);
    },

    /**
     * Создание нового токена Ozon
     * @param clientId - Client ID API Ozon
     * @param apiKey - API Key Ozon
     * @param name - Название токена (например, магазин или тип доступа)
     */
    create: (clientId: string, apiKey: string, name: string): Promise<OzonToken> => {
      return apiClient.post<OzonToken>('/ozon-tokens/', { client_id: clientId, api_key: apiKey, name });
    },

    /**
     * Обновление токена Ozon
     * @param id - ID токена
     * @param data - Данные для обновления
     */
    update: (id: number, data: Partial<OzonToken>): Promise<OzonToken> => {
      return apiClient.put<OzonToken>(`/ozon-tokens/${id}/`, data);
    },

    /**
     * Удаление токена Ozon
     * @param id - ID токена
     */
    delete: (id: number): Promise<void> => {
      return apiClient.delete<void>(`/ozon-tokens/${id}/`);
    },

    /**
     * Проверка работоспособности токена Ozon
     * @param id - ID токена для проверки
     */
    testConnection: (id: number): Promise<{ success: boolean; message: string }> => {
      return apiClient.post<{ success: boolean; message: string }>(`/ozon-tokens/${id}/test/`);
    }
  };
}

export const apiService = new ApiService();
export default apiService; 