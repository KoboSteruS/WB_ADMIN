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

/**
 * Типы для работы с API Ozon
 */

/**
 * Заказ Ozon
 */
export interface OzonOrder {
  id?: number;
  order_id?: string | number;
  product_id?: string | number;
  sku?: string | number;
  name?: string;
  product_name?: string;
  price?: string | number;
  sale_price?: string | number;
  status?: string;
  created_at?: string;
  created_date?: string;
  delivery_type?: string;
  article?: string | number;
  quantity?: number;
  city?: string;
  region?: string;
  tracking_number?: string;
  total_price?: string | number;
  total_discount?: string | number;
  delivery_method?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  cancellation_reason?: string;
  posting_number?: string;
  warehouse_id?: string | number;
  delivery_date?: string;
  is_premium?: boolean;
  [key: string]: any;
}

/**
 * Ответ API с заказами Ozon
 */
export interface OzonOrdersResponse {
  orders: OzonOrder[];
}

/**
 * Запрос на изменение статуса заказов
 */
export interface ChangeStatusRequest {
  orders: (number | string)[];
  status: string;
}

/**
 * Запрос на добавление токена
 */
export interface AddTokenRequest {
  token: string;
  name?: string;
} 