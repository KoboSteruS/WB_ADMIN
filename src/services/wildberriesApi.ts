/**
 * Сервис для работы с API Wildberries
 */
import { 
  WbOrder, 
  WbOrdersResponse, 
  ChangeStatusRequest, 
  AddTokenRequest,
  ShippingRequest 
} from '../types/wildberries';

// Константы для API
const API_BASE_URL = 'http://62.113.44.196:8080/api/v1';
const API_TOKEN = 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133';
const CSRF_TOKEN = 'P8r0lZl1tB9EHOBbJ8RnD27omtlYU5SB3gPAw3N0IMMuG3w6T7q2H7WWp6xD2LG0';

/**
 * Получение списка заказов
 * @param legalEntityId ID юридического лица
 * @returns Список заказов
 */
export const fetchWbOrders = async (legalEntityId?: string): Promise<WbOrder[]> => {
  let apiUrl = `${API_BASE_URL}/wb-orders/`;
  
  // Добавляем ID юр. лица в параметры запроса, если оно передано
  if (legalEntityId) {
    apiUrl += `?account_ip=${legalEntityId}`;
  }
  
  console.log('URL запроса:', apiUrl);
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': API_TOKEN,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}. ${errorText}`);
  }

  const responseText = await response.text();
  
  try {
    const data = JSON.parse(responseText);
    console.log('Данные JSON:', data);
    
    // Проверяем наличие поля orders в ответе
    const orders = data.orders || data;
    
    if (Array.isArray(orders)) {
      return orders;
    } else {
      throw new Error('Неверный формат данных от сервера. Массив заказов не найден.');
    }
  } catch (err) {
    console.error('Ошибка парсинга JSON:', err);
    throw new Error('Ошибка парсинга ответа сервера. Сервер вернул некорректный JSON.');
  }
};

/**
 * Изменение статуса заказов
 * @param request Данные для изменения статуса
 * @returns Результат операции
 */
export const changeOrderStatus = async (request: ChangeStatusRequest): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/wb-orders/change-order-status/`,
    {
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Accept': 'application/json',
        'X-CSRFTOKEN': CSRF_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
  );

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}. ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('Ответ от сервера (ТЕКСТ):', text);
    return { message: text };
  }
};

/**
 * Добавление токена Wildberries
 * @param request Данные токена
 * @returns Результат операции
 */
export const addWbToken = async (request: AddTokenRequest): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/wb-tokens/`,
    {
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
  );

  const text = await response.text();
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      const errorMessage = errorData.detail || errorData.error || errorData.message || JSON.stringify(errorData);
      throw new Error(errorMessage);
    } catch (e) {
      throw new Error(text || 'Ошибка при добавлении токена');
    }
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return { message: text };
  }
};

/**
 * Запрос на доставку заказов
 * @param supplyIds Идентификаторы поставок
 * @param tokenId ID токена WB
 * @returns Результат операции
 */
export const requestShipping = async (supplyIds: string[], tokenId: number): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/wb-orders/supply-to-delivery/?wb_token_id=${encodeURIComponent(tokenId)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Accept': 'application/json',
        'X-CSRFTOKEN': CSRF_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        supplyId: supplyIds
      })
    }
  );

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}. ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('Ответ от сервера (ТЕКСТ):', text);
    return { message: text };
  }
}; 