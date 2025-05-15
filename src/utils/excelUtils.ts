/**
 * Утилиты для работы с Excel файлами
 */
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { WbOrder } from '../types/wildberries';
import { OzonOrder } from '../types/ozon';
import { YandexMarketOrder } from '../types/yandexmarket';

/**
 * Создает и сохраняет Excel файл
 * @param data Данные для Excel (массив массивов или объектов)
 * @param headers Заголовки столбцов
 * @param sheetName Название листа
 * @param fileName Имя файла
 */
export const createAndSaveExcel = (
  data: any[][],
  headers: string[],
  sheetName: string = 'Лист1',
  fileName: string = 'export.xlsx'
): void => {
  try {
    // Создаем данные для Excel с заголовками
    const excelData = [headers, ...data];

    // Создаем книгу и лист
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Автоматически настраиваем ширину столбцов
    const colWidths = estimateColumnWidths(excelData);
    ws['!cols'] = colWidths.map(width => ({ wch: width }));
    
    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Генерируем бинарные данные
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Создаем Blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Сохраняем файл
    saveAs(blob, fileName);
    
    console.log(`Excel файл "${fileName}" успешно создан`);
  } catch (error) {
    console.error('Ошибка при создании Excel файла:', error);
    throw error;
  }
};

/**
 * Оценивает оптимальную ширину столбцов на основе содержимого
 * @param data Данные таблицы (включая заголовки)
 * @returns Массив с шириной для каждого столбца
 */
const estimateColumnWidths = (data: any[][]): number[] => {
  if (!data || data.length === 0) return [];
  
  // Определяем количество столбцов по первой строке данных
  const columnCount = data[0].length;
  const widths = Array(columnCount).fill(10); // Начальная ширина для всех столбцов
  
  // Проходим по всем данным и оцениваем необходимую ширину
  data.forEach(row => {
    row.forEach((cell, colIndex) => {
      if (colIndex < columnCount) {
        const cellValue = String(cell || '');
        const cellWidth = Math.min(50, Math.max(10, cellValue.length + 2)); // Ограничиваем ширину от 10 до 50
        widths[colIndex] = Math.max(widths[colIndex], cellWidth);
      }
    });
  });
  
  return widths;
};

/**
 * Устанавливает стили для ячеек заголовка (для расширенного стилизованного экспорта)
 * @param worksheet Рабочий лист Excel
 * @param range Диапазон ячеек для заголовка
 */
export const setHeaderStyle = (worksheet: XLSX.WorkSheet, range: XLSX.Range): void => {
  const headerStyle = {
    fill: { fgColor: { rgb: "4287F5" } }, // Синий цвет фона
    font: { color: { rgb: "FFFFFF" }, bold: true }, // Белый цвет текста, жирный
    alignment: { horizontal: "center", vertical: "center" } // Центрирование текста
  };
  
  // Применяем стиль к каждой ячейке заголовка
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: range.s.r, c: col });
    if (!worksheet[cellRef]) {
      worksheet[cellRef] = { t: 's', v: '' };
    }
    worksheet[cellRef].s = headerStyle;
  }
};

/**
 * Создает объект с настройками автоматического размера столбцов
 * @param data Данные для определения размера столбцов
 * @param headers Заголовки столбцов
 * @returns Настройки ширины для каждого столбца
 */
export const autoSizeColumns = (data: any[][], headers: string[]): { [key: string]: number } => {
  const colWidths: { [key: string]: number } = {};
  
  // Устанавливаем начальную ширину на основе длины заголовков
  headers.forEach((header, index) => {
    colWidths[XLSX.utils.encode_col(index)] = Math.max(10, header.length);
  });
  
  // Проверяем длину данных в каждой ячейке
  data.forEach(row => {
    row.forEach((cell, index) => {
      const cellValue = String(cell || '');
      const currentWidth = colWidths[XLSX.utils.encode_col(index)] || 0;
      // Ограничиваем максимальную ширину 50 символами
      colWidths[XLSX.utils.encode_col(index)] = Math.min(50, Math.max(currentWidth, cellValue.length));
    });
  });
  
  return colWidths;
};

/**
 * Форматирует данные заказов для экспорта в Excel
 * @param orders Массив заказов
 * @returns Массив форматированных данных для Excel
 */
export const formatOrdersForExcel = (orders: WbOrder[]): any[][] => {
  return orders.map(order => [
    order.order_id || '',
    order.nm_id || '',
    order.article || '',
    order.wb_status || order.own_status || '',
    order.skus ? order.skus.join(', ') : '',
    order.sale_price || '',
    order.created_at ? new Date(order.created_at).toLocaleDateString() : '',
    order.offices ? order.offices.join(', ') : '',
    order.delivery_type || '',
    order.supply_id || ''
  ]);
};

/**
 * Группирует заказы по артикулу для создания сводки
 * @param orders Массив заказов
 * @returns Массив сгруппированных данных для Excel
 */
