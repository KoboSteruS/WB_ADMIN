/**
 * Сервис для работы с API Ozon
 */
import { 
  OzonOrder, 
  OzonOrdersResponse, 
  ChangeStatusRequest, 
  AddTokenRequest 
} from '../types/ozon';

// Константы для API
const API_BASE_URL = 'http://62.113.44.196:8080/api/v1';
const API_TOKEN = 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133';
const CSRF_TOKEN = 'P8r0lZl1tB9EHOBbJ8RnD27omtlYU5SB3gPAw3N0IMMuG3w6T7q2H7WWp6xD2LG0';

/**
 * Получение списка заказов Ozon
 * @param legalEntityId ID юридического лица
 * @returns Список заказов
 */
export const fetchOzonOrders = async (legalEntityId?: string): Promise<OzonOrder[]> => {
  let apiUrl = `${API_BASE_URL}/ozon-orders/`;
  
  // Добавляем ID юр. лица в параметры запроса, если оно передано
  if (legalEntityId) {
    apiUrl += `?account_ip=${legalEntityId}`;
  }
  
  console.log('URL запроса Ozon:', apiUrl);
  
  try {
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

    const responseData = await response.json();
    console.log('Данные JSON Ozon:', responseData);
    
    // Проверяем наличие поля orders в ответе
    const orders = responseData.orders || responseData;
    
    if (Array.isArray(orders)) {
      // Преобразуем и обогащаем данные заказов для удобства отображения в UI
      const processedOrders = orders.map(order => {
        // Создаем новый объект заказа с обработанными данными
        const processedOrder: OzonOrder = {
          ...order,
          
          // Преобразуем ID заказов
          order_id: order.order_id || order.order_number,
          
          // Обрабатываем данные о товаре из массива products
          product_name: order.products && order.products.length > 0 
            ? order.products[0].name 
            : order.name,
          
          sku: order.products && order.products.length > 0 
            ? order.products[0].sku 
            : order.sku,
            
          offer_id: order.products && order.products.length > 0 
            ? order.products[0].offer_id 
            : order.offer_id,
            
          // Обрабатываем данные о цене
          price: order.products && order.products.length > 0 
            ? order.products[0].price 
            : order.price,
          
          // Обрабатываем метод доставки
          delivery_type: order.delivery_method 
            ? order.delivery_method.name 
            : order.delivery_type,
            
          // Обрабатываем данные о складе
          warehouse_id: order.delivery_method 
            ? order.delivery_method.warehouse_id 
            : order.warehouse_id,
            
          // Добавляем дополнительные данные из delivery_method
          city: order.delivery_method && order.delivery_method.warehouse 
            ? order.delivery_method.warehouse.split(',')[0] 
            : order.city,
          
          // Информация о трекинге
          tracking_number: order.tracking_number || order.posting_number,
          
          // Обрабатываем даты
          created_at: order.in_process_at || order.created_at,
          created_date: order.shipment_date || order.created_date
        };
        
        return processedOrder;
      });
      
      return processedOrders;
    } else {
      throw new Error('Неверный формат данных от сервера. Массив заказов не найден.');
    }
  } catch (error) {
    console.error('Ошибка при получении данных Ozon:', error);
    throw new Error('Ошибка при загрузке заказов Ozon. Подробности в консоли.');
  }
};

/**
 * Изменение статуса заказов Ozon
 * @param request Данные для изменения статуса
 * @returns Результат операции
 */
export const changeOrderStatus = async (request: ChangeStatusRequest): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/ozon-orders/change-order-status/`,
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
 * Добавление токена Ozon
 * @param request Данные токена
 * @returns Результат операции
 */
export const addOzonToken = async (request: AddTokenRequest): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/ozon-tokens/`,
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