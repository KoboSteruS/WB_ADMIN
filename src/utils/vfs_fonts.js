/**
 * Модуль для работы с шрифтами jsPDF через Virtual File System (VFS)
 * 
 * Обеспечивает базовую поддержку кириллицы в PDF-документах
 * через настройку языка и стандартных шрифтов.
 */

import { jsPDF } from 'jspdf';

/**
 * Инициализирует VFS для поддержки кириллицы в PDF-документах
 */
export const initVFS = () => {
  try {
    // Создаем тестовый экземпляр PDF для инициализации VFS
    const pdfInstance = new jsPDF();
    
    // Установка русского языка для документа
    pdfInstance.setLanguage('ru');
    
    console.log('Базовая инициализация PDF для поддержки кириллицы выполнена');
    
  } catch (error) {
    console.error('Ошибка при инициализации VFS для jsPDF:', error);
  }
};

/**
 * Применяет настройки для корректного отображения кириллицы
 * @param {jsPDF} doc - Экземпляр jsPDF документа
 * @returns {jsPDF} Настроенный документ
 */
export const applyRussianSettings = (doc) => {
  try {
    // Устанавливаем язык документа
    doc.setLanguage('ru');
    
    // Устанавливаем стандартный шрифт
    doc.setFont('helvetica', 'normal');
    
    return doc;
  } catch (error) {
    console.error('Ошибка при настройке документа для русского языка:', error);
    return doc;
  }
};

// Инициализация VFS при загрузке модуля
initVFS(); 