/**
 * Сервис для генерации PDF документов с данными заказов
 */
import { WbOrder, LegalEntity } from '../types/wildberries';
import { OzonOrder } from '../types/ozon';
import { YandexMarketOrder } from '../types/yandexmarket';
import { 
  createPDFWithCyrillicSupport, 
  addTextToPDF, 
  addTitleToPDF, 
  addTableToPDF,
  loadAndCacheFont,
  mergePDFsInOrder,
  downloadBlob
} from '../utils/pdfUtils';
import { 
  formatPrice, 
  formatDate, 
  groupOrdersByArticle, 
  isBase64Image, 
  getImageSrcFromBase64 
} from '../utils/orderUtils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Создает PDF документ с нестандартным размером страницы
 * @param width Ширина страницы в мм
 * @param height Высота страницы в мм
 */
const createCustomSizedPDF = async (width: number, height: number): Promise<any> => {
  try {
    // Создаем PDF документ с нужными размерами
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [width, height] // Пользовательский размер в мм
    }) as any;
    
    // Загружаем и получаем шрифт из кэша
    const base64Font = await loadAndCacheFont();
    
    // Добавляем шрифт в PDF
    doc.addFileToVFS('Roboto-Regular.ttf', base64Font);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    
    return doc;
  } catch (error) {
    console.error('Ошибка при создании PDF с нестандартным размером:', error);
    throw error;
  }
};

/**
 * Генерирует PDF документы для заказов
 * @param orders Список заказов
 * @param legalEntity Информация о юридическом лице
 */
export const generateOrdersPDF = async (
  orders: WbOrder[], 
  legalEntity?: LegalEntity
): Promise<void> => {
  // Сортируем все заказы по nm_id для единообразного порядка во всех PDF
  const sortedByNmId = [...orders].sort((a, b) => {
    const nmIdA = a.nm_id?.toString().toLowerCase() || '';
    const nmIdB = b.nm_id?.toString().toLowerCase() || '';
    return nmIdA.localeCompare(nmIdB);
  });
  
  try {
    // Шаг 1: Генерируем первый PDF с артикулами
    console.log('Генерация PDF #1: Сводка по артикулам');
    await generateArticlesSummaryPDF(sortedByNmId, legalEntity);
    
    // Шаг 2: Генерируем второй PDF со списком всех заказов (не только подтвержденных)
    console.log('Генерация PDF #2: Список всех заказов');
    await generateOrdersListPDF(sortedByNmId, legalEntity);
    
    // Шаг 3: Генерируем третий PDF со стикерами
    console.log('Генерация PDF #3: Наклейки для заказов');
    await generateStickersPDF(sortedByNmId);
    
    // Показываем уведомление об успешной генерации
    console.log('Все PDF-файлы успешно сгенерированы');
    alert('PDF-файлы успешно сгенерированы и сохранены');
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    alert(`Произошла ошибка при генерации PDF: ${error instanceof Error ? (error as Error).message : String(error)}`);
  }
};

/**
 * Генерация PDF #1: Сводка по артикулам с количеством
 */
export const generateArticlesSummaryPDF = async (
  orders: WbOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  // Используем nm_id вместо article для группировки
  const articleGroups: { [key: string]: WbOrder[] } = {};
  
  // Группируем заказы по nm_id вместо article
  orders.forEach(order => {
    const articleKey = order.nm_id?.toString() || 'unknown';
    if (!articleGroups[articleKey]) {
      articleGroups[articleKey] = [];
    }
    articleGroups[articleKey].push(order);
  });
  
  try {
    // Создаем PDF документ с поддержкой кириллицы
    const doc = await createPDFWithCyrillicSupport();
    
    // Текущий временной штамп для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Добавляем заголовок документа
    addTitleToPDF(doc, 'Сводка по заказам Wildberries', 15);
    
    
    // Формируем данные для таблицы с расширенной информацией
    const tableData = Object.entries(articleGroups).map(([articleKey, orderList]) => {
      // Подсчитаем общее количество заказов этого артикула
      const count = orderList.length;
      
      // Получаем название товара из первого заказа
      let productName = '';
      if (orderList.length > 0) {
        const firstOrder = orderList[0];
        productName = firstOrder.article?.toString() || '';
      }
      
      // Возвращаем строку для таблицы - артикул, название и количество
      return [
        articleKey, // Артикул (nm_id)
        productName, // Название товара
        count.toString() // Количество
      ];
    });
    
    // Заголовки таблицы - 3 колонки
    const headers = [
      'Артикул', 
      'Название',
      'Количество'
    ];
    
    // Добавляем таблицу с контролем ширины колонок
    addTableToPDF(doc, tableData, headers, 40, {
      fontSize: 10,
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' },
        2: { halign: 'center' }
      },
      // Задаем относительную ширину колонок в процентах от общей ширины таблицы
      columnWidths: [
        20, // Артикул - 20%
        60, // Название - 60%
        20  // Количество - 20%
      ]
    });
    
    // Сохраняем PDF
    const filename = `WB_Orders_Summary_${timestamp}.pdf`;
    doc.save(filename);
    console.log('PDF со сводкой по заказам сгенерирован');
    
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    alert('Произошла ошибка при создании PDF. Подробности в консоли.');
  }
};

