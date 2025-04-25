import apiService from './api-service';
import apiClient from './api-client';
import { WildberriesService } from './wildberries-service';
import { OzonService } from './ozon-service';
import { YandexMarketService } from './yandex-market-service';

export * from './api-client';
export * from './api-service';
export * from './types';
export * from './wildberries-service';
export * from './ozon-service';
export * from './yandex-market-service';

// Экспорт по умолчанию API-сервиса

// Создаем и экспортируем экземпляр сервиса Wildberries
export const wildberriesService = new WildberriesService(apiClient);

// Создаем и экспортируем экземпляр сервиса Ozon
export const ozonService = new OzonService(apiClient);

// Создаем и экспортируем экземпляр сервиса Яндекс Маркета
export const yandexMarketService = new YandexMarketService(apiClient);

export default apiService; 