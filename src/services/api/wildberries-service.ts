import { ApiClient } from './api-client';
import { AxiosResponse } from 'axios';
import {
  WildberriesToken,
  WildberriesTokenCreateRequest,
  WildberriesTokenUpdateRequest,
  WildberriesTokenTestResponse,
  WildberriesStatsParams,
  WildberriesSalesStatistics,
  WildberriesProduct,
  WildberriesOrder,
  WildberriesSale,
  WildberriesSupply,
  WildberriesProductAnalytics,
  WildberriesWarehouse
} from '../../types/wildberries';
import { ApiResponse, PaginationParams } from './types';

/**
 * Сервис для работы с API Wildberries
 */
export class WildberriesService {
  private apiClient: ApiClient;
  private baseUrl: string = '/api/v1/wildberries';

  /**
   * Создает экземпляр сервиса Wildberries
   * @param apiClient - инстанс ApiClient для выполнения запросов
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Получить список токенов Wildberries
   * @returns Промис со списком токенов
   */
  async getTokens(): Promise<WildberriesToken[]> {
    return this.apiClient.get('/marketplace/wildberries/tokens');
  }

  /**
   * Создать новый токен Wildberries
   * @param data - данные нового токена
   * @returns Промис с созданным токеном
   */
  async createToken(data: WildberriesTokenCreateRequest): Promise<WildberriesToken> {
    return this.apiClient.post('/marketplace/wildberries/tokens', data);
  }

  /**
   * Обновить токен Wildberries
   * @param id - ID токена
   * @param data - данные для обновления
   * @returns Промис с обновленным токеном
   */
  async updateToken(id: number, data: WildberriesTokenUpdateRequest): Promise<WildberriesToken> {
    return this.apiClient.put(`/marketplace/wildberries/tokens/${id}`, data);
  }

  /**
   * Удалить токен Wildberries
   * @param id - ID токена
   * @returns Промис с результатом удаления
   */
  async deleteToken(id: number): Promise<void> {
    return this.apiClient.delete(`/marketplace/wildberries/tokens/${id}`);
  }

  /**
   * Изменить активность токена Wildberries
   * @param id - ID токена
   * @param isActive - флаг активности
   * @returns Промис с обновленным токеном
   */
  async toggleTokenActive(id: number, isActive: boolean): Promise<WildberriesToken> {
    return this.apiClient.patch(`/marketplace/wildberries/tokens/${id}/toggle-active`, { is_active: isActive });
  }

  /**
   * Проверить валидность токена Wildberries
   * @param id - ID токена
   * @returns Промис с результатом проверки
   */
  async testToken(id: number): Promise<WildberriesTokenTestResponse> {
    return this.apiClient.post(`/marketplace/wildberries/tokens/${id}/test`);
  }

  /**
   * Получить список товаров Wildberries
   * @param params - параметры запроса (фильтры, пагинация)
   * @returns Промис со списком товаров
   */
  async getProducts(params: Record<string, any> = {}): Promise<any> {
    return this.apiClient.get('/marketplace/wildberries/products', { params });
  }

  /**
   * Получить список заказов Wildberries
   * @param params - параметры запроса (фильтры, пагинация)
   * @returns Промис со списком заказов
   */
  async getOrders(params: Record<string, any> = {}): Promise<any> {
    return this.apiClient.get('/marketplace/wildberries/orders', { params });
  }

  /**
   * Получить статистику продаж Wildberries
   * @param params - параметры запроса (период, фильтры)
   * @returns Промис со статистикой продаж
   */
  async getSalesStats(params: Record<string, any> = {}): Promise<any> {
    return this.apiClient.get('/marketplace/wildberries/stats/sales', { params });
  }

  /**
   * Получает детальную информацию о товаре Wildberries
   * @param tokenId - Идентификатор токена
   * @param nmId - Идентификатор номенклатуры товара
   * @returns Промис с ответом API, содержащим данные товара
   */
  async getProduct(tokenId: number, nmId: number): Promise<ApiResponse<WildberriesProduct>> {
    return this.apiClient.get(`${this.baseUrl}/products/${nmId}`, {
      params: { token_id: tokenId }
    });
  }

