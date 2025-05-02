/**
 * Модуль для подключения шрифта Roboto в формате base64 для jsPDF
 */

// Функция для добавления шрифта Roboto в документ PDF
export const addRobotoFont = (doc) => {
  // Добавляем шрифт Roboto для поддержки кириллицы
  doc.addFileToVFS('Roboto-Regular-normal.ttf', robotoTTFBase64);
  doc.addFont('Roboto-Regular-normal.ttf', 'Roboto', 'normal');
  
  // Устанавливаем шрифт по умолчанию
  doc.setFont('Roboto');
  
  return doc;
};

// Base64-представление шрифта Roboto (TTF)
// Обычно здесь должен быть длинный base64-код шрифта
// В реальном проекте нужно сгенерировать base64 из TTF-файла
export const robotoTTFBase64 = 'AABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'; // Заглушка - будет заменена на реальный base64 