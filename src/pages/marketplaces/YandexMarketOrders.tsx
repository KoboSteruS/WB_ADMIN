import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from '../../components/Breadcrumb';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

/**
 * Интерфейс для GPS-координат
 */
interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Интерфейс для адреса доставки
 */
interface DeliveryAddress {
  country: string;
  postcode: string;
  city: string;
  street: string;
  house: string;
  gps?: GpsCoordinates;
}

/**
 * Интерфейс для региона
 */
interface Region {
  id: number;
  name: string;
  type: string;
  parent?: Region;
}

/**
 * Интерфейс для дат доставки
 */
interface DeliveryDates {
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
}

/**
 * Интерфейс для товара в заказе
 */
interface YandexMarketOrderItem {
  id: number;
  offerId: string;
  offerName: string;
  price: number;
  buyerPrice: number;
  buyerPriceBeforeDiscount: number;
  priceBeforeDiscount: number;
  count: number;
  vat: string;
  shopSku: string;
  subsidy: number;
  partnerWarehouseId: string;
  promos?: Array<{
    type: string;
    subsidy: number;
    marketPromoId: string;
  }>;
  subsidies?: Array<{
    type: string;
    amount: number;
  }>;
  requiredInstanceTypes?: string[];
}

/**
 * Интерфейс для данных заказа Яндекс Маркета
 */
interface YandexMarketOrder {
  order_id: number;
  status: string;
  substatus: string;
  creationDate: string;
  updatedAt: string;
  currency: string;
  itemsTotal: number;
  deliveryTotal: number;
  buyerItemsTotal: number;
  buyerTotal: number;
  buyerItemsTotalBeforeDiscount: number;
  buyerTotalBeforeDiscount: number;
  paymentType: string;
  paymentMethod: string;
  fake: boolean;
  taxSystem: string;
  cancelRequested: boolean;
  items: YandexMarketOrderItem[];
  delivery: {
    type: string;
    serviceName: string;
    price: number;
    deliveryPartnerType: string;
    dates: DeliveryDates;
    region: Region;
    address: DeliveryAddress;
    deliveryServiceId: number;
    liftPrice: number;
    outletCode: number;
  };
  shipments: Array<{
    id: number;
    shipmentDate: string;
    boxes: Array<{
      id: number;
      fulfilmentId: string;
    }>;
  }>;
  buyer: {
    type: string;
  };
  yandex_market_token: number;
}

/**
 * Интерфейс для данных юридического лица
 */
interface LegalEntity {
  id: string;
  title: string;
  inn: string;
}

interface YandexMarketOrdersProps {
  token?: string;
}

/**
 * Компонент для отображения заказов Яндекс Маркета
 */
