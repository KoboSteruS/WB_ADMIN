/**
 * Утилиты для работы со статусами заказов
 */

/**
 * Определяет цвет бейджа в зависимости от статуса заказа
 */
export const getBadgeColor = (status?: string): string => {
  if (!status) return 'secondary';
  
  const statusUpper = status.toUpperCase();
  const statusLower = status.toLowerCase();
  
  // Статусы Яндекс Маркет в верхнем регистре
  if (statusUpper === 'PROCESSING') {
    return 'warning';
  } else if (statusUpper === 'CANCELLED') {
    return 'danger';
  } else if (statusUpper === 'DELIVERED') {
    return 'success';
  } else if (statusUpper === 'SHIPPED') {
    return 'info';
  } else if (statusUpper === 'PICKUP') {
    return 'primary';
  } else if (statusUpper === 'DELIVERY') {
    return 'primary';
  }
  
  // Стандартные статусы в нижнем регистре
  switch (statusLower) {
    case 'new':
      return 'primary';
    case 'confirmed':
      return 'info';
    case 'assembly':
    case 'assembled':
    case 'ready_to_shipment':
    case 'ready_to_ship':
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
  
  const statusUpper = status.toUpperCase();
  const statusLower = status.toLowerCase();
  
  // Статусы Яндекс Маркет в верхнем регистре
  if (statusUpper === 'PROCESSING') {
    return 'Обработка';
  } else if (statusUpper === 'CANCELLED') {
    return 'Отменен';
  } else if (statusUpper === 'DELIVERED') {
    return 'Доставлен';
  } else if (statusUpper === 'SHIPPED') {
    return 'Отправлен';
  } else if (statusUpper === 'PICKUP') {
    return 'Самовывоз';
  } else if (statusUpper === 'DELIVERY') {
    return 'Доставка';
  } else if (statusUpper === 'STARTED') {
    return 'Начат';
  } else if (statusUpper === 'READY_TO_SHIP') {
    return 'Готов к отправке';
  }
  
  // Стандартные статусы в нижнем регистре
  switch (statusLower) {
    case 'new':
      return 'Новый';
    case 'confirmed':
      return 'Подтвержден';
    case 'assembly':
      return 'В сборке';
    case 'assembled':
      return 'Собран';
    case 'ready_to_shipment':
    case 'ready_to_ship':
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