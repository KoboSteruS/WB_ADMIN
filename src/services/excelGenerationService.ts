/**
 * Сервис для генерации Excel документов со сводкой по артикулам заказов
 */
import { WbOrder, LegalEntity } from '../types/wildberries';
import { 
  createAndSaveExcel, 
  groupOrdersForExcelSummary 
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
    
    console.log('Excel со сводкой по заказам сгенерирован:', fileName);
  } catch (error) {
    console.error('Ошибка при генерации Excel со сводкой:', error);
    throw error;
  }
}; 