const YandexMarketOrders: React.FC<YandexMarketOrdersProps> = ({ token }) => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<YandexMarketOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<number | string>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [showRawResponse, setShowRawResponse] = useState<boolean>(false);
  
  // Данные о выбранном юридическом лице
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<LegalEntity | null>(null);

  // Загрузка данных о юр. лице из localStorage при монтировании компонента
  useEffect(() => {
    const legalEntityDataFromStorage = localStorage.getItem('selectedLegalEntityData');
    
    if (legalEntityDataFromStorage) {
      try {
        const parsedData = JSON.parse(legalEntityDataFromStorage);
        setSelectedLegalEntity(parsedData);
      } catch (e) {
        console.error('Ошибка при парсинге данных юр. лица:', e);
      }
    }
  }, []);

  // Загрузка заказов при монтировании компонента
  useEffect(() => {
    fetchOrders();
  }, [selectedLegalEntity]);

  /**
   * Функция для красивого рекурсивного вывода объекта или массива
   */
  const printNestedData = (key: string, value: any, indent: string = '') => {
    if (Array.isArray(value)) {
      console.log(`${indent}${key}:`);
      value.forEach((item, idx) => {
        console.log(`${indent}  [${idx + 1}]`);
        for (const [k, v] of Object.entries(item)) {
          printNestedData(k, v, `${indent}    `);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      console.log(`${indent}${key}:`);
      for (const [k, v] of Object.entries(value)) {
        printNestedData(k, v, `${indent}    `);
      }
    } else {
      console.log(`${indent}${key}:`, value);
    }
  };

  /**
   * Функция для получения заказов
   */
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setRawResponse('');
    
    if (!selectedLegalEntity) {
      setError('Не выбрано юридическое лицо');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://62.113.44.196:8080/api/v1/yandex-market-orders/', {
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133',
          'accept': 'application/json',
          'X-CSRFTOKEN': 'U0dM1l7bxFbZtOEmn4kPMb5bSjcwktcN88BmcpzaMQOPs3zhx3TuQgUJVWobs90c'
        }
      });

      const text = await response.text();
      setRawResponse(text);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const data = JSON.parse(text);
      const orders = data.orders || [];

      if (Array.isArray(orders)) {
        console.log('Успешно получено заказов:', orders.length);
        
        // Выводим структуру данных для каждого заказа
        orders.forEach((order, orderIndex) => {
          console.log(`=== Заказ ${orderIndex + 1} ===`);
          for (const [key, value] of Object.entries(order)) {
            printNestedData(key, value);
          }
        });

        setOrders(orders);
      } else {
        setError('Неверный формат данных от сервера');
      }
    } catch (err) {
      console.error('Ошибка при запросе:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла неизвестная ошибка при загрузке заказов');
      }
    } finally {
      setLoading(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Форматирование цены
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '—';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  /**
   * Получение бейджа статуса заказа
   */
  const getStatusBadge = (order: YandexMarketOrder) => {
    const status = order.status?.toLowerCase() || 'unknown';
    
    let bgColor = 'secondary';
    let statusText = status;
    
    switch (status) {
      case 'new':
        bgColor = 'primary';
        statusText = 'Новый';
        break;
      case 'processing':
        bgColor = 'info';
        statusText = 'В обработке';
        break;
      case 'delivery':
        bgColor = 'warning';
        statusText = 'Доставка';
        break;
      case 'delivered':
        bgColor = 'success';
        statusText = 'Доставлен';
        break;
      case 'cancelled':
        bgColor = 'danger';
        statusText = 'Отменен';
        break;
      default:
        statusText = status;
    }
    
    return <Badge bg={bgColor}>{statusText}</Badge>;
  };

  // Обработчик выбора одного заказа
  const handleSelectOrder = (id: number | string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOrders(newSelected);
    setSelectAll(newSelected.size === orders.length);
  };

  // Обработчик выбора всех заказов
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.order_id || 0)));
    }
    setSelectAll(!selectAll);
  };

  // Переключатель для отображения сырого ответа
  const toggleRawResponse = () => {
    setShowRawResponse(!showRawResponse);
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Настройки маркетплейсов', path: '/marketplace-settings' },
          { label: 'Яндекс Маркет', path: '/marketplace-settings/yandex-market' },
          { label: 'Заказы', active: true }
        ]}
      />

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Заказы Яндекс Маркета</h1>
              {selectedLegalEntity && (
                <p className="text-muted mb-0">
                  Юридическое лицо: <strong>{selectedLegalEntity.title}</strong> (ИНН: {selectedLegalEntity.inn})
                </p>
              )}
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={fetchOrders} 
                className="me-2"
              >
                <i className="bi bi-arrow-repeat"></i> Обновить
              </Button>
              <Button 
                variant={showRawResponse ? "info" : "outline-info"}
                onClick={toggleRawResponse} 
                className="me-2"
              >
                <i className="bi bi-braces"></i> {showRawResponse ? "Скрыть ответ API" : "Показать ответ API"}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(-1)}
              >
                Назад
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Ошибка!</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
          
          {showRawResponse && rawResponse && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Сырой ответ API</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="bg-dark text-light p-3" style={{ overflow: 'auto', maxHeight: '300px' }}>
                  <pre>{rawResponse}</pre>
                </div>
              </Card.Body>
            </Card>
          )}
          
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Список заказов</h5>
              <div>
                <span className="text-muted">
                  Всего заказов: {orders.length}
                </span>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Загрузка заказов...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mt-3">Заказы не найдены</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered striped>
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            aria-label="Выбрать все заказы"
                          />
                        </th>
                        <th>ID заказа</th>
                        <th>Дата создания</th>
                        <th>Статус</th>
                        <th>Товары</th>
                        <th>Сумма</th>
                        <th>Адрес доставки</th>
                        <th>Тип доставки</th>
                        <th>Покупатель</th>
                        <th>Способ оплаты</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={order.order_id || index}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedOrders.has(order.order_id || index)}
                              onChange={() => handleSelectOrder(order.order_id || index)}
                              aria-label={`Выбрать заказ ${order.order_id || index}`}
                            />
                          </td>
                          <td>{order.order_id || '—'}</td>
                          <td>{formatDate(order.creationDate)}</td>
                          <td>{getStatusBadge(order)}</td>
                          <td>
                            {order.items?.map((item, idx) => (
                              <div key={idx}>
                                {typeof item === 'object' && item !== null ? (
                                  <>
                                    {item.offerName || 'Без названия'} x {item.count || 0} ({formatPrice(item.price)})
                                  </>
                                ) : (
                                  '—'
                                )}
                              </div>
                            )) || '—'}
                          </td>
                          <td>{formatPrice(order.buyerTotal)}</td>
                          <td>
                            {order.delivery?.address ? (
                              <>
                                {order.delivery.region?.name || ''}, 
                                {order.delivery.region?.parent?.name || ''}<br />
                                {order.delivery.address.country}, {order.delivery.address.postcode}<br />
                                {order.delivery.address.city}, {order.delivery.address.street}, {order.delivery.address.house}
                                {order.delivery.address.gps && (
                                  <div>
                                    <br />
                                    <small className="text-muted">
                                      GPS: {order.delivery.address.gps.latitude}, {order.delivery.address.gps.longitude}
                                    </small>
                                  </div>
                                )}
                              </>
                            ) : '—'}
                          </td>
                          <td>{typeof order.delivery?.type === 'string' ? order.delivery.type : '—'}</td>
                          <td>
                            {order.buyer ? (
                              <>
                                {typeof order.buyer.type === 'string' ? order.buyer.type : '—'}
                              </>
                            ) : '—'}
                          </td>
                          <td>{typeof order.paymentMethod === 'string' ? order.paymentMethod : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default YandexMarketOrders; 