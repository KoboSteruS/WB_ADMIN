/**
 * Типы для работы с API Яндекс Маркет
 */

/**
 * Товар в заказе Яндекс Маркет
 */
export interface YandexMarketOrderItem {
  id?: number;
  offerId?: string;
  offerName?: string;
  price?: number;
  buyerPrice?: number;
  count?: number;
  vat?: string;
  shopSku?: string;
  subsidy?: number;
  promos?: any[];
  subsidies?: any[];
  [key: string]: any;
}

/**
 * Информация о доставке
 */
export interface YandexMarketDelivery {
  type?: string;
  serviceName?: string;
  price?: number;
  dates?: {
    fromDate?: string;
    toDate?: string;
    fromTime?: string;
    toTime?: string;
  };
  region?: {
    id?: number;
    name?: string;
    type?: string;
  };
  address?: {
    country?: string;
    postcode?: string;
    city?: string;
    street?: string;
    house?: string;
    gps?: {
      latitude?: number;
      longitude?: number;
    };
  };
  outletCode?: string;
  deliveryServiceId?: number;
  [key: string]: any;
}

/**
 * Покупатель
 */
export interface YandexMarketBuyer {
  type?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Заказ Яндекс Маркет
 */
export interface YandexMarketOrder {
  id?: number;
  order_id?: string | number;
  orderId?: string | number; // API возвращает orderId
  status?: string;
  substatus?: string;
  creationDate?: string;
  updatedAt?: string;
  created_at?: string; // Для обратной совместимости
  created_date?: string; // Для обратной совместимости
  currency?: string;
  itemsTotal?: number;
  deliveryTotal?: number;
  buyerTotal?: number;
  buyerItemsTotal?: number;
  paymentType?: string;
  paymentMethod?: string;
  fake?: boolean;
  items?: YandexMarketOrderItem[];
  delivery?: YandexMarketDelivery;
  buyer?: YandexMarketBuyer;
  
  // Упрощенный доступ к часто используемым данным
  // Эти поля могут быть заполнены из вложенных объектов для удобства использования
  name?: string; // товар или первый товар из items
  product_name?: string; // для совместимости
  shop_sku?: string;
  offer_id?: string;
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
  
  // Дополнительные свойства
  yandex_market_token?: number;
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