  /**
   * Получает список продаж Wildberries
   * @param tokenId - Идентификатор токена
   * @param dateFrom - Дата начала периода (YYYY-MM-DD)
   * @param dateTo - Дата окончания периода (YYYY-MM-DD)
   * @param params - Параметры пагинации
   * @returns Промис с ответом API, содержащим список продаж
   */
  async getSales(
    tokenId: number,
    dateFrom: string,
    dateTo: string,
    params?: PaginationParams
  ): Promise<ApiResponse<WildberriesSale[]>> {
    return this.apiClient.get(`${this.baseUrl}/sales`, {
      params: {
        token_id: tokenId,
        date_from: dateFrom,
        date_to: dateTo,
        ...params
      }
    });
  }

  /**
   * Получает список поставок Wildberries
   * @param tokenId - Идентификатор токена
   * @param params - Параметры пагинации
   * @returns Промис с ответом API, содержащим список поставок
   */
  async getSupplies(tokenId: number, params?: PaginationParams): Promise<ApiResponse<WildberriesSupply[]>> {
    return this.apiClient.get(`${this.baseUrl}/supplies`, {
      params: { token_id: tokenId, ...params }
    });
  }

  /**
   * Получает информацию о поставке Wildberries
   * @param tokenId - Идентификатор токена
   * @param supplyId - Идентификатор поставки
   * @returns Промис с ответом API, содержащим данные поставки
   */
  async getSupply(tokenId: number, supplyId: string): Promise<ApiResponse<WildberriesSupply>> {
    return this.apiClient.get(`${this.baseUrl}/supplies/${supplyId}`, {
      params: { token_id: tokenId }
    });
  }

  /**
   * Получает список складов Wildberries
   * @param tokenId - Идентификатор токена
   * @returns Промис с ответом API, содержащим список складов
   */
  async getWarehouses(tokenId: number): Promise<ApiResponse<WildberriesWarehouse[]>> {
    return this.apiClient.get(`${this.baseUrl}/warehouses`, {
      params: { token_id: tokenId }
    });
  }

  /**
   * Получает статистику продаж Wildberries
   * @param params - Параметры запроса статистики
   * @returns Промис с ответом API, содержащим статистику продаж
   */
  async getSalesStatistics(params: WildberriesStatsParams): Promise<ApiResponse<WildberriesSalesStatistics>> {
    return this.apiClient.get(`${this.baseUrl}/stats/sales`, {
      params: {
        token_id: params.tokenId,
        date_from: params.dateFrom,
        date_to: params.dateTo
      }
    });
  }

  /**
   * Получает аналитику по товару Wildberries
   * @param tokenId - Идентификатор токена
   * @param nmId - Идентификатор номенклатуры товара
   * @returns Промис с ответом API, содержащим аналитику товара
   */
  async getProductAnalytics(
    tokenId: number,
    nmId: number
  ): Promise<ApiResponse<WildberriesProductAnalytics>> {
    return this.apiClient.get(`${this.baseUrl}/stats/product/${nmId}`, {
      params: { token_id: tokenId }
    });
  }

  /**
   * Экспортирует данные о продажах в CSV
   * @param tokenId - Идентификатор токена
   * @param dateFrom - Дата начала периода (YYYY-MM-DD)
   * @param dateTo - Дата окончания периода (YYYY-MM-DD)
   * @returns Промис с ответом API, содержащим URL для скачивания CSV-файла
   */
  async exportSalesCsv(
    tokenId: number,
    dateFrom: string,
    dateTo: string
  ): Promise<ApiResponse<{ url: string }>> {
    return this.apiClient.post(`${this.baseUrl}/export/sales`, {
      token_id: tokenId,
      date_from: dateFrom,
      date_to: dateTo
    });
  }

  /**
   * Экспортирует данные о товарах в CSV
   * @param tokenId - Идентификатор токена
   * @returns Промис с ответом API, содержащим URL для скачивания CSV-файла
   */
  async exportProductsCsv(tokenId: number): Promise<ApiResponse<{ url: string }>> {
    return this.apiClient.post(`${this.baseUrl}/export/products`, { token_id: tokenId });
  }
} 