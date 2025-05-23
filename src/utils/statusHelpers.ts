/**
 * Утилиты для работы со статусами заказов
 */

/**
 * Определяет цвет бейджа в зависимости от статуса или подстатуса заказа
 */
export const getBadgeColor = (status?: string): string => {
  if (!status) return 'secondary';
  
  const statusUpper = status.toUpperCase();
  const statusLower = status.toLowerCase();
  
  // Подстатусы Яндекс Маркет
  switch (statusUpper) {
    case 'READY_TO_SHIP':
      return 'warning';
    case 'PROCESSING_STARTED':
      return 'primary';
    case 'STARTED':
      return 'primary';
    case 'READY_TO_PICKUP':
      return 'info';
    case 'ON_DELIVERY':
      return 'info';
    case 'DELIVERY_SERVICE_RECEIVED':
      return 'info';
    case 'SHIPPED':
      return 'success';
    case 'DELIVERED':
      return 'success';
    case 'DELIVERED_TO_PICKUP_POINT':
      return 'success';
    case 'DELIVERED_TO_BUYER':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'REJECTED':
      return 'danger';
    case 'NOT_APPROVED':
      return 'danger';
    case 'CREATED':
      return 'secondary';
    case 'AWAITING_CONFIRMATION':
      return 'secondary';
    case 'AWAITING_PACKAGING':
      return 'warning';
    case 'PACKAGE_PREPARED':
      return 'warning';
    case 'ALREADY_SHIPPED':
      return 'success';
    case 'UNDELIVERED':
      return 'danger';
    case 'SORTING_CENTER_RECEIVED':
      return 'info';
    case 'SORTING_CENTER_PREPARED':
      return 'warning';
    case 'TRANSMISSION_CREATED':
      return 'secondary';
    case 'COURIER_RECEIVED':
      return 'info';
    case 'RETURN_PREPARING':
      return 'danger';
    case 'RETURN_PREPARING_TRANSMITTED':
      return 'danger';
    case 'CANCELLED_WITH_COMPENSATION':
      return 'danger';
    case 'LOST':
      return 'dark';
    case 'DAMAGED':
      return 'danger';
    case 'PARTIALLY_DELIVERED':
      return 'warning';
    case 'FULFILMENT_SHIPPED':
      return 'success';
  }
  
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
    return 'В обработке';
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
  } else if (statusUpper === 'PROCESSING_STARTED') {
    return 'Начата обработка';
  } else if (statusUpper === 'PROCESSING_EXPIRED') {
    return 'Просрочен';
  } else if (statusUpper === 'PENDING') {
    return 'В ожидании';
  } else if (statusUpper === 'CANCELLED_IN_PROCESSING') {
    return 'Отменен во время обработки';
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

/**
 * Получает текст подстатуса для отображения на русском языке
 */
export const getSubstatusText = (substatus?: string): string => {
  if (!substatus) return '—';
  
  const substatusUpper = substatus.toUpperCase();
  
  // Подстатусы Яндекс Маркет
  switch (substatusUpper) {
    case 'READY_TO_SHIP':
      return 'Готов к отправке';
    case 'PROCESSING_STARTED':
      return 'Начата обработка';
    case 'STARTED':
      return 'Начат';
    case 'READY_TO_PICKUP':
      return 'Готов к выдаче';
    case 'ON_DELIVERY':
      return 'В доставке';
    case 'DELIVERY_SERVICE_RECEIVED':
      return 'Получен службой доставки';
    case 'DELIVERED':
      return 'Доставлен';
    case 'CANCELLED':
      return 'Отменен';
    case 'REJECTED':
      return 'Отклонен';
    case 'NOT_APPROVED':
      return 'Не подтвержден';
    case 'CREATED':
      return 'Создан';
    case 'AWAITING_CONFIRMATION':
      return 'Ожидает подтверждения';
    case 'AWAITING_PACKAGING':
      return 'Ожидает упаковки';
    case 'PACKAGE_PREPARED':
      return 'Упаковка подготовлена';
    case 'ALREADY_SHIPPED':
      return 'Уже отправлен';
    case 'DELIVERED_TO_PICKUP_POINT':
      return 'Доставлен в пункт выдачи';
    case 'DELIVERED_TO_BUYER':
      return 'Доставлен покупателю';
    case 'UNDELIVERED':
      return 'Не доставлен';
    case 'SORTING_CENTER_RECEIVED':
      return 'Получен сортировочным центром';
    case 'SORTING_CENTER_PREPARED':
      return 'Подготовлен сортировочным центром';
    case 'TRANSMISSION_CREATED':
      return 'Передача создана';
    case 'COURIER_RECEIVED':
      return 'Получен курьером';
    case 'RETURN_PREPARING':
      return 'Готовится к возврату';
    case 'RETURN_PREPARING_TRANSMITTED':
      return 'Передан на подготовку к возврату';
    case 'CANCELLED_WITH_COMPENSATION':
      return 'Отменен с компенсацией';
    case 'LOST':
      return 'Утерян';
    case 'DAMAGED':
      return 'Поврежден';
    case 'PARTIALLY_DELIVERED':
      return 'Частично доставлен';
    case 'FULFILMENT_SHIPPED':
      return 'Отгружен с фулфилмента';
    default:
      return substatus;
  }
}; 