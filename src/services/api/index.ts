import apiService from './api-service';
import apiClient from './api-client';
import { WildberriesService } from './wildberries-service';
import { OzonService } from './ozon-service';

export * from './api-client';
export * from './api-service';
export * from './types';
export * from './wildberries-service';
export * from './ozon-service';

// Экспорт по умолчанию API-сервиса

// Создаем и экспортируем экземпляр сервиса Wildberries
export const wildberriesService = new WildberriesService(apiClient);

// Создаем и экспортируем экземпляр сервиса Ozon
export const ozonService = new OzonService(apiClient);

export default apiService; 