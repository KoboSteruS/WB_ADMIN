/**
 * Типы для работы с API
 */

// Авторизация и пользователи
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
}

export interface RegisterResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  is_email_verified: boolean;
  theme_preference?: 'light' | 'dark';
}

// Роли пользователей
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Маркетплейсы
export interface MarketplaceCredential {
  id: string;
  user_id: string;
  marketplace: MarketplaceType;
  api_key: string;
  client_id?: string;
  shop_name?: string;
  warehouse_id?: string;
  inn?: string;
  created_at: string;
  updated_at: string;
  status: CredentialStatus;
  last_sync_at?: string;
  error_message?: string;
}

export interface MarketplaceCredentialRequest {
  marketplace: MarketplaceType;
  api_key: string;
  client_id?: string;
  shop_name?: string;
  warehouse_id?: string;
  inn?: string;
}

// Типы маркетплейсов
export enum MarketplaceType {
  WILDBERRIES = 'wildberries',
  OZON = 'ozon',
  YANDEX_MARKET = 'yandex_market',
  ALIEXPRESS = 'aliexpress',
  AVITO = 'avito',
}

// Статусы подключения к маркетплейсу
export enum CredentialStatus {
  ACTIVE = 'active',
  ERROR = 'error',
  PENDING = 'pending',
}

// Подписки
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  canceled_at?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  max_marketplaces: number;
  max_products: number;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

// Статусы подписки
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

// Финансы
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  payment_method?: string;
  invoice_id?: string;
  subscription_id?: string;
  created_at: string;
  updated_at: string;
}

// Типы транзакций
export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  SUBSCRIPTION = 'subscription',
}

// Статусы транзакций
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  plan_id?: string;
  payment_method: string;
  return_url: string;
}

export interface PaymentResponse {
  transaction_id: string;
  payment_url: string;
  status: TransactionStatus;
}

// Аналитика
export interface SalesData {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  period_comparison?: {
    revenue_change_percent: number;
    orders_change_percent: number;
  };
  chart_data: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  by_marketplace?: {
    marketplace: MarketplaceType;
    revenue: number;
    orders: number;
    percent: number;
  }[];
}

export interface ProductStatistics {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  marketplace: MarketplaceType;
  image_url?: string;
  current_price: number;
  revenue: number;
  orders: number;
  returns: number;
  rating?: number;
  stock: number;
  views: number;
  conversion_rate?: number;
}

// Группы товаров
export interface ProductGroup {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  product_ids: string[];
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductGroupRequest {
  name: string;
  description?: string;
  product_ids: string[];
}

// Уведомления
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  related_id?: string;
  related_type?: RelatedEntityType;
}

// Типы уведомлений
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

// Типы связанных сущностей
export enum RelatedEntityType {
  PRODUCT = 'product',
  ORDER = 'order',
  MARKETPLACE = 'marketplace',
  SUBSCRIPTION = 'subscription',
  PAYMENT = 'payment',
}

// Общие типы для запросов
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

// Общие типы для ответов
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Ошибки API
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Токены Wildberries
export interface WildberriesToken {
  id: number;
  token: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store_name?: string;
  last_used?: string;
  permissions?: string[];
}

export interface WildberriesTokenCreateRequest {
  token: string;
  name: string;
}

export interface WildberriesTokenUpdateRequest {
  token?: string;
  name?: string;
  is_active?: boolean;
}

// Токены Ozon
export interface OzonToken {
  id: number;
  client_id: string;
  api_key: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store_name?: string;
  last_used?: string;
  permissions?: string[];
}

export interface OzonTokenCreateRequest {
  client_id: string;
  api_key: string;
  name: string;
}

export interface OzonTokenUpdateRequest {
  client_id?: string;
  api_key?: string;
  name?: string;
  is_active?: boolean;
} 