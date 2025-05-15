/**
 * Сервис для генерации Excel документов со сводкой по артикулам заказов
 */
import { WbOrder, LegalEntity } from '../types/wildberries';
import { OzonOrder } from '../types/ozon';
import { YandexMarketOrder } from '../types/yandexmarket';
import { 
  createAndSaveExcel, 
  groupOrdersForExcelSummary,
  groupOzonOrdersForExcelSummary,
  groupYandexOrdersForExcelSummary
} from '../utils/excelUtils';

/**
 * Генерирует Excel-сводку по артикулам
 * @param orders Список заказов
 * @param legalEntity Информация о юридическом лице
 */
export const generateArticlesSummaryExcel = async (
  orders: WbOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  try {
    // Текущий временной штамп для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Заголовки таблицы
    const headers = ['Артикул', 'Название', 'Количество'];
    
    // Группируем заказы по артикулу и преобразуем их в формат для Excel
    const excelData = groupOrdersForExcelSummary(orders);
    
    // Создаем и сохраняем Excel файл
    const fileName = `WB_Orders_Summary_${timestamp}.xlsx`;
    createAndSaveExcel(excelData, headers, 'Сводка по артикулам', fileName);
    
    console.log('Excel со сводкой по заказам WB сгенерирован:', fileName);
  } catch (error) {
    console.error('Ошибка при генерации Excel со сводкой WB:', error);
    throw error;
  }
};

/**
 * Генерирует Excel-сводку по артикулам Ozon
 * @param orders Список заказов Ozon
 * @param legalEntity Информация о юридическом лице
 */
export const generateOzonArticlesSummaryExcel = async (
  orders: OzonOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  try {
    // Текущий временной штамп для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Заголовки таблицы
    const headers = ['Артикул', 'Название', 'Количество'];
    
    // Группируем заказы по артикулу и преобразуем их в формат для Excel
    const excelData = groupOzonOrdersForExcelSummary(orders);
    
    // Создаем и сохраняем Excel файл
    const fileName = `Ozon_Orders_Summary_${timestamp}.xlsx`;
    createAndSaveExcel(excelData, headers, 'Сводка по артикулам', fileName);
    
    console.log('Excel со сводкой по заказам Ozon сгенерирован:', fileName);
  } catch (error) {
    console.error('Ошибка при генерации Excel со сводкой Ozon:', error);
    throw error;
  }
};

/**
 * Генерирует Excel-сводку по артикулам Яндекс Маркет
 * @param orders Список заказов Яндекс Маркет
 * @param legalEntity Информация о юридическом лице
 */
export const generateYandexArticlesSummaryExcel = async (
  orders: YandexMarketOrder[],
  legalEntity?: LegalEntity
): Promise<void> => {
  try {
    // Текущий временной штамп для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Заголовки таблицы
    const headers = ['Артикул', 'Название', 'Количество'];
    
    // Группируем заказы по артикулу и преобразуем их в формат для Excel
    const excelData = groupYandexOrdersForExcelSummary(orders);
    
    // Создаем и сохраняем Excel файл
    const fileName = `Yandex_Orders_Summary_${timestamp}.xlsx`;
    createAndSaveExcel(excelData, headers, 'Сводка по артикулам', fileName);
    
    console.log('Excel со сводкой по заказам Яндекс Маркет сгенерирован:', fileName);
  } catch (error) {
    console.error('Ошибка при генерации Excel со сводкой Яндекс Маркет:', error);
    throw error;
  }
}; 