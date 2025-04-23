/**
 * Интерфейс токена Ozon
 */
export interface OzonToken {
  id: number;
  name: string;
  token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Интерфейс запроса на создание токена Ozon
 */
export interface OzonTokenCreateRequest {
  name: string;
  token: string;
}

/**
 * Интерфейс запроса на обновление токена Ozon
 */
export interface OzonTokenUpdateRequest {
  name?: string;
  token?: string;
  is_active?: boolean;
}

/**
 * Интерфейс ответа на проверку токена Ozon
 */
export interface OzonTokenTestResponse {
  status: string;
  message: string;
  is_valid: boolean;
}

/**
 * Интерфейс ошибки API Ozon
 */
export interface OzonApiError {
  code: string;
  message: string;
  details?: any;
} 