/**
 * Генерация PDF #2: Список всех заказов
 */
export const generateOrdersListPDF = async (
  orders: WbOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  // Если нет заказов, не создаем PDF
  if (orders.length === 0) {
    console.log('Нет заказов для создания списка');
    alert('Нет заказов для создания PDF');
    return;
  }
  
  try {
    // Создаем PDF документ с поддержкой кириллицы в альбомной ориентации
    const doc = await createPDFWithCyrillicSupport({ orientation: 'landscape' });
    
    // Текущий временной штамп для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Добавляем заголовок документа напрямую, а не через addTitleToPDF
    doc.setFont('Roboto');
    doc.setFontSize(16);
    const title = 'Список заказов Wildberries';
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getStringUnitWidth(title) * 16 / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(title, x, 15);
    
    // Формируем данные для таблицы
    const tableData = orders.map(order => {
      // Используем nm_id как артикул и article как название товара
      const articleId = order.nm_id?.toString() || '';
      const productName = order.article?.toString() || '';
      
      // Получаем статус заказа для отображения в таблице
      const status = order.wb_status || order.own_status || '';
      
      // Формируем строки для офисов с коротким названием, если они слишком длинные
      let offices = '';
      if (order.offices && order.offices.length > 0) {
        offices = order.offices.map(off => {
          // Если название офиса длиннее 15 символов, сокращаем его
          if (off.length > 15) {
            // Оставляем первую часть названия до "_" или первые 10 символов
            const parts = off.split('_');
            return parts[0] || off.substring(0, 10);
          }
          return off;
        }).join(', ');
      }
      
      // Форматируем штрихкоды для компактного отображения
      let barcodes = '';
      if (order.skus && order.skus.length > 0) {
        barcodes = order.skus.join(',\n');
      }
      
      return [
        order.order_id?.toString() || '',
        articleId, // Артикул (nm_id)
        productName, // Название товара
        status, // Статус заказа
        barcodes, // Штрихкоды с возможным переносом
        formatPrice(order.sale_price) || '',
        formatDate(order.created_at) || '',
        offices, // Отформатированные офисы
        order.delivery_type?.toString() || '',
        order.supply_id?.toString() || ''
      ].map(value => String(value)); // Гарантируем, что все значения преобразованы в строки
    });
    
    // Заголовки таблицы - предельно короткие названия для лучшего отображения
    const headers = [
      'ID', 
      'Арт', 
      'Название',
      'Статус',
      'ШК', 
      'Цена', 
      'Дата', 
      'Офис', 
      'Тип', 
      'Пост.'
    ];
    
    // Добавляем таблицу с настройками переноса текста
    // Уменьшаем разрыв между заголовком и таблицей до минимума
    addTableToPDF(doc, tableData, headers, 18, {
      fontSize: 8,  // уменьшаем размер шрифта для альбомной ориентации и большого числа колонок
      styles: {
        overflow: 'linebreak', // Включаем перенос текста
        cellPadding: 1,        // Минимальные отступы в ячейках
        lineColor: [80, 80, 80], // Цвет линий
        lineWidth: 0.1,         // Минимальная толщина линий
        font: 'Roboto',         // Явно указываем шрифт для всей таблицы
        fontStyle: 'normal'    // Явно указываем стиль шрифта
      },
      headStyles: {
        font: 'Roboto',
        fontStyle: 'normal',
        halign: 'center',
        valign: 'middle',
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontSize: 8
      },
      columnStyles: {
        0: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },  // Явно указываем шрифт для каждой колонки
        1: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        2: { halign: 'left', overflow: 'linebreak', font: 'Roboto', fontStyle: 'normal' },  // Включаем перенос в названии товара
        3: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        4: { halign: 'left', overflow: 'linebreak', font: 'Roboto', fontStyle: 'normal' },  // Включаем перенос в штрихкодах
        5: { halign: 'right', font: 'Roboto', fontStyle: 'normal' },
        6: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        7: { halign: 'left', overflow: 'linebreak', font: 'Roboto', fontStyle: 'normal' },  // Включаем перенос в офисах
        8: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        9: { halign: 'center', font: 'Roboto', fontStyle: 'normal' }
      },
      // Задаем относительную ширину колонок
      columnWidths: [
        7,  // ID заказа
        8,  // Артикул (nm_id)
        18, // Название товара
        8,  // Статус заказа
        15, // Штрихкоды
        8,  // Цена
        10, // Дата создания
        16, // Офисы
        5,  // Тип доставки
        5   // ID поставки
      ],
      width: doc.internal.pageSize.getWidth() - 15, // отступы по 7.5мм с каждой стороны
      margin: { top: 3, bottom: 3 } // минимальные отступы
    });
    
    // Сохраняем PDF
    const filename = `WB_Orders_List_${timestamp}.pdf`;
    doc.save(filename);
    console.log('PDF со списком заказов сгенерирован');
    
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    alert('Произошла ошибка при создании PDF. Подробности в консоли.');
  }
};

