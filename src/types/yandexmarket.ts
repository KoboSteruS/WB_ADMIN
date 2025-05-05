/**
 * Типы для работы с API Яндекс Маркет
 */

/**
 * Заказ Яндекс Маркет
 */
export interface YandexMarketOrder {
  id?: number;
  order_id?: string | number;
  offer_id?: string;
  shop_sku?: string;
  market_sku?: string;
  name?: string;
  product_name?: string;
  status?: string;
  substatus?: string;
  created_at?: string;
  created_date?: string;
  price?: string | number;
  total_price?: string | number;
  region?: string;
  delivery_region?: string;
  delivery_service_name?: string;
  delivery_type?: string;
  delivery_price?: string | number;
  delivery_date?: string;
  delivery_address?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipment_date?: string;
  items_count?: number;
  tracking_number?: string;
  payment_type?: string;
  payment_method?: string;
  notes?: string;
  is_canceled?: boolean;
  cancelation_reason?: string;
  [key: string]: any;
}

/**
 * Ответ API с заказами Яндекс Маркет
 */
export interface YandexMarketOrdersResponse {
  orders: YandexMarketOrder[];
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
  client_id?: string;
  client_secret?: string;
} 