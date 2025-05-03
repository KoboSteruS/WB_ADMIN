import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Кэш для шрифта
let cachedFontBase64: string | null = null;

/**
 * Конфигурация для таблиц с кириллицей
 */
export const CYRILLIC_TABLE_CONFIG = {
  useCss: true,
  styles: {
    font: 'Roboto',
    fontSize: 10
  },
  bodyStyles: {
    font: 'Roboto'
  }
};

/**
 * Функция для конвертации ArrayBuffer в строку Base64
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Загружает и кэширует шрифт для PDF
 */
export const loadAndCacheFont = async (): Promise<string> => {
  // Если шрифт уже загружен, возвращаем его из кэша
  if (cachedFontBase64) {
    return cachedFontBase64;
  }

  // URL шрифта Roboto с поддержкой кириллицы
  const fontUrl = 'https://raw.githubusercontent.com/bpampuch/pdfmake/master/examples/fonts/Roboto-Regular.ttf';
  
  try {
    // Загружаем шрифт
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Не удалось загрузить шрифт: ${response.status} ${response.statusText}`);
    }
    
    const fontData = await response.arrayBuffer();
    
    // Конвертируем в base64 и сохраняем в кэше
    cachedFontBase64 = arrayBufferToBase64(fontData);
    
    return cachedFontBase64;
  } catch (error) {
    console.error('Ошибка при загрузке шрифта:', error);
    throw error;
  }
};

/**
 * Создаёт PDF документ с поддержкой кириллицы
 */
export const createPDFWithCyrillicSupport = async (options: { orientation?: 'portrait' | 'landscape' } = {}): Promise<jsPDF> => {
  try {
    // Создаем PDF документ с нужной ориентацией
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Загружаем и получаем шрифт из кэша
    const base64Font = await loadAndCacheFont();
    
    // Добавляем шрифт в PDF
    doc.addFileToVFS('Roboto-Regular.ttf', base64Font);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    
    return doc;
  } catch (error) {
    console.error('Ошибка при создании PDF с кириллицей:', error);
    throw error;
  }
};

/**
 * Создает PDF с кириллицей (альтернативное название)
 */
export const createCyrillicPDF = createPDFWithCyrillicSupport;

/**
 * Создает HTML с кириллицей для встраивания в PDF
 */
export const createCyrillicHTML = (content: string): string => {
  return `<div style="font-family: 'Roboto', Arial, sans-serif;">${content}</div>`;
};

/**
 * Транслитерация текста с кириллицы на латиницу
 */
export const transliterateText = (text: string): string => {
  const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
    'Я': 'Ya'
  };

  return text.split('').map(char => cyrillicToLatin[char] || char).join('');
};

/**
 * Добавляет текст на русском языке в PDF документ
 */
export const addTextToPDF = (doc: jsPDF, text: string, x: number, y: number, options: { fontSize?: number, align?: string } = {}): void => {
  const fontSize = options.fontSize || 12;
  doc.setFontSize(fontSize);
  
  if (options.align === 'center') {
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    x = (doc.internal.pageSize.getWidth() - textWidth) / 2;
  }
  
  doc.text(text, x, y);
};

/**
 * Добавляет текст на русском языке (альтернативное название)
 */
export const addCyrillicText = addTextToPDF;

/**
 * Добавляет заголовок на русском языке в PDF документ
 */
export const addTitleToPDF = (doc: jsPDF, title: string, fontSize: number = 16): void => {
  doc.setFontSize(fontSize);
  const textWidth = doc.getStringUnitWidth(title) * fontSize / doc.internal.scaleFactor;
  const x = (doc.internal.pageSize.getWidth() - textWidth) / 2;
  doc.text(title, x, 15);
};

/**
 * Добавляет заголовок на русском языке (альтернативное название)
 */
export const addCyrillicTitle = addTitleToPDF;

/**
 * Добавляет таблицу с поддержкой кириллицы в PDF документ с использованием autoTable
 * для лучшей поддержки переноса текста и форматирования ячеек
 */
export const addTableToPDF = (
  doc: jsPDF,
  data: (string | number)[][],
  headers: string[],
  startY: number,
  options: any = {}
): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margins = { left: 10, right: 10 };
  const tableWidth = options.width || (pageWidth - margins.left - margins.right);

  // Определяем ширину каждой колонки в мм
  const colWidths: number[] = [];
  if (options.columnWidths) {
    const totalRelativeWidth = options.columnWidths.reduce((sum: number, width: number) => sum + width, 0);
    colWidths.push(...options.columnWidths.map((w: number) => (w / totalRelativeWidth) * tableWidth));
  } else {
    // Если ширины не заданы, распределяем равномерно
    const defaultColWidth = tableWidth / headers.length;
    for (let i = 0; i < headers.length; i++) {
      colWidths.push(defaultColWidth);
    }
  }

  // Динамически формируем объект заголовков
  const headObj: {[key: number]: string} = {};
  headers.forEach((header, index) => {
    headObj[index] = header;
  });
  const headRows = [headObj];
  
  // Настройки стилей по умолчанию
  const defaultStyles = {
    font: 'Roboto',
    fontSize: options.fontSize || 10,
    overflow: 'linebreak', // По умолчанию включаем перенос текста
    cellPadding: 2
  };
  
  // Настройки для заголовков
  const headerStyles = {
    fillColor: [66, 139, 202], // синий фон
    textColor: [255, 255, 255], // белый текст
    fontSize: options.fontSize || 10,
    font: 'Roboto',
    halign: 'center',
    valign: 'middle',
    fontStyle: 'normal'
  };
  
  // Объединяем пользовательские стили с дефолтными
  const styles = { ...defaultStyles, ...(options.styles || {}) };
  
  // Настройки для столбцов (используем columnWidths и columnStyles из options)
  const columnStyles: { [key: number]: any } = {};
  headers.forEach((_, index) => {
    // Базовые настройки для всех столбцов
    columnStyles[index] = {
      width: colWidths[index],
      halign: 'left',
      overflow: styles.overflow,
      font: 'Roboto', // Явно указываем шрифт для каждого столбца
      fontStyle: 'normal'
    };
    
    // Применяем пользовательские настройки для столбцов, если они есть
    if (options.columnStyles && options.columnStyles[index]) {
      columnStyles[index] = { ...columnStyles[index], ...options.columnStyles[index] };
    }
  });
  
  // Подготавливаем данные в нужном формате
  const bodyRows = data.map(row => {
    const rowData: { [key: string]: string } = {};
    row.forEach((cell, index) => {
      // Только включаем ячейки для существующих колонок
      if (index < headers.length) {
        rowData[index] = String(cell);
      }
    });
    return rowData;
  });
  
  // Используем autoTable для создания таблицы с явной установкой шрифта и кодировки
  autoTable(doc, {
    startY: startY,
    head: headRows, // Используем правильно подготовленные заголовки
    body: bodyRows,  // Используем правильно подготовленные данные
    margin: { left: margins.left, right: margins.right },
    styles: {
      ...styles,
      font: 'Roboto', // Явно указываем основной шрифт
      fontStyle: 'normal'
    },
    headStyles: headerStyles,
    columnStyles: columnStyles,
    tableWidth: tableWidth,
    // Дополнительные настройки из options
    ...(options.margin && { margin: options.margin }),
    theme: 'striped', // Используем тему striped для лучшей читаемости
    didDrawCell: (data) => {
      // Дополнительные действия при отрисовке ячейки
    },
    didParseCell: (data) => {
      // Устанавливаем шрифт для каждой ячейки
      data.cell.styles.font = 'Roboto';
      data.cell.styles.fontStyle = 'normal';
    }
  });
};

/**
 * Добавляет таблицу с кириллицей (альтернативное название)
 */
export const addCyrillicTable = addTableToPDF; 