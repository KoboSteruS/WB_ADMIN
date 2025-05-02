/**
 * Скрипт для конвертации TTF-файла в base64 и создания модуля для jsPDF
 * Для запуска используйте: node convert-font.js
 */

const fs = require('fs');
const path = require('path');

// Путь к TTF-файлу шрифта
const fontPath = path.join(__dirname, 'ofont.ru_Roboto.ttf');
// Путь к модулю с base64-представлением
const outputPath = path.join(__dirname, 'fonts', 'Roboto-Regular-normal.js');

// Читаем TTF-файл и кодируем его в base64
try {
  const fontData = fs.readFileSync(fontPath);
  const fontBase64 = fontData.toString('base64');
  
  // Создаем содержимое JavaScript-модуля
  const moduleContent = `/**
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
export const robotoTTFBase64 = '${fontBase64}';
`;

  // Создаем директорию fonts, если она не существует
  const fontsDir = path.join(__dirname, 'fonts');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir);
  }
  
  // Записываем модуль
  fs.writeFileSync(outputPath, moduleContent);
  
  console.log('Шрифт успешно сконвертирован и записан в:', outputPath);
} catch (error) {
  console.error('Ошибка при конвертации шрифта:', error);
} 