/**
 * Генерация PDF со стикерами для заказов
 */
export const generateStickersPDF = (orders: WbOrder[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const stickerWidth = 100;
  const stickerHeight = 50;
  const stickersPerRow = 2;
  const stickersPerPage = 8;

  let currentPage = 1;
  let currentRow = 0;
  let currentCol = 0;

  orders.forEach((order, index) => {
    if (index > 0 && index % stickersPerPage === 0) {
      doc.addPage();
      currentPage++;
      currentRow = 0;
      currentCol = 0;
    }

    const x = margin + (currentCol * stickerWidth);
    const y = margin + (currentRow * stickerHeight);

    // Рисуем рамку стикера
    doc.rect(x, y, stickerWidth, stickerHeight);

    // Добавляем информацию о заказе
    doc.setFontSize(10);
    doc.text(`Заказ: ${order.order_id || '—'}`, x + 5, y + 10);
    doc.text(`Артикул: ${order.nm_id || '—'}`, x + 5, y + 20);
    doc.text(`Часть А: ${order.part_a || '—'}`, x + 5, y + 30);
    doc.text(`Часть В: ${order.part_b || '—'}`, x + 5, y + 40);

    // Обновляем позицию для следующего стикера
    currentCol++;
    if (currentCol >= stickersPerRow) {
      currentCol = 0;
      currentRow++;
    }
    });
    
    // Сохраняем PDF
  doc.save('stickers.pdf');
};

/**
 * Генерация PDF со штрих-кодом поставки
 * @param supplyBarcode Base64-строка штрих-кода поставки
 * @param supplyId ID поставки для отображения
 */
export const generateSupplyBarcodePDF = async (supplyBarcode: string, supplyId: string): Promise<void> => {
  try {
    if (!supplyBarcode || !isBase64Image(supplyBarcode)) {
      alert('Штрих-код поставки отсутствует или некорректен');
      return;
    }
    
    // Точные размеры стикера
    const PDF_WIDTH = 58; // ширина стикера в мм
    const PDF_HEIGHT = 40; // высота стикера в мм
    
    // Текущий временной штамп для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Создаем PDF документ с заданным размером
    const pdfDoc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [PDF_WIDTH, PDF_HEIGHT], // Точный размер стикера
      hotfixes: ['px_scaling'] // Исправление для масштабирования пикселей
    });
    
    try {
      // Создаем изображение из base64
      const img = new Image();
      img.src = getImageSrcFromBase64(supplyBarcode);
      
      // Ждем загрузки изображения
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (error) => reject(error);
      });
      
      // Растягиваем изображение на всю страницу без сохранения пропорций
      pdfDoc.addImage(
        img, 
        'PNG', 
        0, // x - начинаем с левого края
        0, // y - начинаем с верхнего края
        PDF_WIDTH, // используем всю ширину
        PDF_HEIGHT // используем всю высоту
      );
      
      // Сохраняем PDF
      const filename = `WB_Supply_${supplyId}_${timestamp}.pdf`;
      pdfDoc.save(filename);
      console.log(`PDF со штрих-кодом поставки успешно создан: ${filename}`);
    } catch (error) {
      console.error('Ошибка при добавлении штрих-кода в PDF:', error);
      alert(`Ошибка при создании PDF со штрих-кодом: ${error instanceof Error ? (error as Error).message : String(error)}`);
    }
  } catch (error) {
    console.error('Ошибка при создании PDF со штрих-кодом поставки:', error);
    alert(`Произошла ошибка при создании PDF: ${error instanceof Error ? (error as Error).message : String(error)}`);
  }
};

