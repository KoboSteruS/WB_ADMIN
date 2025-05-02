/**
 * Сервис для генерации PDF документов с данными заказов
 */
import { WbOrder, LegalEntity } from '../types/wildberries';
import { 
  createPDFWithCyrillicSupport, 
  addTextToPDF, 
  addTitleToPDF, 
  addTableToPDF,
  // Импортируем для возможного использования в будущем
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createCyrillicPDF,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addCyrillicText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addCyrillicTitle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addCyrillicTable
} from '../utils/pdfUtils';
import { 
  formatPrice, 
  formatDate, 
  groupOrdersByArticle, 
  isBase64Image, 
  getImageSrcFromBase64 
} from '../utils/orderUtils';

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
    
    // Добавляем информацию о юридическом лице (если есть)
    if (legalEntity) {
      const legalText = `Юридическое лицо: ${legalEntity.title} (ИНН: ${legalEntity.inn})`;
      addTextToPDF(doc, legalText, 0, 30, { fontSize: 10, align: 'center' });
    }
    
    // Добавляем дату и время генерации
    const now = new Date();
    const dateTimeText = `Документ сгенерирован: ${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU')}`;
    const yPos = legalEntity ? 40 : 30;
    addTextToPDF(doc, dateTimeText, 0, yPos, { fontSize: 10, align: 'center' });
    
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
    addTableToPDF(doc, tableData, headers, legalEntity ? 50 : 40, {
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
    
    // Добавляем заголовок документа
    addTitleToPDF(doc, 'Список заказов Wildberries', 15);
    
    // Добавляем информацию о юридическом лице (если есть)
    if (legalEntity) {
      const legalText = `Юридическое лицо: ${legalEntity.title} (ИНН: ${legalEntity.inn})`;
      addTextToPDF(doc, legalText, 0, 30, { fontSize: 10, align: 'center' });
    }
    
    // Добавляем дату и время генерации
    const now = new Date();
    const dateTimeText = `Документ сгенерирован: ${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU')}`;
    const yPos = legalEntity ? 40 : 30;
    addTextToPDF(doc, dateTimeText, 0, yPos, { fontSize: 10, align: 'center' });
    
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
    
    // Заголовки таблицы
    const headers = [
      'ID заказа', 
      'Артикул', 
      'Название',
      'Статус',
      'Штрихкоды', 
      'Цена', 
      'Дата создания', 
      'Офисы', 
      'Тип доставки', 
      'ID поставки'
    ];
    
    // Добавляем таблицу с настройками переноса текста
    addTableToPDF(doc, tableData, headers, legalEntity ? 50 : 40, {
      fontSize: 8,  // уменьшаем размер шрифта для альбомной ориентации и большого числа колонок
      styles: {
        overflow: 'linebreak', // Включаем перенос текста
        cellPadding: 2,        // Небольшие отступы в ячейках
        lineColor: [80, 80, 80], // Цвет линий
        lineWidth: 0.1          // Толщина линий
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'left', overflow: 'linebreak' },  // Включаем перенос в названии товара
        3: { halign: 'center' },
        4: { halign: 'left', overflow: 'linebreak' },  // Включаем перенос в штрихкодах
        5: { halign: 'right' },
        6: { halign: 'center' },
        7: { halign: 'left', overflow: 'linebreak' },  // Включаем перенос в офисах
        8: { halign: 'center' },
        9: { halign: 'center' }
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
      width: doc.internal.pageSize.getWidth() - 20, // отступы по 10мм с каждой стороны
      margin: { top: 10, bottom: 10 } // добавляем верхний и нижний отступы
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
    // Создаем PDF документ с поддержкой кириллицы
    const doc = await createPDFWithCyrillicSupport();
    
    // Текущий временной штамп для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Добавляем заголовок
    addTitleToPDF(doc, 'Наклейки для заказов Wildberries', 15);
    
    // Добавляем дату и время создания документа
    const now = new Date();
    addTextToPDF(
      doc,
      `Документ сгенерирован: ${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU')}`,
      0,
      25,
      { fontSize: 10, align: 'center' }
    );
    
    // Фильтруем заказы, у которых есть стикеры
    const ordersWithStickers = orders.filter(order => order.sticker && isBase64Image(order.sticker));
    
    // Если нет стикеров, создаем PDF с информационным сообщением
    if (ordersWithStickers.length === 0) {
      console.log('Нет заказов со стикерами для создания PDF');
      
      // Добавляем информационное сообщение
      addTextToPDF(
        doc,
        'В выбранных заказах отсутствуют стикеры',
        0,
        50,
        { fontSize: 14, align: 'center' }
      );
      
      // Добавляем пояснительный текст
      addTextToPDF(
        doc,
        'Для получения стикеров необходимо подтвердить заказы и дождаться их обработки маркетплейсом',
        0,
        70,
        { fontSize: 12, align: 'center' }
      );
      
      // Сохраняем PDF
      const filename = `WB_Order_Stickers_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log('PDF с информацией об отсутствии стикеров создан');
      return;
    }
    
    // Добавляем стикеры на страницы
    ordersWithStickers.forEach((order, index) => {
      // Добавляем новую страницу для каждого стикера кроме первого
      if (index > 0) {
        doc.addPage();
      }
      
      try {
        // Получаем base64 изображение стикера
        const imgSrc = getImageSrcFromBase64(order.sticker);
        
        // Используем nm_id как артикул и article как название товара
        const articleId = order.nm_id?.toString() || '';
        const productName = order.article?.toString() || '';
        
        // Добавляем информацию о заказе над стикером
        addTextToPDF(
          doc,
          `Заказ #${order.order_id} - Артикул: ${articleId}`,
          0,
          35,
          { fontSize: 12, align: 'center' }
        );
        
        // Добавляем название товара под артикулом
        if (productName) {
          addTextToPDF(
            doc,
            `Название: ${productName}`,
            0,
            45,
            { fontSize: 10, align: 'center' }
          );
        }
        
        // Добавляем стикер - центрируем на странице
        // A4 размер: 210x297 мм
        // Размещаем изображение с размером 120x120 мм в центре страницы
        doc.addImage(imgSrc, 'PNG', 45, 60, 120, 120);
        
      } catch (e) {
        console.error('Ошибка при добавлении стикера в PDF:', e);
        addTextToPDF(
          doc,
          'Ошибка при добавлении стикера',
          0,
          50,
          { fontSize: 12, align: 'center' }
        );
      }
    });
    
    // Сохраняем PDF
    const filename = `WB_Order_Stickers_${timestamp}.pdf`;
    doc.save(filename);
    
    console.log('PDF со стикерами успешно создан');
  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    alert('Произошла ошибка при создании PDF. Подробности в консоли.');
  }
}; 