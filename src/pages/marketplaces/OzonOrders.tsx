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
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { serviceManager } from '../../services/service-manager';

/**
 * Интерфейс для данных заказа Ozon
 */
interface OzonOrder {
  id?: number;
  order_id?: string | number;
  order_number?: string;
  posting_number?: string;
  status?: string;
  created_at?: string;
  in_process_at?: string;
  products?: OzonOrderProduct[];
  analytics_data?: {
    region?: string;
    city?: string;
    delivery_type?: string;
    is_premium?: boolean;
    payment_type_group_name?: string;
    warehouse_id?: number;
    warehouse_name?: string;
    is_legal?: boolean;
  };
  financial_data?: {
    posting_services?: {
      marketplace_service_item_fulfillment?: number;
      marketplace_service_item_pickup?: number;
      marketplace_service_item_dropoff_pvz?: number;
      marketplace_service_item_dropoff_sc?: number;
      marketplace_service_item_dropoff_ff?: number;
      marketplace_service_item_direct_flow_trans?: number;
      marketplace_service_item_return_flow_trans?: number;
      marketplace_service_item_deliv_to_customer?: number;
      marketplace_service_item_return_not_deliv_to_customer?: number;
      marketplace_service_item_return_part_deliv_to_customer?: number;
      marketplace_service_item_return_after_deliv_to_customer?: number;
    };
    cluster_from?: string;
    cluster_to?: string;
  };
  cancellation?: {
    cancel_reason_id?: number;
    cancel_reason?: string;
    cancellation_type?: string;
    cancelled_after_ship?: boolean;
    affect_cancellation_rating?: boolean;
    cancellation_initiator?: string;
  };
  customer?: {
    address?: {
      address_tail?: string;
      city?: string;
      comment?: string;
      country?: string;
      district?: string;
      zip_code?: string;
      latitude?: number;
      longitude?: number;
      provider_pvz_code?: string;
      pvz_code?: string;
      region?: string;
    };
    name?: string;
    customer_email?: string;
    customer_id?: number;
    phone?: string;
  };
  delivery_method?: {
    id?: number;
    name?: string;
    tpl_provider?: string;
    tpl_provider_id?: number;
    warehouse?: string;
    warehouse_id?: number;
  };
  ozon_token_id?: number;
  [key: string]: any;
}

/**
 * Интерфейс для товаров в заказе Ozon
 */
interface OzonOrderProduct {
  sku: number;
  name: string;
  quantity: number;
  offer_id: string;
  price: string | number;
  digital_codes?: string[];
  currency_code?: string;
}

interface OzonOrdersProps {
  token?: string;
}

/**
 * Компонент для отображения заказов Ozon
 */
