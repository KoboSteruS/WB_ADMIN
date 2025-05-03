/**
 * Сервис для работы с API Wildberries
 * Предоставляет методы для взаимодействия с Wildberries API
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  WbOrder, 
  WbOrdersResponse, 
  WildberriesToken, 
  WildberriesTokenCreateRequest,
  WildberriesTokenUpdateRequest,
  WildberriesTokenTestResponse,
  ChangeStatusRequest,
  WildberriesSupply,
  ShippingRequest
} from '../types/wildberries';
import { getContextLogger } from '../utils/logger';

/**
 * Логгер модуля
 */
const logger = getContextLogger('WildberriesService');

/**
 * Базовый URL для API
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Класс сервиса Wildberries
 */
export class WildberriesService {
  private api: AxiosInstance;
  
  /**
   * Конструктор сервиса
   * @param token - Optional JWT токен для авторизации
   */
  constructor(token?: string) {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    // Добавляем перехватчик для обработки ошибок
    this.api.interceptors.response.use(
      response => {
        logger.debug('Успешный ответ API', { 
          url: response.config.url,
          method: response.config.method,
          status: response.status
        });
        return response;
      },
      error => {
        logger.error('Ошибка API Wildberries', { 
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
    
    logger.info('WildberriesService инициализирован', { withToken: !!token });
  }
  
  /**
   * Получение всех токенов Wildberries
   */
  async getTokens(): Promise<WildberriesToken[]> {
    logger.debug('Запрос всех токенов');
    const response = await this.api.get<WildberriesToken[]>('/wildberries/tokens');
    logger.debug('Получены токены', { count: response.data.length });
    return response.data;
  }
  
  /**
   * Получение токена по ID
   * @param id - ID токена
   */
  async getToken(id: number): Promise<WildberriesToken> {
    logger.debug('Запрос токена по ID', { id });
    const response = await this.api.get<WildberriesToken>(`/wildberries/tokens/${id}`);
    return response.data;
  }
  
  /**
   * Создание нового токена
   * @param tokenData - Данные для создания токена
   */
  async createToken(tokenData: WildberriesTokenCreateRequest): Promise<WildberriesToken> {
    logger.info('Создание нового токена', { name: tokenData.name });
    const response = await this.api.post<WildberriesToken>('/wildberries/tokens', tokenData);
    logger.info('Токен успешно создан', { id: response.data.id });
    return response.data;
  }
  
  /**
   * Обновление токена
   * @param id - ID токена
   * @param tokenData - Данные для обновления
   */
  async updateToken(id: number, tokenData: WildberriesTokenUpdateRequest): Promise<WildberriesToken> {
    logger.info('Обновление токена', { id, ...tokenData });
    const response = await this.api.put<WildberriesToken>(`/wildberries/tokens/${id}`, tokenData);
    logger.info('Токен успешно обновлен', { id });
    return response.data;
  }
  
  /**
   * Удаление токена
   * @param id - ID токена
   */
  async deleteToken(id: number): Promise<void> {
    logger.warn('Удаление токена', { id });
    await this.api.delete(`/wildberries/tokens/${id}`);
    logger.info('Токен успешно удален', { id });
  }
  
  /**
   * Проверка валидности токена
   * @param token - Токен для проверки
   */
  async testToken(token: string): Promise<WildberriesTokenTestResponse> {
    logger.debug('Проверка валидности токена');
    const response = await this.api.post<WildberriesTokenTestResponse>('/wildberries/test-token', { token });
    logger.debug('Результат проверки токена', { 
      isValid: response.data.is_valid,
      status: response.data.status 
    });
    return response.data;
  }
  
  /**
   * Получение заказов
   * @param params - Параметры запроса
   */
  async getOrders(params?: { 
    status?: string; 
    dateFrom?: string; 
    dateTo?: string;
    tokenId?: number;
    page?: number;
    limit?: number;
  }): Promise<WbOrdersResponse> {
    logger.debug('Запрос заказов', params);
    const response = await this.api.get<WbOrdersResponse>('/wildberries/orders', { params });
    logger.debug('Получены заказы', { count: response.data.orders.length });
    return response.data;
  }
  
  /**
   * Получение заказа по ID
   * @param id - ID заказа
   */
  async getOrder(id: number | string): Promise<WbOrder> {
    logger.debug('Запрос заказа по ID', { id });
    const response = await this.api.get<WbOrder>(`/wildberries/orders/${id}`);
    return response.data;
  }
  
  /**
   * Изменение статуса заказов
   * @param data - Данные для изменения статуса
   */
  async changeOrdersStatus(data: ChangeStatusRequest): Promise<AxiosResponse> {
    logger.info('Изменение статуса заказов', { 
      status: data.status, 
      orderCount: data.orders.length 
    });
    return this.api.post('/wildberries/orders/status', data);
  }
  
  /**
   * Получение поставок
   */
  async getSupplies(): Promise<WildberriesSupply[]> {
    logger.debug('Запрос поставок');
    const response = await this.api.get<WildberriesSupply[]>('/wildberries/supplies');
    logger.debug('Получены поставки', { count: response.data.length });
    return response.data;
  }
  
  /**
   * Получение поставки по ID
   * @param id - ID поставки
   */
  async getSupply(id: string): Promise<WildberriesSupply> {
    logger.debug('Запрос поставки по ID', { id });
    const response = await this.api.get<WildberriesSupply>(`/wildberries/supplies/${id}`);
    return response.data;
  }
  
  /**
   * Создание новой поставки
   * @param data - Данные поставки
   */
  async createSupply(data: Partial<WildberriesSupply>): Promise<WildberriesSupply> {
    logger.info('Создание новой поставки', { name: data.name });
    const response = await this.api.post<WildberriesSupply>('/wildberries/supplies', data);
    logger.info('Поставка успешно создана', { supplyId: response.data.supplyId });
    return response.data;
  }
  
  /**
   * Отправка поставки
   * @param data - Запрос на отправку поставки
   */
  async shipSupply(data: ShippingRequest): Promise<AxiosResponse> {
    logger.info('Отправка поставки', { supplyIds: data.supplyId });
    return this.api.post('/wildberries/supplies/ship', data);
  }
}

/**
 * Экспорт экземпляра сервиса по умолчанию
 */
export default new WildberriesService(); 