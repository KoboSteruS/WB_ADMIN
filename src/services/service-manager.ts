import apiClient from './api/api-client';
import { OzonService } from './api/ozon-service';

/**
 * Менеджер сервисов приложения
 * 
 * Предоставляет централизованный доступ ко всем сервисам приложения,
 * обеспечивая повторное использование экземпляров и упрощенный доступ из компонентов
 */
class ServiceManager {
  private readonly apiClient;
  private readonly ozonService: OzonService;
  
  /**
   * Создает экземпляр менеджера сервисов
   */
  constructor() {
    // Используем существующий экземпляр API клиента
    this.apiClient = apiClient;
    
    // Инициализация сервисов с передачей им API клиента
    this.ozonService = new OzonService(this.apiClient);
  }
  
  /**
   * Получение экземпляра API клиента
   * @returns экземпляр ApiClient
   */
  getApiClient() {
    return this.apiClient;
  }
  
  /**
   * Получение экземпляра сервиса Ozon
   * @returns экземпляр OzonService
   */
  getOzonService(): OzonService {
    return this.ozonService;
  }
  
  /**
   * Сбросить состояние всех сервисов
   * Может использоваться при выходе пользователя из системы
   */
  resetServices(): void {
    // В будущем здесь может быть логика сброса состояния сервисов
    console.log('Сброс состояния всех сервисов...');
  }
}

// Создаем единственный экземпляр менеджера сервисов для всего приложения
export const serviceManager = new ServiceManager();

// Экспортируем по умолчанию для удобства импорта
export default serviceManager; 