const OzonOrders: React.FC<OzonOrdersProps> = ({ token }) => {
  const navigate = useNavigate();
  const ozonService = serviceManager.getOzonService();
  
  const [orders, setOrders] = useState<OzonOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<number | string>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showTestData, setShowTestData] = useState<boolean>(false);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [showRawResponse, setShowRawResponse] = useState<boolean>(false);
  
  // Состояния для модального окна добавления токена
  const [showAddTokenModal, setShowAddTokenModal] = useState<boolean>(false);
  const [newTokenName, setNewTokenName] = useState<string>('');
  const [newClientId, setNewClientId] = useState<string>('');
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [tokenAddLoading, setTokenAddLoading] = useState<boolean>(false);
  const [tokenAddError, setTokenAddError] = useState<string | null>(null);
  const [tokenAddSuccess, setTokenAddSuccess] = useState<boolean>(false);
  
  // Тестовые данные для таблицы
  const testOrders: OzonOrder[] = [
    {
      id: 1,
      order_id: 123456789,
      order_number: "23169087-0004",
      posting_number: "53158625-0001",
      status: "delivered",
      created_at: "2023-04-23T09:40:34+03:00",
      in_process_at: "2023-04-23T09:45:22+03:00",
      products: [
        {
          sku: 123456789,
          name: "Смартфон Apple iPhone 13 Pro Max 256GB",
          quantity: 1,
          offer_id: "APPL-IPH-13PMAX-256",
          price: 129990
        }
      ],
      analytics_data: {
        region: "Москва",
        city: "Москва",
        delivery_type: "PVZ",
        is_premium: true,
        payment_type_group_name: "Банковская карта",
        warehouse_id: 12345,
        warehouse_name: "ХОРУГВИНО_СКЛАД",
        is_legal: false
      },
      customer: {
        name: "Иван Иванов",
        phone: "+79001234567"
      },
      delivery_method: {
        id: 1001,
        name: "Пункт выдачи",
        tpl_provider: "Ozon Логистика",
        warehouse: "ХОРУГВИНО_СКЛАД"
      },
      ozon_token_id: 1
    },
    {
      id: 2,
      order_id: 123456790,
      order_number: "23169088-0005",
      posting_number: "53158626-0002",
      status: "awaiting_deliver",
      created_at: "2023-04-23T10:45:22+03:00",
      in_process_at: "2023-04-23T10:50:15+03:00",
      products: [
        {
          sku: 123456790,
          name: "Ноутбук Apple MacBook Pro 16 M1 Pro 2021",
          quantity: 1,
          offer_id: "APPL-MBP-16-M1P",
          price: 249990
        },
        {
          sku: 123456791,
          name: "Защитная пленка для экрана MacBook Pro 16",
          quantity: 1,
          offer_id: "ACC-MBP-16-SCRN",
          price: 1990
        }
      ],
      analytics_data: {
        region: "Санкт-Петербург",
        city: "Санкт-Петербург",
        delivery_type: "Courier",
        is_premium: false,
        payment_type_group_name: "Банковская карта",
        warehouse_id: 12346,
        warehouse_name: "СПБ_СКЛАД",
        is_legal: false
      },
      customer: {
        name: "Петр Петров",
        phone: "+79009876543"
      },
      delivery_method: {
        id: 1002,
        name: "Курьерская доставка",
        tpl_provider: "Ozon Логистика",
        warehouse: "СПБ_СКЛАД"
      },
      ozon_token_id: 1
    }
  ];

  // Загрузка заказов при монтировании компонента
  useEffect(() => {
    if (!showTestData) {
      fetchOrders();
    } else {
      setLoading(false);
      setError(null);
    }
  }, [showTestData]);

  // Функция для получения заказов
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setRawResponse('');
    console.log('Отправка запроса на получение заказов Ozon...');
    
    try {
      // Использование сервиса Ozon для получения заказов
      const ordersData = await ozonService.getOrders();
      
      // Сохраняем сырой ответ для отладки
      setRawResponse(JSON.stringify(ordersData, null, 2));
      
      if (Array.isArray(ordersData)) {
        console.log('Успешно получено заказов:', ordersData.length);
        setOrders(ordersData);
      } else if (ordersData && Array.isArray(ordersData.orders)) {
        console.log('Успешно получено заказов:', ordersData.orders.length);
        setOrders(ordersData.orders);
      } else {
        console.log('Неверный формат данных от сервера:', ordersData);
        setError('Неверный формат данных от сервера. Массив заказов не найден.');
      }
    } catch (err) {
      console.error('❌ Ошибка при запросе:', err);
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
  const formatPrice = (price?: string | number) => {
    if (price === undefined || price === null) return '—';
    
    // Если цена передана как строка, преобразуем ее в число
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) return price;
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  /**
   * Получение бейджа статуса заказа
   */
  const getStatusBadge = (order: OzonOrder) => {
    const status = order.status?.toString() || 'unknown';
    
    switch (status.toLowerCase()) {
      case 'awaiting_packaging':
        return <Badge bg="primary">Ожидает упаковки</Badge>;
      case 'awaiting_deliver':
        return <Badge bg="info">Ожидает отгрузки</Badge>;
      case 'delivering':
        return <Badge bg="warning">Доставляется</Badge>;
      case 'delivered':
        return <Badge bg="success">Доставлен</Badge>;
      case 'cancelled':
      case 'canceled':
        return <Badge bg="danger">Отменен</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
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
    
    // Проверка, все ли заказы выбраны
    const items = showTestData ? testOrders : orders;
    setSelectAll(newSelected.size === items.length);
  };

  // Обработчик выбора всех заказов
  const handleSelectAll = () => {
    const items = showTestData ? testOrders : orders;
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(items.map(order => order.id || order.order_id || 0)));
    }
    setSelectAll(!selectAll);
  };

  // Переключение между реальными и тестовыми данными
  const toggleDataSource = () => {
    setShowTestData(!showTestData);
  };

  // Переключатель для отображения сырого ответа
  const toggleRawResponse = () => {
    setShowRawResponse(!showRawResponse);
  };

  // Определяем, какие данные отображать - тестовые или из API
  const displayOrders = showTestData ? testOrders : orders;

  // Обработчик отправки формы добавления токена
  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newClientId.trim() || !newApiKey.trim()) {
      setTokenAddError('Client ID и API-ключ не могут быть пустыми');
      return;
    }
    
    setTokenAddLoading(true);
    setTokenAddError(null);
    setTokenAddSuccess(false);
    
    try {
      const data: { client_id: string; api_key: string; name: string } = {
        client_id: newClientId.trim(),
        api_key: newApiKey.trim(),
        name: newTokenName.trim() || `Ozon Token ${new Date().toLocaleDateString()}`
      };
      
      console.log('Sending data:', data);
      
      // Создание токена через Ozon сервис
      await ozonService.createToken(data);
      
      console.log('Токен успешно добавлен');
      setTokenAddSuccess(true);
      
      // Сбрасываем форму через 2 секунды
      setTimeout(() => {
        setNewClientId('');
        setNewApiKey('');
        setNewTokenName('');
        setTokenAddSuccess(false);
        setShowAddTokenModal(false);
      }, 2000);
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
      if (error instanceof Error) {
        setTokenAddError(error.message);
      } else {
        setTokenAddError('Неизвестная ошибка при добавлении токена');
      }
    } finally {
      setTokenAddLoading(false);
    }
  };

  // Обработчик открытия модального окна
  const handleOpenAddToken = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Открываем модальное окно...");
    setShowAddTokenModal(true);
  };

  // Сброс формы при закрытии модального окна
  const handleCloseAddTokenModal = () => {
    console.log("Закрываем модальное окно");
    setShowAddTokenModal(false);
    setNewClientId('');
    setNewApiKey('');
    setNewTokenName('');
    setTokenAddError(null);
    setTokenAddSuccess(false);
  };

  // Получение суммы заказа
  const getOrderTotal = (order: OzonOrder): number => {
    if (!order.products || !Array.isArray(order.products)) return 0;
    
    return order.products.reduce((sum, product) => {
      const price = typeof product.price === 'string' 
        ? parseFloat(product.price) 
        : product.price || 0;
      
      return sum + (price * product.quantity);
    }, 0);
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Настройки маркетплейсов', path: '/marketplace-settings' },
          { label: 'Ozon', path: '/marketplace-settings/ozon' },
          { label: 'Заказы', active: true }
        ]}
      />

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Заказы Ozon</h1>
            <div>
              <Button 
                variant="primary"
                onClick={handleOpenAddToken}
                type="button"
                className="me-2"
              >
                <i className="bi bi-plus-circle"></i> Добавить токен
              </Button>
              <Button 
                variant={showTestData ? "success" : "outline-success"}
                onClick={toggleDataSource} 
                className="me-2"
              >
                <i className="bi bi-database"></i> {showTestData ? "Тестовые данные (активно)" : "Тестовые данные"}
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
                onClick={() => navigate('/marketplace-settings/ozon')}
              >
                Назад к токенам
              </Button>
            </div>
          </div>
          
          {error && !showTestData && (
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
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={showTestData ? toggleDataSource : fetchOrders} 
                  className="me-2"
                >
                  <i className="bi bi-arrow-repeat"></i> {showTestData ? "Показать реальные данные" : "Обновить"}
                </Button>
                <span className="text-muted">
                  {showTestData 
                    ? `Тестовые данные: ${testOrders.length} заказов` 
                    : `Всего заказов: ${orders.length}`}
                </span>
              </div>
            </Card.Header>
            <Card.Body>
              {loading && !showTestData ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Загрузка заказов...</p>
                </div>
              ) : displayOrders.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mt-3">Заказы не найдены</p>
                  {!showTestData && (
                    <Button 
                      variant="primary" 
                      onClick={() => setShowTestData(true)} 
                      className="mb-3"
                    >
                      Показать тестовые данные
                    </Button>
                  )}
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
                        <th>Номер заказа</th>
                        <th>Номер отправления</th>
                        <th>Дата создания</th>
                        <th>Дата обработки</th>
                        <th>Статус</th>
                        <th>Товары</th>
                        <th>Сумма</th>
                        <th>Регион</th>
                        <th>Город</th>
                        <th>Тип доставки</th>
                        <th>Тип оплаты</th>
                        <th>Покупатель</th>
                        <th>Склад</th>
                        <th>Юр. лицо</th>
                        <th>ID токена</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayOrders.map((order, index) => (
                        <tr key={order.id || order.order_id || index}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedOrders.has(order.id || index)}
                              onChange={() => handleSelectOrder(order.id || index)}
                              aria-label={`Выбрать заказ ${order.id || order.order_id || index}`}
                            />
                          </td>
                          <td>{order.order_id || '—'}</td>
                          <td>{order.order_number || '—'}</td>
                          <td>{order.posting_number || '—'}</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>{formatDate(order.in_process_at)}</td>
                          <td>{getStatusBadge(order)}</td>
                          <td>
                            {order.products && order.products.length > 0 
                              ? order.products.map(p => (
                                <div key={p.offer_id} className="mb-1">
                                  {p.name} x {p.quantity}
                                </div>
                              )) 
                              : '—'}
                          </td>
                          <td>{formatPrice(getOrderTotal(order))}</td>
                          <td>{order.analytics_data?.region || '—'}</td>
                          <td>{order.analytics_data?.city || '—'}</td>
                          <td>
                            {order.analytics_data?.delivery_type 
                              ? <Badge bg="primary">{order.analytics_data.delivery_type}</Badge>
                              : '—'}
                          </td>
                          <td>{order.analytics_data?.payment_type_group_name || '—'}</td>
                          <td>{order.customer?.name || '—'}</td>
                          <td>{order.delivery_method?.warehouse || order.analytics_data?.warehouse_name || '—'}</td>
                          <td>{order.analytics_data?.is_legal ? 'Да' : 'Нет'}</td>
                          <td>{order.ozon_token_id || '—'}</td>
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
      
      {/* Модальное окно добавления токена */}
      <Modal show={showAddTokenModal} onHide={handleCloseAddTokenModal} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление токена Ozon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tokenAddSuccess && (
            <Alert variant="success" className="mb-3">
              <Alert.Heading>Успешно!</Alert.Heading>
              <p>Токен был успешно добавлен. Окно будет закрыто автоматически.</p>
            </Alert>
          )}
          
          {tokenAddError && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setTokenAddError(null)}>
              <Alert.Heading>Ошибка!</Alert.Heading>
              <p>{tokenAddError}</p>
            </Alert>
          )}
          
          <Form onSubmit={handleAddToken}>
            <Form.Group className="mb-3">
              <Form.Label>Название токена (опционально)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Например: Основной аккаунт"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Client ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите Client ID"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>API-ключ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите API-ключ"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Client ID и API-ключ можно получить в личном кабинете Ozon.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddTokenModal}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddToken} 
            disabled={tokenAddLoading || !newClientId.trim() || !newApiKey.trim()}
          >
            {tokenAddLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Добавление...
              </>
            ) : (
              'Добавить токен'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OzonOrders; 