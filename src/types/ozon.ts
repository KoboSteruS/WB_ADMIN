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
 * Интерфейс товара в заказе Ozon
 */
export interface OzonOrderProduct {
  price?: number;
  offer_id?: string;
  name?: string;
  sku?: string | number;
  quantity?: number;
  mandatory_mark?: any;
  currency_code?: string;
  is_blr_traceable?: boolean;
  [key: string]: any;
}

/**
 * Интерфейс метода доставки Ozon
 */
export interface OzonDeliveryMethod {
  id?: string | number;
  name?: string;
  warehouse_id?: string | number;
  warehouse?: string;
  tpl_provider_id?: number;
  tpl_provider?: string;
  [key: string]: any;
}

/**
 * Интерфейс данных о клиенте Ozon
 */
export interface OzonCustomer {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

/**
 * Интерфейс данных об отмене заказа Ozon
 */
export interface OzonCancellation {
  cancel_reason_id?: number;
  cancel_reason?: string;
  cancellation_type?: string;
  cancelled_after_ship?: boolean;
  affect_cancellation_rating?: boolean;
  cancellation_initiator?: string;
  [key: string]: any;
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
  order_number?: string;
  posting_number?: string;
  product_id?: string | number;
  sku?: string | number;
  name?: string;
  product_name?: string;
  price?: string | number;
  sale_price?: string | number;
  status?: string;
  created_at?: string;
  created_date?: string;
  in_process_at?: string;
  shipment_date?: string;
  delivering_date?: string;
  delivery_type?: string;
  article?: string | number;
  quantity?: number;
  city?: string;
  region?: string;
  tracking_number?: string;
  total_price?: string | number;
  total_discount?: string | number;
  delivery_method?: OzonDeliveryMethod;
  customer?: OzonCustomer;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  cancellation?: OzonCancellation;
  cancellation_reason?: string;
  warehouse_id?: string | number;
  delivery_date?: string;
  is_premium?: boolean;
  offer_id?: string;
  products?: OzonOrderProduct[];
  tpl_integration_type?: string;
  ozon_token?: number;
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