/**
 * Пример использования API-сервиса в компонентах
 * 
 * Этот файл демонстрирует, как можно использовать созданные API-сервисы в реальных компонентах.
 * Код в этом файле не выполняется и служит только для документации.
 */

import { useState, useEffect } from 'react';
import apiService from './api-service';
import { UserProfile, MarketplaceCredential, SalesData } from './types';

/**
 * Пример хука для авторизации пользователя
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.auth.login({ username, password });
      // Сохраняем профиль пользователя в состоянии приложения
      return response;
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.auth.logout();
      // Очистка состояния приложения
    } catch (err: any) {
      console.error('Ошибка при выходе:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { login, logout, isLoading, error };
};

/**
 * Пример хука для получения профиля пользователя
 */
export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProfile = async () => {
    setIsLoading(true);
    
    try {
      const userProfile = await apiService.profile.getProfile();
      setProfile(userProfile);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке профиля');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProfile = async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    
    try {
      const updatedProfile = await apiService.profile.updateProfile(data);
      setProfile(updatedProfile);
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении профиля');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  return { profile, isLoading, error, updateProfile, refetch: fetchProfile };
};

/**
 * Пример хука для работы с учетными данными маркетплейсов
 */
export const useMarketplaceCredentials = () => {
  const [credentials, setCredentials] = useState<MarketplaceCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchCredentials = async () => {
    setIsLoading(true);
    
    try {
      const data = await apiService.marketplaceCredentials.getAll();
      setCredentials(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке учетных данных маркетплейсов');
    } finally {
      setIsLoading(false);
    }
  };
  
  const testConnection = async (id: string) => {
    try {
      return await apiService.marketplaceCredentials.testConnection(id);
    } catch (err: any) {
      setError(err.message || 'Ошибка при проверке подключения');
      return { success: false, message: err.message };
    }
  };
  
  useEffect(() => {
    fetchCredentials();
  }, []);
  
  return { 
    credentials, 
    isLoading, 
    error, 
    refetch: fetchCredentials,
    testConnection,
    // Другие методы для работы с учетными данными
    create: apiService.marketplaceCredentials.create,
    update: apiService.marketplaceCredentials.update,
    delete: apiService.marketplaceCredentials.delete
  };
};

/**
 * Пример хука для работы с аналитикой
 */
export const useAnalytics = () => {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSalesData = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    
    try {
      const data = await apiService.analytics.getSalesData(startDate, endDate);
      setSalesData(data);
      setError(null);
      return data;
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных о продажах');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportCsv = async (startDate: string, endDate: string, type: 'sales' | 'products' | 'inventory') => {
    setIsLoading(true);
    
    try {
      await apiService.analytics.exportToCSV(startDate, endDate, type);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка при экспорте данных');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { 
    salesData, 
    isLoading, 
    error, 
    fetchSalesData,
    exportCsv,
    getProductStatistics: apiService.analytics.getProductStatistics
  };
};

/**
 * Пример использования в функциональном компоненте React
 */
/*
function ProfilePage() {
  const { profile, isLoading, error, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });
  
  // Обновление formData при загрузке профиля
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      // Показать сообщение об успешном обновлении
    }
  };
  
  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!profile) return <div>Профиль не найден</div>;
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Имя:</label>
        <input
          type="text"
          value={formData.first_name}
          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
        />
      </div>
      <div>
        <label>Фамилия:</label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
        />
      </div>
      <div>
        <label>Телефон:</label>
        <input
          type="text"
          value={formData.phone || ''}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      <button type="submit">Сохранить</button>
    </form>
  );
}
*/ 