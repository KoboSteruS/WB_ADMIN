import React from 'react';
import Badge from 'react-bootstrap/Badge';
import { WbOrder } from '../../types/wildberries';

/**
 * Интерфейс пропсов компонента
 */
interface OrderStatusBadgeProps {
  order: WbOrder;
}

/**
 * Компонент для отображения статуса заказа в виде бейджа
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ order }) => {
  // Если есть поля с новыми статусами - используем их
  if (order.wb_status || order.own_status) {
    const wbStatus = order.wb_status || 'unknown';
    const ownStatus = order.own_status || 'unknown';
    
    // Определяем цвет бейджа на основе статуса заказа
    let bgColor = 'secondary';
    let statusText = wbStatus;
    
    switch (wbStatus.toLowerCase()) {
      case 'new':
        bgColor = 'primary';
        statusText = 'Новый';
        break;
      case 'confirmed':
        bgColor = 'info';
        statusText = 'Подтвержден';
        break;
      case 'assembly':
        bgColor = 'warning';
        statusText = 'В сборке';
        break;
      case 'assembled':
        bgColor = 'warning';
        statusText = 'Собран';
        break;
      case 'ready_to_shipment':
        bgColor = 'warning';
        statusText = 'Готов к отправке';
        break;
      case 'sent':
      case 'shipped':
        bgColor = 'success';
        statusText = 'Отправлен';
        break;
      case 'delivered':
        bgColor = 'dark';
        statusText = 'Доставлен';
        break;
      case 'canceled':
        bgColor = 'danger';
        statusText = 'Отменен';
        break;
      default:
        bgColor = 'secondary';
        statusText = wbStatus;
    }
    
    // Если внутренний статус отличается от статуса WB
    if (ownStatus.toLowerCase() !== wbStatus.toLowerCase()) {
      return (
        <div className="d-flex flex-column gap-1">
          <Badge bg={bgColor}>WB: {statusText}</Badge>
          <Badge bg="info">Свой: {ownStatus}</Badge>
        </div>
      );
    }
    
    return <Badge bg={bgColor}>{statusText}</Badge>;
  }
  
  // Старая логика для обратной совместимости
  const status = order.status?.toString() || 'new';
  
  switch (status.toLowerCase()) {
    case 'new':
    case 'awaiting_confirmation':
      return <Badge bg="primary">Новый</Badge>;
    case 'confirmed':
    case 'awaiting_packaging':
      return <Badge bg="info">Подтвержден</Badge>;
    case 'ready_to_ship':
    case 'awaiting_deliver':
      return <Badge bg="warning">Готов к отправке</Badge>;
    case 'shipped':
    case 'delivering':
      return <Badge bg="success">Отправлен</Badge>;
    case 'delivered':
      return <Badge bg="dark">Доставлен</Badge>;
    case 'canceled':
    case 'cancelled':
      return <Badge bg="danger">Отменен</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

export default OrderStatusBadge; 