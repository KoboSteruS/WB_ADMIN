import apiClient from './apiClient';
import {
  LoginRequest,
  LoginResponse,
  UserProfile,
  MarketplaceCredential,
  MarketplaceCredentialRequest,
  Subscription,
  SubscriptionPlan,
  Transaction,
  PaymentRequest,
  PaymentResponse,
  SalesData,
  ProductStatistics,
  ProductGroup,
  ProductGroupRequest,
  Notification,
  PaginatedResponse
} from './types';

/**
 * Сервис авторизации
 */
export const authService = {
  /**
   * Вход в систему
   */
  login: (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.login(credentials);
  },

  /**
   * Выход из системы
   */
  logout: (): void => {
    apiClient.logout();
  },

  /**
   * Получение информации о текущем пользователе
   */
  getCurrentUser: (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>('/users/me');
  },

  /**
   * Обновление профиля пользователя
   */
  updateProfile: (data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiClient.patch<UserProfile>('/users/me', data);
  },

  /**
   * Проверка авторизации
   */
  isAuthenticated: (): boolean => {
    return apiClient.isAuthenticated();
  }
};

/**
 * Сервис для работы с маркетплейсами
 */
export const marketplaceService = {
  /**
   * Получение всех данных для авторизации маркетплейсов
   */
  getCredentials: (): Promise<MarketplaceCredential[]> => {
    return apiClient.get<MarketplaceCredential[]>('/marketplaces/credentials');
  },

  /**
   * Получение данных для конкретного маркетплейса
   */
  getCredentialById: (id: string): Promise<MarketplaceCredential> => {
    return apiClient.get<MarketplaceCredential>(`/marketplaces/credentials/${id}`);
  },

  /**
   * Добавление новых данных для маркетплейса
   */
  createCredential: (data: MarketplaceCredentialRequest): Promise<MarketplaceCredential> => {
    return apiClient.post<MarketplaceCredential>('/marketplaces/credentials', data);
  },

  /**
   * Обновление данных для маркетплейса
   */
  updateCredential: (id: string, data: MarketplaceCredentialRequest): Promise<MarketplaceCredential> => {
    return apiClient.put<MarketplaceCredential>(`/marketplaces/credentials/${id}`, data);
  },

  /**
   * Удаление данных для маркетплейса
   */
  deleteCredential: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/marketplaces/credentials/${id}`);
  }
};

/**
 * Сервис подписок
 */
export const subscriptionService = {
  /**
   * Получение текущей подписки пользователя
   */
  getCurrentSubscription: (): Promise<Subscription> => {
    return apiClient.get<Subscription>('/subscriptions/current');
  },

  /**
   * Получение всех доступных планов подписок
   */
  getSubscriptionPlans: (): Promise<SubscriptionPlan[]> => {
    return apiClient.get<SubscriptionPlan[]>('/subscriptions/plans');
  },

  /**
   * Изменение текущего плана подписки
   */
  changePlan: (planId: string): Promise<Subscription> => {
    return apiClient.post<Subscription>('/subscriptions/change', { plan_id: planId });
  },

  /**
   * Отмена текущей подписки
   */
  cancelSubscription: (): Promise<void> => {
    return apiClient.post<void>('/subscriptions/cancel');
  }
};

/**
 * Сервис финансов
 */
export const financeService = {
  /**
   * Получение истории транзакций с пагинацией
   */
  getTransactions: (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Transaction>> => {
    return apiClient.get<PaginatedResponse<Transaction>>('/finance/transactions', { page, limit });
  },

  /**
   * Создание запроса на оплату
   */
  createPayment: (request: PaymentRequest): Promise<PaymentResponse> => {
    return apiClient.post<PaymentResponse>('/finance/payment', request);
  },

  /**
   * Получение баланса пользователя
   */
  getBalance: (): Promise<{ balance: number }> => {
    return apiClient.get<{ balance: number }>('/finance/balance');
  }
};

/**
 * Сервис аналитики
 */
export const analyticsService = {
  /**
   * Получение данных о продажах за период
   */
  getSalesData: (startDate: string, endDate: string, marketplaceId?: string): Promise<SalesData> => {
    return apiClient.get<SalesData>('/analytics/sales', { 
      start_date: startDate, 
      end_date: endDate,
      marketplace_id: marketplaceId
    });
  },

  /**
   * Получение статистики по товарам с пагинацией
   */
  getProductsStatistics: (
    page: number = 1, 
    limit: number = 10, 
    startDate: string, 
    endDate: string,
    marketplaceId?: string
  ): Promise<PaginatedResponse<ProductStatistics>> => {
    return apiClient.get<PaginatedResponse<ProductStatistics>>('/analytics/products', {
      page,
      limit,
      start_date: startDate,
      end_date: endDate,
      marketplace_id: marketplaceId
    });
  },

  /**
   * Экспорт данных в CSV
   */
  exportData: (startDate: string, endDate: string, marketplaceId?: string): Promise<{ url: string }> => {
    return apiClient.get<{ url: string }>('/analytics/export', {
      start_date: startDate,
      end_date: endDate,
      marketplace_id: marketplaceId
    });
  }
};

/**
 * Сервис для работы с группами товаров
 */
export const productGroupService = {
  /**
   * Получение всех групп товаров с пагинацией
   */
  getProductGroups: (page: number = 1, limit: number = 10): Promise<PaginatedResponse<ProductGroup>> => {
    return apiClient.get<PaginatedResponse<ProductGroup>>('/product-groups', { page, limit });
  },

  /**
   * Получение группы товаров по ID
   */
  getProductGroupById: (id: string): Promise<ProductGroup> => {
    return apiClient.get<ProductGroup>(`/product-groups/${id}`);
  },

  /**
   * Создание новой группы товаров
   */
  createProductGroup: (data: ProductGroupRequest): Promise<ProductGroup> => {
    return apiClient.post<ProductGroup>('/product-groups', data);
  },

  /**
   * Обновление группы товаров
   */
  updateProductGroup: (id: string, data: Partial<ProductGroupRequest>): Promise<ProductGroup> => {
    return apiClient.patch<ProductGroup>(`/product-groups/${id}`, data);
  },

  /**
   * Удаление группы товаров
   */
  deleteProductGroup: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/product-groups/${id}`);
  }
};

