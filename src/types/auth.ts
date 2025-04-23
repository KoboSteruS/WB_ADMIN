/**
 * Типы данных для авторизации и аутентификации пользователей
 */

/**
 * Токены авторизации (старая версия)
 */
export interface AuthTokens {
  /** JWT токен доступа */
  access: string;
  /** JWT токен обновления */
  refresh: string;
}

/**
 * Токен авторизации
 */
export interface AuthToken {
  /** Токен авторизации */
  token: string;
}

/**
 * Информация о пользователе
 */
export interface User {
  /** Уникальный идентификатор пользователя */
  id: string;
  /** Имя пользователя (логин) */
  username: string;
  /** Email пользователя */
  email: string;
  /** Полное имя пользователя */
  fullName?: string;
  /** Является ли пользователь администратором */
  isAdmin?: boolean;
  /** Подтвержден ли email пользователя */
  isEmailVerified?: boolean;
  /** Дата последнего входа */
  lastLogin?: string;
  /** Дата регистрации */
  dateJoined?: string;
  /** Настройки пользователя */
  settings?: UserSettings;
}

/**
 * Настройки пользователя
 */
export interface UserSettings {
  /** Выбранная тема интерфейса */
  theme?: 'light' | 'dark';
  /** Настройки уведомлений */
  notifications?: {
    /** Уведомления по email */
    email?: boolean;
    /** Push-уведомления */
    push?: boolean;
    /** Уведомления в Telegram */
    telegram?: boolean;
  };
  /** Дополнительные настройки пользователя */
  preferences?: Record<string, any>;
}

/**
 * Ответ при успешной авторизации
 */
export interface LoginResponse {
  /** Данные пользователя */
  user: User;
  /** Токен авторизации */
  token: string;
}

/**
 * Данные для регистрации пользователя
 */
export interface RegisterData {
  /** Имя пользователя (логин) */
  username: string;
  /** Email пользователя */
  email: string;
  /** Пароль */
  password: string;
  /** Подтверждение пароля */
  passwordConfirm: string;
  /** Полное имя пользователя (опционально) */
  fullName?: string;
}

/**
 * Запрос на изменение пароля
 */
export interface PasswordChangeRequest {
  /** Текущий пароль */
  currentPassword: string;
  /** Новый пароль */
  newPassword: string;
  /** Подтверждение нового пароля */
  newPasswordConfirm: string;
}

/**
 * Запрос на сброс пароля
 */
export interface PasswordResetRequest {
  /** Email пользователя */
  email: string;
}

/**
 * Данные для подтверждения сброса пароля
 */
export interface PasswordResetConfirm {
  /** Токен сброса пароля */
  token: string;
  /** Уникальный идентификатор пользователя (UID) */
  uid: string;
  /** Новый пароль */
  newPassword: string;
  /** Подтверждение нового пароля */
  newPasswordConfirm: string;
}

/**
 * Запрос на подтверждение email
 */
export interface EmailVerificationRequest {
  /** Токен подтверждения email */
  token: string;
}

/**
 * Состояние аутентификации
 */
export interface AuthState {
  /** Авторизован ли пользователь */
  isAuthenticated: boolean;
  /** Данные текущего пользователя */
  user: User | null;
  /** Происходит ли загрузка данных */
  loading: boolean;
  /** Текст ошибки, если произошла ошибка */
  error: string | null;
} 