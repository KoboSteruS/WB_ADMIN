/**
 * Сервис авторизации
 * Предоставляет методы для работы с аутентификацией и авторизацией пользователей
 */

import { User, AuthToken, LoginResponse, RegisterData, PasswordChangeRequest, PasswordResetRequest, PasswordResetConfirm } from '../../types/auth';
import apiClient from '../api/api-client';

/**
 * Сервис для работы с авторизацией
 */
class AuthService {
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  
  /**
   * Получение сохраненного токена из localStorage
   */
  private getSavedToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  
  /**
   * Сохранение токена в localStorage
   * @param token - токен для сохранения
   */
  private saveToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    // Токен также сохраняется в apiClient через login метод
  }
  
  /**
   * Удаление токена из localStorage
   */
  private clearToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    // Токен также удаляется в apiClient через logout метод
  }
  
  /**
   * Авторизация пользователя
   * @param username - имя пользователя
   * @param password - пароль
   * @param redirectUrl - URL для перенаправления после входа
   */
  async login(username: string, password: string, redirectUrl: string = '/'): Promise<LoginResponse> {
    const response = await apiClient.login({ username, password });
    
    const authResponse: LoginResponse = {
      user: {
        id: response.user.id,
        username: username,
        email: response.user.email,
        fullName: `${response.user.first_name} ${response.user.last_name}`.trim(),
        isAdmin: response.user.role === 'admin',
        isEmailVerified: response.user.is_email_verified,
        dateJoined: response.user.created_at,
        lastLogin: response.user.updated_at,
        settings: {
          theme: response.user.theme_preference
        }
      },
      token: response.token
    };
    
    this.saveToken(authResponse.token);
    
    // Заменяем текущую запись в истории на новый URL и предотвращаем возвращение назад
    window.history.replaceState(null, '', redirectUrl);
    
    return authResponse;
  }
  
  /**
   * Выход из системы
   * @param redirectUrl - URL для перенаправления после выхода
   */
  async logout(redirectUrl: string = '/login'): Promise<void> {
    await apiClient.logout();
    this.clearToken();
    
    // Заменяем текущую запись в истории на страницу логина и предотвращаем возвращение назад
    window.history.replaceState(null, '', redirectUrl);
  }
  
  /**
   * Получение данных текущего пользователя
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!apiClient.isAuthenticated()) return null;
      return await apiClient.get<User>('/auth/me/');
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return null;
    }
  }
  
  /**
   * Регистрация нового пользователя
   * @param data - данные для регистрации
   */
  async register(data: RegisterData): Promise<void> {
    await apiClient.post('/auth/register/', data);
  }
  
  /**
   * Обновление данных пользователя
   * @param userData - данные пользователя для обновления
   */
  async updateUser(userData: Partial<User>): Promise<User> {
    return await apiClient.patch<User>('/auth/me/', userData);
  }
  
  /**
   * Запрос на подтверждение email
   * @param email - email пользователя
   */
  async requestEmailVerification(email: string): Promise<void> {
    await apiClient.post('/auth/email/verify/', { email });
  }
  
  /**
   * Подтверждение email
   * @param token - токен для подтверждения
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/email/confirm/', { token });
  }
  
  /**
   * Изменение пароля пользователя
   * @param data - данные для изменения пароля
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    await apiClient.post('/auth/password/change/', data);
  }
  
  /**
   * Запрос на сброс пароля
   * @param data - данные для сброса пароля
   */
  async resetPassword(data: PasswordResetRequest): Promise<void> {
    await apiClient.post('/auth/password/reset/', data);
  }
  
  /**
   * Подтверждение сброса пароля
   * @param data - данные для подтверждения сброса пароля
   */
  async confirmResetPassword(data: PasswordResetConfirm): Promise<void> {
    await apiClient.post('/auth/password/reset/confirm/', data);
  }
  
  /**
   * Проверка авторизации пользователя
   * @returns true если пользователь авторизован
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

// Экспорт экземпляра сервиса для использования в приложении
export const authService = new AuthService();
export default authService; 