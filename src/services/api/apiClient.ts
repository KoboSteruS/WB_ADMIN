import { LoginRequest, LoginResponse, ApiError } from './types';

/**
 * Базовый класс для работы с API
 */
class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = 'http://62.113.44.196:8080/api/v1';
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Аутентификация пользователя
   */
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/login/', credentials, false);
    this.setToken(response.token);
    return response;
  }

  /**
   * Выход из системы
   */
  public logout(): void {
    localStorage.removeItem('auth_token');
    this.token = null;
  }

  /**
   * Проверка аутентификации
   */
  public isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * GET запрос
   */
  public async get<T>(endpoint: string, params?: Record<string, any>, requiresAuth: boolean = true): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
    }

    return this.request<T>('GET', url.toString(), undefined, requiresAuth);
  }

  /**
   * POST запрос
   */
  public async post<T>(endpoint: string, data?: any, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>('POST', `${this.baseUrl}${endpoint}`, data, requiresAuth);
  }

  /**
   * PUT запрос
   */
  public async put<T>(endpoint: string, data?: any, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>('PUT', `${this.baseUrl}${endpoint}`, data, requiresAuth);
  }

  /**
   * PATCH запрос
   */
  public async patch<T>(endpoint: string, data?: any, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>('PATCH', `${this.baseUrl}${endpoint}`, data, requiresAuth);
  }

  /**
   * DELETE запрос
   */
  public async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>('DELETE', `${this.baseUrl}${endpoint}`, undefined, requiresAuth);
  }

  /**
   * Базовый метод для HTTP запросов
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    requiresAuth: boolean = true
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (requiresAuth) {
        if (!this.token) {
          throw new Error('Требуется авторизация');
        }
        headers['Authorization'] = `Token ${this.token}`;
      }

      const config: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };

      let response = await fetch(url, config);

      // Если произошла ошибка авторизации
      if (response.status === 401 && requiresAuth) {
        // Перенаправляем на страницу входа
        this.logout();
        window.location.href = '/login';
        throw {
          status: 401,
          message: 'Требуется авторизация'
        } as ApiError;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          status: response.status,
          message: errorData.message || errorData.detail || 'Произошла ошибка',
          errors: errorData.errors,
        } as ApiError;
      }

      // Если запрос без ответа
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      
      throw {
        status: 500,
        message: (error as Error).message || 'Неизвестная ошибка',
      } as ApiError;
    }
  }

  /**
   * Сохранение токена
   */
  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
}

// Экспортируем синглтон экземпляр
export const apiClient = new ApiClient();

export default apiClient; 