/**
 * Генерирует набор отчетов по заказам Ozon
 * @param orders Список заказов Ozon
 * @param legalEntity Информация о юридическом лице
 */
export const generateOzonReportsPDF = async (
  orders: OzonOrder[], 
  legalEntity?: LegalEntity
): Promise<void> => {
  try {
    // Создаем PDF документы
    await generateOzonArticlesSummaryPDF(orders, legalEntity);
    await generateOzonOrdersListPDF(orders, legalEntity);
    await generateOzonStickersPDF(orders);
    
    console.log('Все PDF-файлы для Ozon успешно сгенерированы');
    alert('PDF-файлы для Ozon успешно сгенерированы и сохранены');
  } catch (error) {
    console.error('Ошибка при генерации PDF для Ozon:', error);
    alert(`Произошла ошибка при генерации PDF: ${error instanceof Error ? (error as Error).message : String(error)}`);
  }
};

/**
 * Генерация PDF: Сводка по артикулам Ozon
 */
export const generateOzonArticlesSummaryPDF = async (
  orders: OzonOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  // Проверяем, есть ли заказы
  if (orders.length === 0) {
    console.log('Нет заказов Ozon для создания сводки');
    return;
  }
  
  try {
    // Создаем PDF документ
    const doc = await createPDFWithCyrillicSupport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Добавляем заголовок с явным указанием шрифта
    doc.setFont('Roboto');
    doc.setFontSize(16);
    const title = 'Сводка по заказам Ozon';
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getStringUnitWidth(title) * 16 / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(title, x, 15);
    
    // Группируем заказы по SKU
    const articleGroups: { [key: string]: OzonOrder[] } = {};
    
    orders.forEach(order => {
      let sku = 'unknown';
      if (order.products && order.products.length > 0 && order.products[0].sku) {
        sku = String(order.products[0].sku);
      } else if (order.sku) {
        sku = String(order.sku);
      } else if (order.offer_id) {
        sku = String(order.offer_id);
      }
      
      if (!articleGroups[sku]) {
        articleGroups[sku] = [];
      }
      articleGroups[sku].push(order);
    });
    
    // Формируем данные для таблицы
    const tableData = Object.entries(articleGroups).map(([sku, orderList]) => {
      const count = orderList.length;
      
      let productName = '';
      if (orderList.length > 0) {
        const firstOrder = orderList[0];
        if (firstOrder.products && firstOrder.products.length > 0 && firstOrder.products[0].name) {
          productName = firstOrder.products[0].name;
        } else if (firstOrder.product_name) {
          productName = firstOrder.product_name;
        } else if (firstOrder.name) {
          productName = firstOrder.name;
        }
      }
      
      return [sku, productName, count.toString()];
    });
    
    // Заголовки таблицы
    const headers = ['Артикул', 'Название', 'Количество'];
    
    // Добавляем таблицу
    addTableToPDF(doc, tableData, headers, 40, {
      fontSize: 10,
      styles: {
        overflow: 'linebreak',
        cellPadding: 2,
        lineColor: [80, 80, 80],
        lineWidth: 0.1,
        font: 'Roboto',
        fontStyle: 'normal'
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fillColor: [0, 113, 188],
        textColor: [255, 255, 255],
        fontSize: 10,
        font: 'Roboto',
        fontStyle: 'normal'
      },
      columnStyles: {
        0: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        1: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        2: { halign: 'center', font: 'Roboto', fontStyle: 'normal' }
      },
      columnWidths: [20, 60, 20]
    });
    
    // Сохраняем PDF
    const filename = `Ozon_Orders_Summary_${timestamp}.pdf`;
    doc.save(filename);
    console.log('PDF со сводкой по заказам Ozon сгенерирован');
  } catch (error) {
    console.error('Ошибка при генерации PDF для Ozon:', error);
    alert('Произошла ошибка при создании PDF. Подробности в консоли.');
  }
};

