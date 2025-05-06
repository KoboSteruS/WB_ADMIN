/**
 * Типы для работы с API Wildberries
 */

// Основные типы для Wildberries

/**
 * Интерфейс токена Wildberries
 */
export interface WildberriesToken {
  id: number;
  name: string;
  token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Интерфейс запроса на создание токена Wildberries
 */
export interface WildberriesTokenCreateRequest {
  name: string;
  token: string;
}

/**
 * Интерфейс запроса на обновление токена Wildberries
 */
export interface WildberriesTokenUpdateRequest {
  name?: string;
  token?: string;
  is_active?: boolean;
}

/**
 * Интерфейс ответа на проверку токена Wildberries
 */
export interface WildberriesTokenTestResponse {
  status: string;
  message: string;
  is_valid: boolean;
}

/**
 * Параметры запроса статистики
 */
export interface WildberriesStatsParams {
  dateFrom: string;
  dateTo: string;
  tokenId: number;
}

/**
 * Детали товара из Wildberries
 */
export interface WildberriesProduct {
  nmId: number;
  vendorCode: string;
  brand: string;
  name: string;
  price: number;
  discount: number;
  promoCode?: number;
  quantity: number;
  category: string;
  subject: string;
  supplierArticle: string;
  barcode: string[];
  photoUrl?: string;
  mediaFiles?: string[];
  colors?: string[];
  sizes?: WildberriesSize[];
  characteristics?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Размер товара Wildberries
 */
export interface WildberriesSize {
  techSize: string;
  skus: string[];
  wbSize: string;
  price: number;
  quantity: number;
}

/**
 * Информация о складе Wildberries
 */
export interface WildberriesWarehouse {
  id: number;
  name: string;
  address: string;
  type: string;
}

/**
 * Информация о поставке Wildberries
 */
export interface WildberriesSupply {
  supplyId: string;
  name: string;
  createdAt: string;
  closedAt?: string;
  status: WildberriesSupplyStatus;
  warehouseId: number;
  warehouse?: string;
  items: WildberriesSupplyItem[];
  deliveryType: string;
}

/**
 * Статус поставки Wildberries
 */
export enum WildberriesSupplyStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

/**
 * Товар в поставке Wildberries
 */
export interface WildberriesSupplyItem {
  barcode: string;
  nmId: number;
  vendorCode: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
}

/**
 * Заказ Wildberries
 */
export interface WildberriesOrder {
  orderId: string;
  date: string;
  lastChangeDate: string;
  warehouseId: number;
  warehouse?: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  brand: string;
  name: string;
  quantity: number;
  totalPrice: number;
  discountPercent: number;
  finishedPrice: number;
  priceWithDisc: number;
  status: WildberriesOrderStatus;
  cancelReason?: string;
  category?: string;
  subject?: string;
  regionName?: string;
}

/**
 * Статус заказа Wildberries
 */
export enum WildberriesOrderStatus {
  NEW = 'new',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  DELIVERED = 'delivered',
  ON_DELIVERY = 'on_delivery',
  DELIVERED_TO_CUSTOMER = 'delivered_to_customer',
  RETURNED = 'returned',
  PARTIALLY_RETURNED = 'partially_returned',
}

/**
 * Продажа Wildberries
 */
export interface WildberriesSale {
  saleId: string;
  date: string;
  lastChangeDate: string;
  warehouseId: number;
  warehouse?: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  brand: string;
  name: string;
  quantity: number;
  totalPrice: number;
  discountPercent: number;
  finishedPrice: number;
  priceWithDisc: number;
  forPay: number;
  category?: string;
  subject?: string;
  regionName?: string;
  commission: number;
  spp: number;
}

/**
 * Данные о статистике продаж Wildberries
 */
export interface WildberriesSalesStatistics {
  sales: WildberriesSalesSummary;
  topProducts: WildberriesTopProduct[];
  salesByDay: WildberriesDaySales[];
  salesByRegion: WildberriesRegionSales[];
  returnRate: number;
  averageRating: number;
}

/**
 * Сводка продаж Wildberries
 */
export interface WildberriesSalesSummary {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  orderCount: number;
  averageOrderValue: number;
  periodComparison: {
    salesGrowth: number;
    revenueGrowth: number;
    profitGrowth: number;
  };
}

/**
 * Топовый продукт Wildberries
 */
export interface WildberriesTopProduct {
  nmId: number;
  name: string;
  brand: string;
  salesCount: number;
  revenue: number;
  profit: number;
  photoUrl?: string;
}

/**
 * Продажи за день Wildberries
 */
export interface WildberriesDaySales {
  date: string;
  salesCount: number;
  revenue: number;
  profit: number;
}

/**
 * Продажи по регионам Wildberries
 */
export interface WildberriesRegionSales {
  region: string;
  salesCount: number;
  revenue: number;
  percentage: number;
}

/**
 * Аналитика товара Wildberries
 */
export interface WildberriesProductAnalytics {
  nmId: number;
  vendorCode: string;
  name: string;
  brand: string;
  salesCount: number;
  revenue: number;
  profit: number;
  views: number;
  clicks: number;
  ctr: number;
  conversionRate: number;
  rating: number;
  reviewsCount: number;
  stockQuantity: number;
  daysSinceLastSale?: number;
  recommendedPrice?: number;
  competitorsMinPrice?: number;
  competitorsMaxPrice?: number;
  competitorsAvgPrice?: number;
}

/**
 * Ошибка API Wildberries
 */
export interface WildberriesApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Типы данных для работы с API Wildberries
 */

/**
 * Интерфейс для данных заказа Wildberries
 */
export interface WbOrder {
  id?: number;
  address?: string[] | string | null;
  ddate?: string | null;
  sale_price?: string | number;
  required_meta?: any[];
  delivery_type?: string | number;
  comment?: string;
  scan_price?: string | number | null;
  order_uid?: string;
  article?: string | number;
  color_code?: string | number;
  rid?: string | number;
  created_at?: string;
  offices?: string[];
  skus?: string[];
  order_id?: string | number;
  warehouse_id?: number;
  nm_id?: number;
  chrt_id?: number;
  price?: string | number;
  converted_price?: string | number;
  currency_code?: number;
  converted_currency_code?: number;
  cargo_type?: number;
  is_zero_order?: boolean;
  options?: {
    [key: string]: any;
  };
  wb_status?: string;
  own_status?: string;
  sticker?: string;
  wb_token?: number;
  supply_id?: string;
  [key: string]: any;
}

/**
 * Интерфейс для данных юридического лица
 */
export interface LegalEntity {
  id: string;
  title: string;
  inn: string;
}

/**
 * Интерфейс для пропсов компонента WildberriesOrders
 */
export interface WildberriesOrdersProps {
  token?: string;
}

/**
 * Интерфейс для результата запроса списка заказов 
 */
export interface WbOrdersResponse {
  orders: WbOrder[];
}

/**
 * Интерфейс для запроса изменения статуса
 */
export interface ChangeStatusRequest {
  orders: (number | string)[];
  status: string;
  wb_token_id?: number;
}

/**
 * Интерфейс для запроса добавления токена
 */
export interface AddTokenRequest {
  token: string;
  name?: string;
}

/**
 * Интерфейс для запроса доставки
 */
export interface ShippingRequest {
  supplyId: string[];
} 