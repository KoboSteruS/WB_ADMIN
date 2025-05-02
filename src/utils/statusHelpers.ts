/**
 * Утилиты для работы со статусами заказов
 */

/**
 * Определяет цвет бейджа в зависимости от статуса заказа
 */
export const getBadgeColor = (status?: string): string => {
  if (!status) return 'secondary';
  
  switch (status.toLowerCase()) {
    case 'new':
      return 'primary';
    case 'confirmed':
      return 'info';
    case 'assembly':
    case 'assembled':
    case 'ready_to_shipment':
      return 'warning';
    case 'sent':
    case 'shipped':
      return 'success';
    case 'delivered':
      return 'dark';
    case 'canceled':
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

/**
 * Получает текст статуса для отображения
 */
export const getStatusText = (status?: string): string => {
  if (!status) return '—';
  
  switch (status.toLowerCase()) {
    case 'new':
      return 'Новый';
    case 'confirmed':
      return 'Подтвержден';
    case 'assembly':
      return 'В сборке';
    case 'assembled':
      return 'Собран';
    case 'ready_to_shipment':
      return 'Готов к отправке';
    case 'sent':
    case 'shipped':
      return 'Отправлен';
    case 'delivered':
      return 'Доставлен';
    case 'canceled':
    case 'cancelled':
      return 'Отменен';
    default:
      return status;
  }
}; 