/**
 * Генерация PDF: Список заказов Ozon
 */
export const generateOzonOrdersListPDF = async (
  orders: OzonOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  if (orders.length === 0) {
    console.log('Нет заказов Ozon для создания списка');
    return;
  }
  
  try {
    // Создаем PDF документ в альбомной ориентации
    const doc = await createPDFWithCyrillicSupport({ orientation: 'landscape' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Добавляем заголовок
    doc.setFont('Roboto');
    doc.setFontSize(16);
    const title = 'Список заказов Ozon';
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getStringUnitWidth(title) * 16 / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(title, x, 15);
    
    // Формируем данные для таблицы
    const tableData = orders.map(order => {
      let productName = '';
      let sku = '';
      
      if (order.products && order.products.length > 0) {
        productName = order.products[0].name || '';
        sku = String(order.products[0].sku || '');
      } else {
        productName = order.product_name || order.name || '';
        sku = String(order.sku || order.offer_id || '');
      }
      
      return [
        order.posting_number || order.order_id || '',
        sku,
        productName,
        order.status || '',
        formatPrice(order.price || order.products?.[0]?.price || 0),
        formatDate(order.in_process_at || order.created_at || order.created_date || ''),
        order.delivery_method?.warehouse || order.city || '',
        order.delivery_method?.name || order.delivery_type || '',
        order.customer?.name || order.customer_name || ''
      ].map(String);
    });
    
    // Заголовки таблицы
    const headers = [
      'Номер', 'Артикул', 'Товар', 'Статус', 'Цена', 
      'Дата', 'Склад', 'Доставка', 'Клиент'
    ];
    
    // Добавляем таблицу
    addTableToPDF(doc, tableData, headers, 18, {
      fontSize: 8,
      styles: {
        overflow: 'linebreak',
        cellPadding: 1,
        lineColor: [80, 80, 80],
        lineWidth: 0.1,
        font: 'Roboto',
        fontStyle: 'normal'
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fillColor: [0, 113, 188],
        textColor: [255, 255, 255],
        fontSize: 8,
        font: 'Roboto',
        fontStyle: 'normal'
      },
      columnStyles: {
        0: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        1: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        2: { halign: 'left', overflow: 'linebreak', font: 'Roboto', fontStyle: 'normal' },
        3: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        4: { halign: 'right', font: 'Roboto', fontStyle: 'normal' },
        5: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        6: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        7: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        8: { halign: 'left', font: 'Roboto', fontStyle: 'normal' }
      }
    });
    
    // Сохраняем PDF
    const filename = `Ozon_Orders_List_${timestamp}.pdf`;
    doc.save(filename);
    console.log('PDF со списком заказов Ozon сгенерирован');
  } catch (error) {
    console.error('Ошибка при генерации PDF со списком Ozon:', error);
    alert('Произошла ошибка при создании PDF. Подробности в консоли.');
  }
};

/**
 * Генерация PDF со стикерами для заказов Ozon
 */
export const generateOzonStickersPDF = async (orders: OzonOrder[]) => {
  try {
    const ordersWithStickers = orders.filter(order => order.sticker_pdf);
    
    if (ordersWithStickers.length === 0) {
      console.log('Нет заказов Ozon со стикерами');
      alert('Нет заказов Ozon со стикерами для генерации PDF');
      return;
    }
    
    // Получаем URLs стикеров
    const stickerUrls = ordersWithStickers.map(order => `http://62.113.44.196:8080${order.sticker_pdf}`);
    
    // Объединяем PDF-файлы стикеров
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Ozon_Stickers_${timestamp}.pdf`;
    
    const mergedPdfBlob = await mergePDFsInOrder(stickerUrls);
    downloadBlob(mergedPdfBlob, fileName);
    
    console.log(`PDF со стикерами Ozon сгенерирован: ${ordersWithStickers.length} стикеров`);
  } catch (error) {
    console.error('Ошибка при генерации PDF со стикерами Ozon:', error);
    alert(`Ошибка при генерации стикеров Ozon: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Генерирует набор отчетов по заказам Яндекс Маркет
 * @param orders Список заказов Яндекс Маркет
 * @param legalEntity Информация о юридическом лице
 */
export const generateYandexReportsPDF = async (
  orders: YandexMarketOrder[], 
  legalEntity?: LegalEntity
): Promise<void> => {
  try {
    // Создаем PDF документы
    await generateYandexArticlesSummaryPDF(orders, legalEntity);
    await generateYandexOrdersListPDF(orders, legalEntity);
    await generateYandexStickersPDF(orders);
    
    console.log('Все PDF-файлы для Яндекс Маркет успешно сгенерированы');
    alert('PDF-файлы для Яндекс Маркет успешно сгенерированы и сохранены');
  } catch (error) {
    console.error('Ошибка при генерации PDF для Яндекс Маркет:', error);
    alert(`Произошла ошибка при генерации PDF: ${error instanceof Error ? (error as Error).message : String(error)}`);
  }
};

/**
 * Генерация PDF: Сводка по артикулам Яндекс Маркет
 */
export const generateYandexArticlesSummaryPDF = async (
  orders: YandexMarketOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  // Проверяем, есть ли заказы
  if (orders.length === 0) {
    console.log('Нет заказов Яндекс Маркет для создания сводки');
    return;
  }
  
  try {
    // Создаем PDF документ
    const doc = await createPDFWithCyrillicSupport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Добавляем заголовок с явным указанием шрифта
    doc.setFont('Roboto');
    doc.setFontSize(16);
    const title = 'Сводка по заказам Яндекс Маркет';
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getStringUnitWidth(title) * 16 / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(title, x, 15);
    
    // Группируем заказы по SKU
    const articleGroups: { [key: string]: YandexMarketOrder[] } = {};
    
    orders.forEach(order => {
      let sku = 'unknown';
      if (order.items && order.items.length > 0 && order.items[0].shopSku) {
        sku = String(order.items[0].shopSku);
      } else if (order.shop_sku) {
        sku = String(order.shop_sku);
      } else if (order.offer_id) {
        sku = String(order.offer_id);
      }
      
      if (!articleGroups[sku]) {
        articleGroups[sku] = [];
      }
      articleGroups[sku].push(order);
    });
    
    // Формируем данные для таблицы
    const tableData = Object.entries(articleGroups).map(([sku, orderList]) => {
      const count = orderList.length;
      
      let productName = '';
      if (orderList.length > 0) {
        const firstOrder = orderList[0];
        if (firstOrder.items && firstOrder.items.length > 0 && firstOrder.items[0].offerName) {
          productName = firstOrder.items[0].offerName;
        } else if (firstOrder.name) {
          productName = firstOrder.name;
        } else if (firstOrder.product_name) {
          productName = firstOrder.product_name;
        }
      }
      
      return [sku, productName, count.toString()];
    });
    
    // Заголовки таблицы
    const headers = ['Артикул', 'Название', 'Количество'];
    
    // Добавляем таблицу
    addTableToPDF(doc, tableData, headers, 40, {
      fontSize: 10,
      styles: {
        overflow: 'linebreak',
        cellPadding: 2,
        lineColor: [80, 80, 80],
        lineWidth: 0.1,
        font: 'Roboto',
        fontStyle: 'normal'
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fillColor: [255, 204, 0],
        textColor: [50, 50, 50],
        fontSize: 10,
        font: 'Roboto',
        fontStyle: 'normal'
      },
      columnStyles: {
        0: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        1: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        2: { halign: 'center', font: 'Roboto', fontStyle: 'normal' }
      },
      columnWidths: [20, 60, 20]
    });
    
    // Сохраняем PDF
    const filename = `Yandex_Orders_Summary_${timestamp}.pdf`;
    doc.save(filename);
    console.log('PDF со сводкой по заказам Яндекс Маркет сгенерирован');
  } catch (error) {
    console.error('Ошибка при генерации PDF для Яндекс Маркет:', error);
    alert('Произошла ошибка при создании PDF. Подробности в консоли.');
  }
};

/**
 * Генерация PDF: Список заказов Яндекс Маркет
 */
export const generateYandexOrdersListPDF = async (
  orders: YandexMarketOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  if (orders.length === 0) {
    console.log('Нет заказов Яндекс Маркет для создания списка');
    return;
  }
  
  try {
    // Создаем PDF документ в альбомной ориентации
    const doc = await createPDFWithCyrillicSupport({ orientation: 'landscape' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Добавляем заголовок
    doc.setFont('Roboto');
    doc.setFontSize(16);
    const title = 'Список заказов Яндекс Маркет';
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getStringUnitWidth(title) * 16 / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(title, x, 15);
    
    // Формируем данные для таблицы
    const tableData = orders.map(order => {
      let productName = '';
      let sku = '';
      
      if (order.items && order.items.length > 0) {
        productName = order.items[0].offerName || '';
        sku = String(order.items[0].shopSku || '');
      } else {
        productName = order.name || order.product_name || '';
        sku = String(order.shop_sku || order.offer_id || '');
      }
      
      return [
        order.order_id || order.orderId || '',
        sku,
        productName,
        order.status || '',
        order.substatus || '',
        formatPrice(order.price || order.buyerTotal || 0),
        formatDate(order.creationDate || order.created_at || order.created_date || ''),
        order.delivery?.region?.name || order.region || order.delivery_region || '',
        order.delivery?.type || order.delivery_type || '',
        order.buyer?.firstName || order.customer_name || ''
      ].map(String);
    });
    
    // Заголовки таблицы
    const headers = [
      'Номер', 'Артикул', 'Товар', 'Статус', 'Подстатус', 'Цена', 
      'Дата', 'Регион', 'Доставка', 'Клиент'
    ];
    
    // Добавляем таблицу
    addTableToPDF(doc, tableData, headers, 18, {
      fontSize: 8,
      styles: {
        overflow: 'linebreak',
        cellPadding: 1,
        lineColor: [80, 80, 80],
        lineWidth: 0.1,
        font: 'Roboto',
        fontStyle: 'normal'
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fillColor: [255, 204, 0],
        textColor: [50, 50, 50],
        fontSize: 8,
        font: 'Roboto',
        fontStyle: 'normal'
      },
      columnStyles: {
        0: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        1: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        2: { halign: 'left', overflow: 'linebreak', font: 'Roboto', fontStyle: 'normal' },
        3: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        4: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        5: { halign: 'right', font: 'Roboto', fontStyle: 'normal' },
        6: { halign: 'center', font: 'Roboto', fontStyle: 'normal' },
        7: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        8: { halign: 'left', font: 'Roboto', fontStyle: 'normal' },
        9: { halign: 'left', font: 'Roboto', fontStyle: 'normal' }
      }
    });
    
    // Сохраняем PDF
    const filename = `Yandex_Orders_List_${timestamp}.pdf`;
    doc.save(filename);
    console.log('PDF со списком заказов Яндекс Маркет сгенерирован');
  } catch (error) {
    console.error('Ошибка при генерации PDF со списком Яндекс Маркет:', error);
    alert('Произошла ошибка при создании PDF. Подробности в консоли.');
  }
};

/**
 * Генерация PDF со стикерами для заказов Яндекс Маркет
 */
export const generateYandexStickersPDF = async (orders: YandexMarketOrder[]) => {
  try {
    const ordersWithStickers = orders.filter(order => order.sticker_pdf);
    
    if (ordersWithStickers.length === 0) {
      console.log('Нет заказов Яндекс Маркет со стикерами');
      alert('Нет заказов Яндекс Маркет со стикерами для генерации PDF');
      return;
    }
    
    // Получаем URLs стикеров
    const stickerUrls = ordersWithStickers.map(order => `http://62.113.44.196:8080${order.sticker_pdf}`);
    
    // Объединяем PDF-файлы стикеров
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Yandex_Stickers_${timestamp}.pdf`;
    
    const mergedPdfBlob = await mergePDFsInOrder(stickerUrls);
    downloadBlob(mergedPdfBlob, fileName);
    
    console.log(`PDF со стикерами Яндекс Маркет сгенерирован: ${ordersWithStickers.length} стикеров`);
  } catch (error) {
    console.error('Ошибка при генерации PDF со стикерами Яндекс Маркет:', error);
    alert(`Ошибка при генерации стикеров Яндекс Маркет: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Генерация PDF со штрих-кодами поставок Wildberries: объединение всех в один PDF
 */
export const generateWbMergedStickersPDF = async (orders: WbOrder[]) => {
  try {
    // Отбираем только заказы с supply_barcode
    const ordersWithStickers = orders.filter(order => order.supply_barcode);
    
    if (ordersWithStickers.length === 0) {
      console.log('Нет заказов Wildberries со штрих-кодами поставок');
      alert('Нет заказов Wildberries со штрих-кодами поставок для объединения в PDF');
      return;
    }
    
    // Создаем временную папку для хранения отдельных PDF
    const blobsArray: Blob[] = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Для каждого штрих-кода создаем отдельный PDF с правильным размером
    for (const order of ordersWithStickers) {
      // Пропускаем заказы без штрих-кода
      if (!order.supply_barcode || !isBase64Image(order.supply_barcode)) {
        continue;
      }
      
      try {
        // Точные размеры стикера
        const PDF_WIDTH = 58; // ширина стикера в мм
        const PDF_HEIGHT = 40; // высота стикера в мм
        
        // Создаем PDF документ с заданным размером
        const pdfDoc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [PDF_WIDTH, PDF_HEIGHT], // Точный размер стикера
          hotfixes: ['px_scaling'] // Исправление для масштабирования пикселей
        });
        
        // Создаем изображение из base64
        const img = new Image();
        img.src = getImageSrcFromBase64(order.supply_barcode);
        
        // Ждем загрузки изображения
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = (error) => reject(error);
        });
        
        // Добавляем штрих-код на страницу
        pdfDoc.addImage(
          img, 
          'PNG', 
          0, // x - начинаем с левого края
          0, // y - начинаем с верхнего края
          PDF_WIDTH, // используем всю ширину
          PDF_HEIGHT // используем всю высоту
        );
        
        // Конвертируем PDF в Blob
        const pdfBlob = pdfDoc.output('blob');
        blobsArray.push(pdfBlob);
      } catch (error) {
        console.error(`Ошибка при создании PDF для заказа ${order.order_id}:`, error);
      }
    }
    
    // Проверяем, есть ли PDF для объединения
    if (blobsArray.length === 0) {
      alert('Не удалось создать PDF для штрих-кодов поставок');
      return;
    }
    
    // Объединяем все PDF в один файл
    const { PDFDocument } = await import('pdf-lib');
    
    // Создаем новый PDF документ
    const mergedPdf = await PDFDocument.create();
    
    // Для каждого Blob добавляем страницы в объединенный PDF
    for (const blob of blobsArray) {
      // Преобразуем Blob в ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer();
      // Загружаем PDF из ArrayBuffer
      const pdf = await PDFDocument.load(arrayBuffer);
      // Копируем все страницы в объединенный PDF
      const pageIndices = Array.from({ length: pdf.getPageCount() }, (_, i) => i);
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }
    
    // Сохраняем объединенный PDF
    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    
    // Скачиваем объединенный PDF
    const fileName = `WB_Supply_Stickers_Combined_${timestamp}.pdf`;
    downloadBlob(mergedPdfBlob, fileName);
    
    console.log(`PDF с объединенными штрих-кодами Wildberries сгенерирован: ${blobsArray.length} штрих-кодов`);
    alert(`Объединенный PDF с ${blobsArray.length} штрих-кодами поставок Wildberries сгенерирован`);
  } catch (error) {
    console.error('Ошибка при генерации PDF с объединенными штрих-кодами Wildberries:', error);
    alert(`Ошибка при генерации PDF с объединенными штрих-кодами Wildberries: ${error instanceof Error ? error.message : String(error)}`);
  }
}; 