export const groupOrdersForExcelSummary = (orders: WbOrder[]): any[][] => {
  // Группируем заказы по nm_id
  const articleGroups: { [key: string]: WbOrder[] } = {};
  
  orders.forEach(order => {
    const articleKey = order.nm_id?.toString() || 'unknown';
    if (!articleGroups[articleKey]) {
      articleGroups[articleKey] = [];
    }
    articleGroups[articleKey].push(order);
  });
  
  // Преобразуем группы в формат для Excel
  return Object.entries(articleGroups).map(([articleKey, orderList]) => {
    // Подсчитываем количество заказов с этим артикулом
    const count = orderList.length;
    
    // Получаем название товара из первого заказа
    let productName = '';
    if (orderList.length > 0) {
      const firstOrder = orderList[0];
      productName = firstOrder.article?.toString() || '';
    }
    
    // Возвращаем строку для Excel - артикул, название и количество
    return [
      articleKey, // Артикул (nm_id)
      productName, // Название товара
      count // Количество
    ];
  });
};

/**
 * Группирует заказы Ozon по артикулу для создания сводки
 * @param orders Массив заказов Ozon
 * @returns Массив сгруппированных данных для Excel
 */
export const groupOzonOrdersForExcelSummary = (orders: OzonOrder[]): any[][] => {
  // Группируем заказы по артикулу (offer_id или sku)
  const articleGroups: { [key: string]: OzonOrder[] } = {};
  
  orders.forEach(order => {
    // Определяем идентификатор товара
    // Приоритет: 1) sku из products, 2) sku, 3) offer_id
    let articleKey = 'unknown';
    if (order.products && order.products.length > 0 && order.products[0].sku) {
      articleKey = String(order.products[0].sku);
    } else if (order.sku) {
      articleKey = String(order.sku);
    } else if (order.offer_id) {
      articleKey = String(order.offer_id);
    }
    
    if (!articleGroups[articleKey]) {
      articleGroups[articleKey] = [];
    }
    articleGroups[articleKey].push(order);
  });
  
  // Преобразуем группы в формат для Excel
  return Object.entries(articleGroups).map(([articleKey, orderList]) => {
    // Подсчитываем количество заказов этого товара
    const count = orderList.length;
    
    // Получаем название товара из первого заказа
    let productName = '';
    if (orderList.length > 0) {
      const firstOrder = orderList[0];
      // Приоритет: 1) name в products, 2) product_name, 3) name
      if (firstOrder.products && firstOrder.products.length > 0 && firstOrder.products[0].name) {
        productName = firstOrder.products[0].name;
      } else if (firstOrder.product_name) {
        productName = firstOrder.product_name;
      } else if (firstOrder.name) {
        productName = firstOrder.name;
      }
    }
    
    // Возвращаем строку для Excel - артикул, название и количество
    return [
      articleKey, // Артикул (sku или offer_id)
      productName, // Название товара
      count // Количество
    ];
  });
};

/**
 * Группирует заказы Яндекс Маркет по артикулу для создания сводки
 * @param orders Массив заказов Яндекс Маркет
 * @returns Массив сгруппированных данных для Excel
 */
export const groupYandexOrdersForExcelSummary = (orders: YandexMarketOrder[]): any[][] => {
  // Группируем заказы по артикулу (shop_sku или offer_id)
  const articleGroups: { [key: string]: YandexMarketOrder[] } = {};
  
  orders.forEach(order => {
    // Определяем идентификатор товара
    // Приоритет: 1) shopSku из items, 2) shop_sku, 3) offer_id
    let articleKey = 'unknown';
    if (order.items && order.items.length > 0 && order.items[0].shopSku) {
      articleKey = String(order.items[0].shopSku);
    } else if (order.shop_sku) {
      articleKey = String(order.shop_sku);
    } else if (order.offer_id) {
      articleKey = String(order.offer_id);
    }
    
    if (!articleGroups[articleKey]) {
      articleGroups[articleKey] = [];
    }
    articleGroups[articleKey].push(order);
  });
  
  // Преобразуем группы в формат для Excel
  return Object.entries(articleGroups).map(([articleKey, orderList]) => {
    // Подсчитываем количество заказов этого товара
    const count = orderList.length;
    
    // Получаем название товара из первого заказа
    let productName = '';
    if (orderList.length > 0) {
      const firstOrder = orderList[0];
      // Приоритет: 1) offerName в items, 2) name, 3) product_name
      if (firstOrder.items && firstOrder.items.length > 0 && firstOrder.items[0].offerName) {
        productName = firstOrder.items[0].offerName;
      } else if (firstOrder.name) {
        productName = firstOrder.name;
      } else if (firstOrder.product_name) {
        productName = firstOrder.product_name;
      }
    }
    
    // Возвращаем строку для Excel - артикул, название и количество
    return [
      articleKey, // Артикул (shop_sku или offer_id)
      productName, // Название товара
      count // Количество
    ];
  });
}; 