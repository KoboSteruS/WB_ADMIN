import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

/**
 * Интерфейс для товара в заказе
 */
export interface OrderItemDetail {
  id: number;
  name: string;
  article: string;
  quantity: number;
  price: number;
  total: number;
}

/**
 * Интерфейс для свойств модального окна деталей заказа
 */
interface OrderDetailsModalProps {
  show: boolean;
  onHide: () => void;
  orderId: string;
  orderItems: OrderItemDetail[];
  totalQuantity: number;
  totalSum: number;
}

/**
 * Компонент модального окна для отображения деталей заказа
 */
const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  show,
  onHide,
  orderId,
  orderItems,
  totalQuantity,
  totalSum
}) => {
  // Форматирование цены
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Детали заказа {orderId}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="table-responsive">
          <Table bordered striped hover className="mb-0">
            <thead>
              <tr className="table-secondary">
                <th className="text-center">#</th>
                <th>Наименование товара</th>
                <th>Артикул</th>
                <th className="text-center">Количество</th>
                <th className="text-end">Цена за ед.</th>
                <th className="text-end">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td className="text-center">{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.article}</td>
                  <td className="text-center">{item.quantity} шт.</td>
                  <td className="text-end">{formatPrice(item.price)}</td>
                  <td className="text-end">{formatPrice(item.total)}</td>
                </tr>
              ))}
              <tr className="table-secondary fw-bold">
                <td colSpan={3} className="text-end">Итого:</td>
                <td className="text-center">{totalQuantity} шт.</td>
                <td></td>
                <td className="text-end">{formatPrice(totalSum)}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Закрыть
        </Button>
        <Button variant="primary">
          Печать
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailsModal; 