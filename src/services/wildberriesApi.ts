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
 * @param statusWbConfirm Флаг для фильтрации заказов по статусу подтверждения
 * @returns Список заказов
 */
export const fetchWbOrders = async (legalEntityId?: string, statusWbConfirm: boolean = false): Promise<WbOrder[]> => {
  let apiUrl = `${API_BASE_URL}/wb-orders/`;
  
  // Формируем query-параметры запроса
  const params = new URLSearchParams();
  
  // Добавляем ID юр. лица в параметры запроса, если оно передано
  if (legalEntityId) {
    params.append('account_ip', legalEntityId);
  }
  
  // Добавляем параметр статуса подтверждения
  params.append('status_wb_confirm', statusWbConfirm.toString());
  
  // Добавляем параметры к URL запроса
  if (params.toString()) {
    apiUrl += `?${params.toString()}`;
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
  // Проверка наличия заказов
  if (!request.orders || !Array.isArray(request.orders) || request.orders.length === 0) {
    console.error('Ошибка: пустой массив заказов', request);
    throw new Error('Не выбраны заказы для изменения статуса');
  }

  // Проверка корректности статуса
  if (!request.status) {
    console.error('Ошибка: отсутствует статус', request);
    throw new Error('Статус для изменения не указан');
  }
  
  // Проверяем, что статус не 'new'
  if (request.status.toLowerCase() === 'new') {
    console.error('Ошибка: статус new не может быть установлен', request);
    throw new Error('Статус "new" не может быть установлен для заказов');
  }

  // Получаем токен WB из запроса или используем по умолчанию
  const wb_token_id = request.wb_token_id || 1;
  
  // Формируем URL с параметрами
  const url = `${API_BASE_URL}/wb-orders/change-order-status/?wb_token_id=${wb_token_id}`;
  
  // Формируем тело запроса
  const requestBody = {
    orders: request.orders,
    status: request.status
  };
  
  console.log('Отправка запроса на изменение статуса:', {
    url: url,
    method: 'POST',
    headers: {
      'Authorization': API_TOKEN,
      'Accept': 'application/json',
      'X-CSRFTOKEN': CSRF_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  try {
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': API_TOKEN,
          'Accept': 'application/json',
          'X-CSRFTOKEN': CSRF_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    const text = await response.text();
    console.log('Статус ответа:', response.status, response.statusText);
    console.log('Тело ответа:', text);

    // Даже если ответ не OK, но есть текст - попробуем распарсить
    try {
      const jsonResponse = JSON.parse(text);
      if (!response.ok) {
        // Если пришел JSON с ошибкой, формируем сообщение об ошибке
        const errorMessage = jsonResponse.detail || jsonResponse.error || jsonResponse.message || JSON.stringify(jsonResponse);
        throw new Error(errorMessage);
      }
      return jsonResponse;
    } catch (parseError) {
      // Если не получилось распарсить как JSON
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}. ${text}`);
      }
      console.log('Ответ от сервера (не JSON):', text);
      return { message: text, success: response.ok };
    }
  } catch (error) {
    console.error('Ошибка при изменении статуса заказов:', error);
    throw error;
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

/**
 * Добавляет заказы в поставку Wildberries
 * @param ordersIds Массив идентификаторов заказов
 * @param wb_token_id Идентификатор токена Wildberries (по умолчанию 1)
 * @returns Ответ от API
 */
export const addToSupply = async (
  ordersIds: (string | number)[],
  wb_token_id: number = 1
): Promise<any> => {
  try {
    const response = await fetch(`http://62.113.44.196:8080/api/v1/wb-orders/add-to-supply/?wb_token_id=${encodeURIComponent(wb_token_id)}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133',
        'Accept': 'application/json',
        'X-CSRFTOKEN': 'P8r0lZl1tB9EHOBbJ8RnD27omtlYU5SB3gPAw3N0IMMuG3w6T7q2H7WWp6xD2LG0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "orders": ordersIds
      })
    });

    // Получаем ответ текстом
    const text = await response.text();
    
    try {
      // Пытаемся распарсить как JSON
      const data = JSON.parse(text);
      console.log('Ответ от сервера (JSON):', data.response);
      return data;
    } catch (e) {
      // Если не получилось распарсить как JSON, возвращаем текст
      console.log('Ответ от сервера (ТЕКСТ):', text);
      return { success: true, message: text };
    }
  } catch (error) {
    console.error('Ошибка запроса при добавлении в поставку:', error);
    throw new Error(`Ошибка при добавлении заказов в поставку: ${error instanceof Error ? error.message : String(error)}`);
  }
}; 