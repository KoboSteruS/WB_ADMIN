import { LoginRequest, LoginResponse, ApiError } from './types';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Клиент для взаимодействия с API бэкенда
 */
export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private csrfToken: string | null = null;

  /**
   * Создает экземпляр API клиента
   * @param baseUrl - Базовый URL API
   */
  constructor(baseUrl: string = 'http://85.193.81.178:8080/api/v1') {
    this.baseUrl = baseUrl;
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Аутентификация пользователя
   * @param credentials - Учетные данные пользователя
   * @param withAuth - Флаг для указания необходимости добавления заголовка авторизации
   * @returns Промис с данными ответа об успешной аутентификации
   */
  public async login(credentials: LoginRequest, withAuth: boolean = true): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/login/', credentials, withAuth);
    this.setToken(response.token);
    return response;
  }

  /**
   * Выход из системы
   */
  public async logout(): Promise<void> {
    await this.post<void>('/auth/logout/', {});
    localStorage.removeItem('auth_token');
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Проверка аутентификации
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Выполняет GET запрос
   * @param url - URL запроса
   * @param params - Параметры запроса
   * @returns Промис с данными ответа
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', url, params ? { params } : {});
  }

  /**
   * Выполняет POST запрос
   * @param url - URL запроса
   * @param data - Данные запроса
   * @param withAuth - Флаг для указания необходимости добавления заголовка авторизации
   * @returns Промис с данными ответа
   */
  async post<T>(url: string, data?: any, withAuth: boolean | AxiosRequestConfig = true): Promise<T> {
    const config: AxiosRequestConfig = typeof withAuth === 'boolean' 
      ? {} 
      : withAuth;
    
    return this.request<T>('POST', url, { ...config, data });
  }

  /**
   * Выполняет PUT запрос
   * @param url - URL запроса
   * @param data - Данные запроса
   * @param withAuth - Флаг для указания необходимости добавления заголовка авторизации или дополнительные настройки запроса
   * @returns Промис с данными ответа
   */
  async put<T>(url: string, data?: any, withAuth: boolean | AxiosRequestConfig = true): Promise<T> {
    const config: AxiosRequestConfig = typeof withAuth === 'boolean' 
      ? {} 
      : withAuth;
    
    return this.request<T>('PUT', url, { ...config, data });
  }

  /**
   * Выполняет PATCH запрос
   * @param url - URL запроса
   * @param data - Данные запроса
   * @param withAuth - Флаг для указания необходимости добавления заголовка авторизации или дополнительные настройки запроса
   * @returns Промис с данными ответа
   */
  async patch<T>(url: string, data?: any, withAuth: boolean | AxiosRequestConfig = true): Promise<T> {
    const config: AxiosRequestConfig = typeof withAuth === 'boolean' 
      ? {} 
      : withAuth;
    
    return this.request<T>('PATCH', url, { ...config, data });
  }

  /**
   * Выполняет DELETE запрос
   * @param url - URL запроса
   * @param withAuth - Флаг для указания необходимости добавления заголовка авторизации или дополнительные настройки запроса
   * @returns Промис с данными ответа
   */
  async delete<T>(url: string, withAuth: boolean | AxiosRequestConfig = true): Promise<T> {
    const config: AxiosRequestConfig = typeof withAuth === 'boolean' 
      ? {} 
      : withAuth;
    
    return this.request<T>('DELETE', url, config);
  }

  /**
   * Выполняет HTTP запрос
   * @param method - HTTP метод
   * @param url - URL запроса
   * @param config - Настройки запроса
   * @returns Промис с данными ответа
   */
  private async request<T>(
    method: string, 
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      
      // Добавляем токен авторизации, если он есть
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      
      // Добавляем CSRF токен для небезопасных методов
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && this.csrfToken) {
        headers['X-CSRF-Token'] = this.csrfToken;
      }

      const response = await axios({
        method,
        url: this.baseUrl + url,
        headers,
        ...config,
      });

      // Сохраняем CSRF токен из ответа, если он есть
      const csrfToken = response.headers['x-csrf-token'];
      if (csrfToken) {
        this.csrfToken = csrfToken;
      }

      return response.data;
    } catch (error) {
      return this.handleRequestError(error as AxiosError);
    }
  }

  /**
   * Обновляет токены доступа
   * @returns Промис, который разрешается после успешного обновления токенов
   */
  private async refreshTokens(): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/refresh-token`, {
        refreshToken: this.refreshToken
      });
      
      const { accessToken, refreshToken } = response.data;
      
      if (accessToken && refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        
        // Сохраняем токены в локальное хранилище
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        throw new Error('Не удалось обновить токены');
      }
    } catch (error) {
      // Очищаем токены и выбрасываем ошибку дальше
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Очищает токены авторизации
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Устанавливает токены авторизации
   * @param accessToken - Токен доступа
   * @param refreshToken - Токен обновления
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Загружает файл на сервер
   * @param url - URL для загрузки
   * @param file - Файл для загрузки
   * @param onProgress - Callback-функция для отслеживания прогресса загрузки
   * @returns Промис с данными ответа
   */
  async uploadFile<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(this.baseUrl + url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {})
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });

      return response.data;
    } catch (error) {
      return this.handleRequestError(error as AxiosError);
    }
  }

  /**
   * Скачивает файл с сервера
   * @param url - URL для скачивания
   * @param filename - Имя файла для сохранения (опционально)
   * @returns Промис, который разрешается после успешного скачивания
   */
  async downloadFile(
    url: string, 
    filename?: string
  ): Promise<void> {
    try {
      const response = await axios({
        method: 'GET',
        url: this.baseUrl + url,
        responseType: 'blob',
        headers: {
          ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {})
        }
      });

      // Создаем ссылку для скачивания файла
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Используем имя файла из заголовка Content-Disposition, если оно есть
      // и не было передано явно в параметрах метода
      if (!filename && response.headers['content-disposition']) {
        const contentDisposition = response.headers['content-disposition'];
        const filenameMatch = /filename="?([^"]*)"?/i.exec(contentDisposition);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename || 'download');
      document.body.appendChild(link);
      link.click();
      
      // Удаляем ссылку после скачивания
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      this.handleRequestError(error as AxiosError);
    }
  }

  /**
   * Обновляет CSRF токен
   * @returns Промис, который разрешается после успешного обновления токена
   */
  private async updateCsrfToken(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/csrf-token`);
      const csrfToken = response.headers['x-csrf-token'];
      
      if (csrfToken) {
        this.csrfToken = csrfToken;
      }
    } catch (error) {
      console.error('Не удалось обновить CSRF токен', error);
    }
  }

  /**
   * Сохранение токена
   */
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.accessToken = token;
  }

  // Метод для сохранения токена, полученного через fetch API
  public saveTokenFromFetch(token: string): void {
    localStorage.setItem('auth_token', token);
    this.accessToken = token;
  }

  /**
   * Приватный метод для добавления заголовка авторизации к конфигурации запроса
   * @param config - Конфигурация запроса
   * @returns Конфигурация с добавленным заголовком авторизации
   */
  private addAuthHeader(config: AxiosRequestConfig = {}): AxiosRequestConfig {
    const headers = { ...(config.headers || {}) };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return { ...config, headers };
  }

  /**
   * Метод для получения токенов из ответа API
   * @param response - Ответ от API, содержащий токены
   */
  private getTokenFromResponse(response: AxiosResponse): void {
    const { access_token, refresh_token } = response.data;
    if (access_token) {
      this.accessToken = access_token;
      localStorage.setItem('access_token', access_token);
    }
    if (refresh_token) {
      this.refreshToken = refresh_token;
      localStorage.setItem('refresh_token', refresh_token);
    }
  }

  /**
   * Обновление токена доступа с использованием refresh токена
   * @returns Promise с результатом обновления токена
   */
  public async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        return false;
      }

      const response = await axios.post(`${this.baseUrl}/auth/refresh/`, {
        refresh_token: this.refreshToken
      });

      if (response.status === 200 && response.data.access_token) {
        this.getTokenFromResponse(response);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      // Очищаем токены при ошибке обновления
      this.clearTokens();
      return false;
    }
  }

  /**
   * Обрабатывает ошибки запросов
   * @param error - Объект ошибки
   * @throws Обработанная ошибка
   */
  private handleRequestError(error: AxiosError): never {
    // Обработка ошибок сетевого соединения
    if (!error.response) {
      throw new Error('Ошибка сети. Пожалуйста, проверьте подключение к интернету.');
    }

    // Обработка 401 ошибки (Unauthorized)
    if (error.response.status === 401 && this.refreshToken) {
      // Создаем новый инстанс axios для запроса на обновление токена
      // чтобы избежать рекурсивного перехвата 401 ошибки
      return this.refreshTokens()
        .then(() => {
          // Повторяем исходный запрос с новым токеном
          const config = error.config as AxiosRequestConfig;
          if (config.headers) {
            config.headers['Authorization'] = `Bearer ${this.accessToken}`;
          }
          return axios(config);
        })
        .then(response => response.data)
        .catch(() => {
          // Если не удалось обновить токен, выходим из системы
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        }) as never;
    }

    // Получаем текст ошибки из ответа сервера или используем статус код
    const errorData = error.response.data as Record<string, any>;
    const errorMessage = errorData?.message || 
                       errorData?.error || 
                       `Ошибка сервера (${error.response.status})`;
    
    throw new Error(errorMessage);
  }
}

// Экспортируем синглтон экземпляр
export const apiClient = new ApiClient();

export default apiClient;