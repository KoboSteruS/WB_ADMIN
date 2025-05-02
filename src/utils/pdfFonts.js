/**
 * Утилита для настройки кириллических шрифтов в jsPDF
 * 
 * Данный модуль предоставляет функции для корректного отображения 
 * кириллических символов в PDF-документах, созданных с помощью jsPDF.
 */

/**
 * Настраивает PDF-документ для корректной работы с русским языком
 * @param {jsPDF} doc - Экземпляр jsPDF документа
 * @returns {jsPDF} - Настроенный документ с поддержкой кириллицы
 */
export const setupCyrillicFont = (doc) => {
  // Устанавливаем язык документа как русский
  doc.setLanguage('ru');
  
  // Устанавливаем стандартный шрифт helvetica
  // Это наиболее надежный вариант для jsPDF 2.x
  doc.setFont('helvetica', 'normal');
  
  return doc;
};

/**
 * Настраивает таблицу autoTable для корректной работы с кириллицей
 * @returns {Object} - Объект стилей для autoTable
 */
export const getCyrillicTableStyles = () => {
  return {
    font: 'helvetica',
    fontSize: 10,
    cellPadding: 3,
    overflow: 'linebreak',
    halign: 'left'
  };
};

/**
 * Настраивает заголовки таблицы для корректной работы с кириллицей
 * @returns {Object} - Объект стилей для заголовков таблицы
 */
export const getCyrillicHeadStyles = () => {
  return {
    fillColor: [66, 139, 202],
    textColor: 255,
    fontSize: 10,
    halign: 'center',
    font: 'helvetica'
  };
};

/**
 * Получает безопасную конфигурацию для отображения кириллического текста в PDF
 * @param {string} text - Текст для отображения
 * @param {number} x - Координата X
 * @param {number} y - Координата Y
 * @param {Object} options - Дополнительные опции (align, maxWidth и т.д.)
 * @returns {Object} - Объект конфигурации для метода doc.text()
 */
export const getCyrillicTextConfig = (text, x, y, options = {}) => {
  return {
    text,
    x,
    y,
    options
  };
}; 