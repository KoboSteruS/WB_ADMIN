/**
 * Сервис для генерации PDF документов с данными заказов
 */
import { WbOrder, LegalEntity } from '../types/wildberries';
import { 
  createPDFWithCyrillicSupport, 
  addTextToPDF, 
  addTitleToPDF, 
  addTableToPDF,
  loadAndCacheFont
} from '../utils/pdfUtils';
import { 
  formatPrice, 
  formatDate, 
  groupOrdersByArticle, 
  isBase64Image, 
  getImageSrcFromBase64 
} from '../utils/orderUtils';
import { jsPDF } from 'jspdf';

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
 * Генерация PDF #3: Наклейки для заказов
 */
export const generateStickersPDF = async (orders: WbOrder[]): Promise<void> => {
  try {
    // Увеличиваем ширину стикера, сохраняя пропорции
    const STICKER_WIDTH = 58; // ширина в мм (увеличена с 58 до 70)
    const STICKER_HEIGHT = 40; // высота в мм
    
    // Текущий временной штамп для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Если нет заказов, создаем пустой PDF
    if (orders.length === 0) {
      console.log('Нет заказов для создания стикеров');
      
      // Создаем стандартный PDF
      const doc = new jsPDF({
        unit: 'mm',
        format: [STICKER_WIDTH, STICKER_HEIGHT],
        orientation: 'landscape'
      });
      
      // Сохраняем пустой PDF
      const filename = `WB_Order_Stickers_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log('Создан пустой PDF-файл стикеров');
      return;
    }
    
    // Создаем массив промисов для предварительной обработки изображений
    const imagePromises = orders
      .filter(order => order.sticker && isBase64Image(order.sticker))
      .map(order => {
        return new Promise<{ order: WbOrder, img: HTMLImageElement }>((resolve, reject) => {
          try {
            const imgSrc = getImageSrcFromBase64(order.sticker);
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = () => {
              resolve({ order, img });
            };
            
            img.onerror = (error) => {
              console.error(`Ошибка загрузки изображения для заказа ${order.order_id}:`, error);
              reject(error);
            };
            
            img.src = imgSrc;
          } catch (error) {
            reject(error);
          }
        });
      });

    // Ждем загрузки всех изображений
    const loadedImages = await Promise.allSettled(imagePromises);
    
    // Создаем PDF документ с указанием точного размера страницы
    const pdfDoc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [58, 40],
      hotfixes: ['px_scaling'] // Исправление для масштабирования пикселей
    });
    
    // Обрабатываем каждое загруженное изображение
    let pageIndex = 0;
    
    loadedImages.forEach((result, index) => {
      // Добавляем новую страницу для каждого стикера, кроме первого
      if (index > 0) {
        pdfDoc.addPage([58, 40]);
      }
      
      if (result.status === 'fulfilled') {
        const { order, img } = result.value;
        
        try {
          // Для стикеров WB важнее показать всё изображение, чем сохранить пропорции
          // Растягиваем изображение на всю страницу
          pdfDoc.addImage(
            img, 
            'PNG', 
            0, // x - начинаем с левого края
            0, // y - начинаем с верхнего края
            STICKER_WIDTH, // используем всю ширину
            STICKER_HEIGHT // используем всю высоту
          );
          
          pageIndex++;
        } catch (error) {
          console.error(`Ошибка при добавлении стикера для заказа ${order.order_id}:`, error);
          pdfDoc.setFontSize(8);
          pdfDoc.text(`Ошибка стикера: ${order.order_id || 'Нет ID'}`, 5, 20);
        }
      } else {
        // В случае ошибки загрузки изображения, добавляем текст об ошибке
        pdfDoc.setFontSize(8);
        pdfDoc.text('Ошибка загрузки стикера', 5, 20);
      }
    });
    
    // Обрабатываем заказы, у которых нет стикеров
    const ordersWithoutStickers = orders.filter(order => !order.sticker || !isBase64Image(order.sticker));
    
    ordersWithoutStickers.forEach((order, index) => {
      // Добавляем новую страницу, если уже есть страницы
      if (pageIndex > 0 || index > 0) {
        pdfDoc.addPage([STICKER_WIDTH, STICKER_HEIGHT]);
      }
      
      // Добавляем текст о том, что стикер отсутствует
      pdfDoc.setFontSize(8);
      pdfDoc.text(`Нет стикера для заказа: ${order.order_id || 'Нет ID'}`, 5, 20);
      
      pageIndex++;
    });
    
    // Сохраняем PDF
    const filename = `WB_Order_Stickers_${timestamp}.pdf`;
    pdfDoc.save(filename);
    console.log(`PDF со стикерами успешно создан: ${filename}, страниц: ${pageIndex}`);
    
  } catch (error) {
    console.error('Ошибка при создании PDF со стикерами:', error);
    alert(`Произошла ошибка при создании PDF со стикерами: ${error instanceof Error ? (error as Error).message : String(error)}`);
  }
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