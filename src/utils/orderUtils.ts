/**
 * Утилиты для работы с данными заказов
 */
import { WbOrder } from '../types/wildberries';

/**
 * Форматирует дату в локализованный формат с временем
 * @param dateString Строка с датой
 * @returns Отформатированная дата в формате ДД.ММ.ГГГГ Ч:М
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '—';
  
  try {
    // Проверка на формат "DD-MM-YYYY HH:MM:SS" (Яндекс Маркет)
    if (dateString.includes('-') && dateString.includes(':')) {
      const dateParts = dateString.split(' ')[0].split('-');
      // Если первая часть - день (2 цифры)
      if (dateParts.length === 3 && dateParts[0].length === 2 && dateParts[1].length === 2 && dateParts[2].length === 4) {
        const [day, month, year] = dateParts;
        const timePart = dateString.split(' ')[1] || '00:00:00';
        
        // Создаем объект Date в правильном формате (YYYY-MM-DD)
        const dateObj = new Date(`${year}-${month}-${day}T${timePart}`);
        
        // Форматируем дату и время
        const formattedDate = dateObj.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        const formattedTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
        
        return `${formattedDate} ${formattedTime}`;
      }
    }
    
    // Стандартная обработка для ISO формата
    const date = new Date(dateString);
    
    // Формат даты ДД.ММ.ГГГГ
    const formattedDate = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Формат времени Ч:М с ведущими нулями
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    
    // Объединяем дату и время
    return `${formattedDate} ${formattedTime}`;
  } catch (e) {
    console.error('Ошибка при форматировании даты:', e, dateString);
    return dateString;
  }
};

/**
 * Форматирует цену в формате валюты
 * @param price Цена (строка или число)
 * @returns Отформатированная цена
 */
export const formatPrice = (price?: string | number): string => {
  if (price === undefined || price === null) return '—';
  
  // Если цена передана как строка, преобразуем ее в число
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return String(price);
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(numPrice);
};

/**
 * Получает следующий статус для заказа
 * @param currentStatus Текущий статус
 * @returns Следующий статус
 */
export const getNextStatus = (currentStatus: string): string => {
  switch (currentStatus.toLowerCase()) {
    case 'new':
      return 'assembly';
    case 'assembly':
      return 'ready_to_shipment';
    case 'ready_to_shipment':
      return 'shipped';
    default:
      return 'new';
  }
};

/**
 * Получает текст для кнопки смены статуса
 * @param status Текущий статус
 * @returns Текст кнопки
 */
export const getStatusButtonText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'Начать сборку';
    case 'assembly':
      return 'Завершить сборку';
    case 'ready_to_shipment':
      return 'Отгрузить';
    case 'shipped':
      return 'Отгружено';
    default:
      return 'Сменить статус';
  }
};

/**
 * Проверяет, является ли строка валидным base64-изображением
 * @param str Строка для проверки
 * @returns true, если строка - валидное base64-изображение
 */
export const isBase64Image = (str?: string): boolean => {
  if (!str) return false;
  
  // Проверка на формат base64
  const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/i;
  if (!regex.test(str)) {
    // Пробуем добавить префикс для проверки содержимого
    try {
      const testStr = `data:image/png;base64,${str}`;
      // Проверка на декодируемость
      return btoa(atob(str)) === str;
    } catch (e) {
      return false;
    }
  }
  
  return true;
};

/**
 * Преобразует строку base64 в URL изображения
 * @param base64String Строка base64
 * @returns URL изображения
 */
export const getImageSrcFromBase64 = (base64String?: string): string => {
  if (!base64String) return '';
  
  // Если строка уже имеет префикс data:image, возвращаем как есть
  if (base64String.startsWith('data:image')) {
    return base64String;
  }
  
  // Иначе добавляем префикс для PNG-изображения
  return `data:image/png;base64,${base64String}`;
};

/**
 * Группирует заказы по артикулу
 * @param orders Список заказов
 * @returns Заказы, сгруппированные по артикулу
 */
export const groupOrdersByArticle = (orders: WbOrder[]): {[key: string]: WbOrder[]} => {
  return orders.reduce((result: {[key: string]: WbOrder[]}, order) => {
    // Пытаемся получить наиболее подходящий артикул
    let articleKey = 'Неизвестный артикул';
    
    // Пробуем найти подходящий артикул в разных полях
    if (order.supplierArticle) {
      // Приоритет 1: supplierArticle (это обычно настоящий код артикула поставщика)
      articleKey = order.supplierArticle.toString();
    } else if (order.vendorCode) {
      // Приоритет 2: vendorCode
      articleKey = order.vendorCode.toString();
    } else if (order.article) {
      // Приоритет 3: article (может содержать название)
      const articleStr = order.article.toString();
      
      // Если артикул похож на название (длинная строка с пробелами), 
      // попробуем найти что-то более подходящее
      if (articleStr.length > 20 && articleStr.includes(' ')) {
        if (order.nm_id) {
          // Приоритет 4: nm_id с префиксом
          articleKey = `NM_${order.nm_id}`;
        } else if (order.order_uid && order.order_uid.includes('_')) {
          // Приоритет 5: первая часть order_uid (если она не слишком длинная)
          const parts = order.order_uid.split('_');
          if (parts.length > 1 && parts[0].length <= 15) {
            articleKey = parts[0];
          } else {
            articleKey = articleStr;
          }
        } else {
          articleKey = articleStr;
        }
      } else {
        // Если артикул не похож на название, используем его как есть
        articleKey = articleStr;
      }
    } else if (order.nm_id) {
      // Приоритет 6: nm_id как последний вариант
      articleKey = `NM_${order.nm_id}`;
    }
    
    // Заносим заказ в соответствующую группу
    if (!result[articleKey]) {
      result[articleKey] = [];
    }
    result[articleKey].push(order);
    return result;
  }, {});
}; 