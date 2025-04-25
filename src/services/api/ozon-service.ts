import { ApiClient } from './api-client';
import { AxiosResponse } from 'axios';
import { 
  OzonToken, 
  OzonTokenCreateRequest, 
  OzonTokenUpdateRequest 
} from './types';

/**
 * Интерфейс ответа на проверку токена Ozon
 */
export interface OzonTokenTestResponse {
  status: string;
  message: string;
  is_valid: boolean;
}

/**
 * Сервис для работы с API Ozon
 */
export class OzonService {
  private apiClient: ApiClient;
  private baseUrl: string = '/api/v1/ozon';

  /**
   * Создает экземпляр сервиса Ozon
   * @param apiClient - инстанс ApiClient для выполнения запросов
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Получить список токенов Ozon
   * @returns Промис со списком токенов
   */
  async getTokens(): Promise<OzonToken[]> {
    return this.apiClient.get('/marketplace/ozon/tokens');
  }

  /**
   * Создать новый токен Ozon
   * @param data - данные нового токена
   * @returns Промис с созданным токеном
   */
  async createToken(data: OzonTokenCreateRequest): Promise<OzonToken> {
    return this.apiClient.post('/marketplace/ozon/tokens', data);
  }

  /**
   * Обновить токен Ozon
   * @param id - ID токена
   * @param data - данные для обновления
   * @returns Промис с обновленным токеном
   */
  async updateToken(id: number, data: OzonTokenUpdateRequest): Promise<OzonToken> {
    return this.apiClient.put(`/marketplace/ozon/tokens/${id}`, data);
  }

  /**
   * Удалить токен Ozon
   * @param id - ID токена
   * @returns Промис с результатом удаления
   */
  async deleteToken(id: number): Promise<void> {
    return this.apiClient.delete(`/marketplace/ozon/tokens/${id}`);
  }

  /**
   * Изменить активность токена Ozon
   * @param id - ID токена
   * @param isActive - флаг активности
   * @returns Промис с обновленным токеном
   */
  async toggleTokenActive(id: number, isActive: boolean): Promise<OzonToken> {
    return this.apiClient.patch(`/marketplace/ozon/tokens/${id}/toggle-active`, { is_active: isActive });
  }

  /**
   * Проверить валидность токена Ozon
   * @param id - ID токена
   * @returns Промис с результатом проверки
   */
  async testToken(id: number): Promise<OzonTokenTestResponse> {
    return this.apiClient.post(`/marketplace/ozon/tokens/${id}/test`);
  }

  /**
   * Получить список товаров Ozon
   * @param params - параметры запроса (фильтры, пагинация)
   * @returns Промис со списком товаров
   */
  async getProducts(params: Record<string, any> = {}): Promise<any> {
    return this.apiClient.get('/marketplace/ozon/products', { params });
  }

  /**
   * Получить список заказов Ozon
   * @param params - параметры запроса (фильтры, пагинация)
   * @returns Промис со списком заказов
   */
  async getOrders(params: Record<string, any> = {}): Promise<any> {
    return this.apiClient.get('/marketplace/ozon/orders', { params });
  }

  /**
   * Получить статистику продаж Ozon
   * @param params - параметры запроса (период, фильтры)
   * @returns Промис со статистикой продаж
   */
  async getSalesStats(params: Record<string, any> = {}): Promise<any> {
    return this.apiClient.get('/marketplace/ozon/stats/sales', { params });
  }
} 