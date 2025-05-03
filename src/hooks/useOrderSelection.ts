import { useState, useCallback } from 'react';
import { WbOrder } from '../types/wildberries';
import { getNextStatus } from '../utils/orderUtils';

/**
 * Хук для управления выбранными заказами
 * @param orders Список заказов
 * @returns Объект с методами и свойствами для управления выбором заказов
 */
export const useOrderSelection = (orders: WbOrder[]) => {
  // Состояние для выбранных заказов
  const [selectedOrders, setSelectedOrders] = useState<Set<number | string>>(new Set());
  // Состояние для выбора всех заказов
  const [selectAll, setSelectAll] = useState<boolean>(false);

  /**
   * Обработчик выбора одного заказа
   */
  const handleSelectOrder = useCallback((id: number | string) => {
    setSelectedOrders(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      
      // Проверка, все ли заказы выбраны
      setSelectAll(newSelected.size === orders.length);
      
      return newSelected;
    });
  }, [orders.length]);

  /**
   * Обработчик выбора всех заказов
   */
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id || order.order_id || 0)));
    }
    setSelectAll(!selectAll);
  }, [orders, selectAll]);

  /**
   * Получение статуса выбранных заказов
   * Если все заказы имеют один и тот же статус, возвращаем его,
   * иначе возвращаем "mixed"
   */
  const getSelectedOrdersStatus = useCallback((): string => {
    if (selectedOrders.size === 0) return "new";
    
    const selectedOrdersList = orders.filter(order => 
      selectedOrders.has(order.id || order.order_id || 0)
    );
    
    if (selectedOrdersList.length === 0) return "new";
    
    const firstStatus = selectedOrdersList[0].own_status || selectedOrdersList[0].wb_status || "new";
    
    const allSameStatus = selectedOrdersList.every(order => 
      (order.own_status || order.wb_status || "new").toLowerCase() === firstStatus.toLowerCase()
    );
    
    return allSameStatus ? firstStatus.toLowerCase() : "mixed";
  }, [orders, selectedOrders]);

  /**
   * Получение следующего статуса для выбранных заказов
   */
  const getNextOrdersStatus = useCallback((): string => {
    const currentStatus = getSelectedOrdersStatus();
    return getNextStatus(currentStatus);
  }, [getSelectedOrdersStatus]);

  /**
   * Получение списка выбранных заказов
   */
  const getSelectedOrdersData = useCallback((): WbOrder[] => {
    return orders.filter(order => selectedOrders.has(order.id || order.order_id || 0));
  }, [orders, selectedOrders]);

  /**
   * Очистка выбранных заказов
   */
  const clearSelection = useCallback(() => {
    setSelectedOrders(new Set());
    setSelectAll(false);
  }, []);

  return {
    selectedOrders,
    selectAll,
    handleSelectOrder,
    handleSelectAll,
    getSelectedOrdersStatus,
    getNextOrdersStatus,
    getSelectedOrdersData,
    clearSelection,
    selectionCount: selectedOrders.size
  };
};

export default useOrderSelection; 