/**
 * Сервис для работы с уведомлениями
 */
export const notificationService = {
  /**
   * Получение всех уведомлений с пагинацией
   */
  getNotifications: (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Notification>> => {
    return apiClient.get<PaginatedResponse<Notification>>('/notifications', { page, limit });
  },

  /**
   * Получение количества непрочитанных уведомлений
   */
  getUnreadCount: (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },

  /**
   * Отметка уведомления как прочитанного
   */
  markAsRead: (id: string): Promise<void> => {
    return apiClient.post<void>(`/notifications/${id}/read`);
  },

  /**
   * Отметка всех уведомлений как прочитанных
   */
  markAllAsRead: (): Promise<void> => {
    return apiClient.post<void>('/notifications/read-all');
  }
};

/**
 * Сервис для работы с Яндекс Маркетом
 */
export const yandexMarketService = {
  /**
   * Получение всех токенов Яндекс Маркета
   */
  getTokens: (): Promise<any[]> => {
    return apiClient.get<any[]>('/yandex-market-tokens/');
  },

  /**
   * Получение токена по ID
   */
  getTokenById: (id: number): Promise<any> => {
    return apiClient.get<any>(`/yandex-market-tokens/${id}/`);
  },

  /**
   * Создание нового токена
   */
  createToken: (campaignId: number, apiKey: string, accountIp: number): Promise<any> => {
    return apiClient.post<any>('/yandex-market-tokens/', { 
      campaign_id: campaignId, 
      api_key: apiKey, 
      account_ip: accountIp 
    });
  },

  /**
   * Обновление токена
   */
  updateToken: (id: number, data: any): Promise<any> => {
    return apiClient.put<any>(`/yandex-market-tokens/${id}/`, data);
  },

  /**
   * Удаление токена
   */
  deleteToken: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/yandex-market-tokens/${id}/`);
  },

  /**
   * Получение заказов
   */
  getOrders: (tokenId: number, params = {}): Promise<any> => {
    return apiClient.get<any>('/yandex-market/orders', { 
      token_id: tokenId,
      ...params 
    });
  },

  /**
   * Получение товаров
   */
  getProducts: (tokenId: number, params = {}): Promise<any> => {
    return apiClient.get<any>('/yandex-market/products', { 
      token_id: tokenId,
      ...params 
    });
  },

  /**
   * Получение статистики продаж
   */
  getSalesStats: (tokenId: number, dateFrom: string, dateTo: string): Promise<any> => {
    return apiClient.get<any>('/yandex-market/stats/sales', { 
      token_id: tokenId,
      date_from: dateFrom,
      date_to: dateTo
    });
  }
};

export default {
  auth: authService,
  marketplace: marketplaceService,
  subscription: subscriptionService,
  finance: financeService,
  analytics: analyticsService,
  productGroup: productGroupService,
  notification: notificationService,
  yandexMarket: yandexMarketService
}; 