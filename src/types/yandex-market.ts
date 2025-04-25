/**
 * Типы для работы с API Яндекс Маркета
 */

/**
 * Интерфейс токена Яндекс Маркета
 */
export interface YandexMarketToken {
  id: number;
  campaign_id: number;
  api_key: string;
  created_at: string;
  account_ip: number;
}

/**
 * Интерфейс запроса на создание токена Яндекс Маркета
 */
export interface YandexMarketTokenCreateRequest {
  campaign_id: number;
  api_key: string;
  account_ip: number;
}

/**
 * Интерфейс запроса на обновление токена Яндекс Маркета
 */
export interface YandexMarketTokenUpdateRequest {
  campaign_id?: number;
  api_key?: string;
  account_ip?: number;
}

/**
 * Интерфейс ответа на проверку токена Яндекс Маркета
 */
export interface YandexMarketTokenTestResponse {
  status: string;
  message: string;
  is_valid: boolean;
}

/**
 * Параметры запроса статистики
 */
export interface YandexMarketStatsParams {
  dateFrom: string;
  dateTo: string;
  tokenId: number;
}

/**
 * Интерфейс товара в Яндекс Маркете
 */
export interface YandexMarketProduct {
  id: number;
  sku: string;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  oldPrice?: number;
  vat: string;
  shopSku: string;
  barcodes?: string[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  photos: string[];
  description: string;
  vendor: string;
  vendorCode: string;
  availableAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Интерфейс заказа Яндекс Маркета
 */
export interface YandexMarketOrder {
  id: number;
  status: string;
  creationDate: string;
  statusUpdateDate: string;
  paymentType: string;
  paymentMethod: string;
  fake: boolean;
  notes: string;
  itemsTotal: number;
  total: number;
  deliveryTotal: number;
  subsidyTotal: number;
  totalWithSubsidy: number;
  buyerItemsTotal: number;
  buyerTotal: number;
  buyerItemsTotalBeforeDiscount: number;
  buyerTotalBeforeDiscount: number;
  deliveryRegion: {
    id: number;
    name: string;
  };
  items: YandexMarketOrderItem[];
  delivery: {
    type: string;
    serviceName: string;
    price: number;
    deliveryPartnerType: string;
    address: {
      country: string;
      city: string;
      street: string;
      house: string;
      apartment: string;
      postcode: string;
    };
  };
}

/**
 * Интерфейс товара в заказе Яндекс Маркета
 */
export interface YandexMarketOrderItem {
  id: number;
  feedId: number;
  offerId: string;
  price: number;
  count: number;
  shopSku: string;
  subsidy: number;
  vat: string;
  promos: any[];
}

/**
 * Интерфейс для статистики продаж Яндекс Маркета
 */
export interface YandexMarketSalesStatistics {
  summary: {
    orderCount: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  byDay: Array<{
    date: string;
    orderCount: number;
    revenue: number;
  }>;
  byProduct: Array<{
    productId: number;
    name: string;
    orderCount: number;
    revenue: number;
  }>;
}

/**
 * Интерфейс ошибки API Яндекс Маркета
 */
export interface YandexMarketApiError {
  code: string;
  message: string;
  details?: any;
} 