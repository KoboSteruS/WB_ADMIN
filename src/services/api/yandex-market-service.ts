import { ApiClient } from './api-client';
import { AxiosResponse } from 'axios';
import {
  YandexMarketToken,
  YandexMarketTokenCreateRequest,
  YandexMarketTokenUpdateRequest,
  YandexMarketTokenTestResponse,
  YandexMarketStatsParams,
  YandexMarketSalesStatistics,
  YandexMarketProduct,
  YandexMarketOrder
} from '../../types/yandex-market';
import { ApiResponse, PaginationParams } from './types';

/**
 * Сервис для работы с API Яндекс Маркета
 */
export class YandexMarketService {
  private apiClient: ApiClient;
  private baseUrl: string = '/api/v1/yandex-market';

  /**
   * Создает экземпляр сервиса Яндекс Маркета
   * @param apiClient - инстанс ApiClient для выполнения запросов
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Получить список токенов Яндекс Маркета
   * @returns Промис со списком токенов
   */
  async getTokens(): Promise<YandexMarketToken[]> {
    return this.apiClient.get('/yandex-market-tokens/');
  }

  /**
   * Создать новый токен Яндекс Маркета
   * @param data - данные нового токена
   * @returns Промис с созданным токеном
   */
  async createToken(data: YandexMarketTokenCreateRequest): Promise<YandexMarketToken> {
    return this.apiClient.post('/yandex-market-tokens/', data);
  }

  /**
   * Получить токен Яндекс Маркета по ID
   * @param id - ID токена
   * @returns Промис с токеном
   */
  async getTokenById(id: number): Promise<YandexMarketToken> {
    return this.apiClient.get(`/yandex-market-tokens/${id}/`);
  }

  /**
   * Обновить токен Яндекс Маркета
   * @param id - ID токена
   * @param data - данные для обновления
   * @returns Промис с обновленным токеном
   */
  async updateToken(id: number, data: YandexMarketTokenUpdateRequest): Promise<YandexMarketToken> {
    return this.apiClient.put(`/yandex-market-tokens/${id}/`, data);
  }

  /**
   * Удалить токен Яндекс Маркета
   * @param id - ID токена
   * @returns Промис с результатом удаления
   */
  async deleteToken(id: number): Promise<void> {
    return this.apiClient.delete(`/yandex-market-tokens/${id}/`);
  }

  /**
   * Проверить валидность токена Яндекс Маркета
   * @param id - ID токена
   * @returns Промис с результатом проверки
   */
  async testToken(id: number): Promise<YandexMarketTokenTestResponse> {
    return this.apiClient.post(`/yandex-market-tokens/${id}/test/`);
  }

  /**
   * Получить список товаров Яндекс Маркета
   * @param tokenId - ID токена
   * @param params - параметры запроса (фильтры, пагинация)
   * @returns Промис со списком товаров
   */
  async getProducts(tokenId: number, params: Record<string, any> = {}): Promise<ApiResponse<YandexMarketProduct[]>> {
    return this.apiClient.get(`${this.baseUrl}/products`, {
      params: {
        token_id: tokenId,
        ...params
      }
    });
  }

  /**
   * Получить детальную информацию о товаре
   * @param tokenId - Идентификатор токена
   * @param productId - Идентификатор товара
   * @returns Промис с ответом API, содержащим данные товара
   */
  async getProduct(tokenId: number, productId: number): Promise<ApiResponse<YandexMarketProduct>> {
    return this.apiClient.get(`${this.baseUrl}/products/${productId}`, {
      params: { token_id: tokenId }
    });
  }

  /**
   * Получить список заказов Яндекс Маркета
   * @param tokenId - ID токена
   * @param params - параметры запроса (фильтры, пагинация)
   * @returns Промис со списком заказов
   */
  async getOrders(tokenId: number, params: Record<string, any> = {}): Promise<ApiResponse<YandexMarketOrder[]>> {
    return this.apiClient.get(`${this.baseUrl}/orders`, {
      params: {
        token_id: tokenId,
        ...params
      }
    });
  }

  /**
   * Получить заказ по ID
   * @param tokenId - ID токена
   * @param orderId - ID заказа
   * @returns Промис с данными заказа
   */
  async getOrder(tokenId: number, orderId: number): Promise<ApiResponse<YandexMarketOrder>> {
    return this.apiClient.get(`${this.baseUrl}/orders/${orderId}`, {
      params: { token_id: tokenId }
    });
  }

  /**
   * Получить статистику продаж Яндекс Маркета
   * @param params - Параметры запроса статистики
   * @returns Промис с ответом API, содержащим статистику продаж
   */
  async getSalesStatistics(params: YandexMarketStatsParams): Promise<ApiResponse<YandexMarketSalesStatistics>> {
    return this.apiClient.get(`${this.baseUrl}/stats/sales`, {
      params: {
        token_id: params.tokenId,
        date_from: params.dateFrom,
        date_to: params.dateTo
      }
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