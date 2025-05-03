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
 * Интерфейс для товара в заказе Ozon
 */
interface OzonOrderProduct {
  price: number;
  offer_id: string;
  name: string;
  sku: string;
  quantity: number;
  mandatory_mark: string | null;
  currency_code: string;
  is_blr_traceable: boolean;
}

/**
 * Интерфейс для метода доставки
 */
interface DeliveryMethod {
  id: string;
  name: string;
  warehouse_id: string;
  warehouse: string;
  tpl_provider_id: string;
  tpl_provider: string;
}

/**
 * Интерфейс для данных заказа Ozon
 */
interface OzonOrder {
  posting_number: string;
  order_id: string;
  order_number: string;
  pickup_code_verified_at: string | null;
  status: string;
  delivery_method: DeliveryMethod;
  tracking_number: string;
  tpl_integration_type: string;
  in_process_at: string;
  shipment_date: string;
  delivering_date: string;
  optional: Record<string, any>;
  cancellation: {
    cancel_reason_id: number;
    cancel_reason: string;
    cancellation_type: string;
    cancelled_after_ship: boolean;
    affect_cancellation_rating: boolean;
    cancellation_initiator: string;
  };
  customer: any | null;
  quantum_id: number;
  products: OzonOrderProduct[];
  addressee: any | null;
  barcodes: any | null;
  analytics_data: any | null;
  financial_data: any | null;
  is_express: boolean;
  requirements: {
    products_requiring_gtd: any[];
    products_requiring_country: any[];
    products_requiring_mandatory_mark: any[];
    products_requiring_rnpt: any[];
    products_requiring_jw_uin: any[];
  };
  tariffication: {
    current_tariff_rate: number;
    current_tariff_type: string;
    current_tariff_charge: string;
    current_tariff_charge_currency_code: string;
    next_tariff_rate: number;
    next_tariff_type: string;
    next_tariff_charge: string;
    next_tariff_starts_at: string | null;
    next_tariff_charge_currency_code: string;
  };
  ozon_token: number;
  substatus?: string;
}

/**
 * Интерфейс для данных юридического лица
 */
interface LegalEntity {
  id: string;
  title: string;
  inn: string;
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
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
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
  
  // Данные о выбранном юридическом лице
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<LegalEntity | null>(null);

  // Добавляем состояния для добавления в поставку
  const [addToSupplyLoading, setAddToSupplyLoading] = useState<boolean>(false);
  const [addToSupplyError, setAddToSupplyError] = useState<string | null>(null);
  const [addToSupplySuccess, setAddToSupplySuccess] = useState<boolean>(false);

  // Добавляем состояние для списка юридических лиц
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [legalEntitiesLoading, setLegalEntitiesLoading] = useState<boolean>(true);
  const [legalEntitiesError, setLegalEntitiesError] = useState<string | null>(null);

  // Добавляем состояние для выбранного юр. лица в модальном окне
  const [selectedModalLegalEntity, setSelectedModalLegalEntity] = useState<string>('');

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

  // Загрузка юридических лиц при монтировании компонента
  useEffect(() => {
    fetchLegalEntities();
  }, []);

  // Функция для получения заказов
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
      const response = await fetch('http://62.113.44.196:8080/api/v1/ozon-orders/', {
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

  // Функция для получения списка юридических лиц
  const fetchLegalEntities = async () => {
    try {
      setLegalEntitiesLoading(true);
      setLegalEntitiesError(null);
      
      const response = await fetch('http://62.113.44.196:8080/api/v1/account-ip/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setLegalEntities(data);
      } else {
        setLegalEntitiesError('Неверный формат данных от сервера');
      }
    } catch (err) {
      if (err instanceof Error) {
        setLegalEntitiesError(err.message);
      } else {
        setLegalEntitiesError('Произошла ошибка при загрузке юридических лиц');
      }
    } finally {
      setLegalEntitiesLoading(false);
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
  const getStatusBadge = (order: OzonOrder) => {
    const status = order.status?.toLowerCase() || 'unknown';
    const substatus = order.substatus?.toLowerCase() || 'unknown';
    
    let bgColor = 'secondary';
    let statusText = status;
    
    switch (status) {
      case 'awaiting_packaging':
        bgColor = 'primary';
        statusText = 'Ожидает упаковки';
        break;
      case 'awaiting_deliver':
        bgColor = 'info';
        statusText = 'Ожидает доставки';
        break;
      case 'delivering':
        bgColor = 'warning';
        statusText = 'Доставляется';
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

    // Если есть подстатус, показываем его отдельным бейджем
    if (substatus && substatus !== 'unknown') {
      return (
        <div className="d-flex flex-column gap-1">
          <Badge bg={bgColor}>{statusText}</Badge>
          <Badge bg="info">Подстатус: {substatus}</Badge>
        </div>
      );
    }
    
    return <Badge bg={bgColor}>{statusText}</Badge>;
  };

  // Обработчик выбора одного заказа
  const handleSelectOrder = (id: string) => {
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
      setSelectedOrders(new Set(orders.map(order => order.order_id)));
    }
    setSelectAll(!selectAll);
  };

  // Переключатель для отображения сырого ответа
  const toggleRawResponse = () => {
    setShowRawResponse(!showRawResponse);
  };

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

  /**
   * Добавление выбранных заказов в поставку
   */
  const handleAddToSupply = async () => {
    if (selectedOrders.size === 0) {
      setAddToSupplyError('Выберите хотя бы один заказ');
      return;
    }

    setAddToSupplyLoading(true);
    setAddToSupplyError(null);
    setAddToSupplySuccess(false);

    try {
      // Получаем ID токена из первого выбранного заказа
      const firstSelectedOrder = orders.find(order => selectedOrders.has(order.order_id));
      if (!firstSelectedOrder || !firstSelectedOrder.ozon_token) {
        setAddToSupplyError('Не удалось определить токен Ozon');
        return;
      }

      const ozon_token_id = firstSelectedOrder.ozon_token;
      
      // Получаем posting_numbers из выбранных заказов
      const posting_numbers = orders
        .filter(order => selectedOrders.has(order.order_id))
        .map(order => order.posting_number);

      const response = await fetch(
        `http://62.113.44.196:8080/api/v1/ozon-orders/add-to-supply/?ozon_token_id=${encodeURIComponent(ozon_token_id)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133',
            'Accept': 'application/json',
            'X-CSRFTOKEN': 'P8r0lZl1tB9EHOBbJ8RnD27omtlYU5SB3gPAw3N0IMMuG3w6T7q2H7WWp6xD2LG0',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            posting_numbers: posting_numbers
          })
        }
      );

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        console.log('Ответ от сервера (JSON):', data.response);
        setAddToSupplySuccess(true);
      } catch (e) {
        console.log('Ответ от сервера (ТЕКСТ):', text);
        setAddToSupplyError('Ошибка при обработке ответа сервера');
      }
    } catch (error) {
      console.error('Ошибка запроса:', error);
      setAddToSupplyError('Произошла ошибка при отправке запроса');
    } finally {
      setAddToSupplyLoading(false);
    }
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
            <div>
              <h1 className="h3 mb-0">Заказы Ozon</h1>
              {selectedLegalEntity && (
                <p className="text-muted mb-0">
                  Юридическое лицо: <strong>{selectedLegalEntity.title}</strong> (ИНН: {selectedLegalEntity.inn})
                </p>
              )}
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="success"
                size="sm"
                onClick={handleAddToSupply}
                disabled={selectedOrders.size === 0 || addToSupplyLoading}
              >
                {addToSupplyLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Добавление...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-seam me-2"></i>
                    Добавить в поставку ({selectedOrders.size})
                  </>
                )}
              </Button>
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
          
          {addToSupplyError && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {addToSupplyError}
            </Alert>
          )}
          
          {addToSupplySuccess && (
            <Alert variant="success" className="mb-3">
              <i className="bi bi-check-circle me-2"></i>
              Заказы успешно добавлены в поставку
            </Alert>
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
                        <th style={{ width: '40px' }}>
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
                        <th>Доставка</th>
                        <th>Тип доставки</th>
                        <th>Склад</th>
                        <th>Трек номер</th>
                        <th>Токен Ozon</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.order_id}>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={selectedOrders.has(order.order_id)}
                              onChange={() => handleSelectOrder(order.order_id)}
                              aria-label={`Выбрать заказ ${order.order_id}`}
                            />
                          </td>
                          <td>
                            <div className="fw-bold">{order.posting_number}</div>
                            <small className="text-muted">ID: {order.order_id}</small>
                          </td>
                          <td>
                            <div>{formatDate(order.in_process_at)}</div>
                            <small className="text-muted">
                              {order.shipment_date && `Отгрузка: ${formatDate(order.shipment_date)}`}
                            </small>
                          </td>
                          <td>{getStatusBadge(order)}</td>
                          <td>
                            {order.products?.map((product, idx) => (
                              <div key={idx} className="mb-1">
                                <div className="d-flex justify-content-between">
                                  <span className="text-truncate" style={{ maxWidth: '200px' }}>{product.name}</span>
                                  <span className="text-muted ms-2">x{product.quantity}</span>
                                </div>
                                <small className="text-muted">
                                  {formatPrice(product.price)} / шт.
                                </small>
                              </div>
                            )) || '—'}
                          </td>
                          <td>
                            <div className="fw-bold">
                              {formatPrice(order.products?.reduce((sum, product) => sum + product.price * product.quantity, 0))}
                            </div>
                            {order.products?.length > 1 && (
                              <small className="text-muted">
                                {order.products.length} товара
                              </small>
                            )}
                          </td>
                          <td>
                            <div className="mb-1">
                              <strong>{order.delivery_method?.name || '—'}</strong>
                            </div>
                            <div className="small text-muted">
                              {order.delivery_method?.warehouse && (
                                <div>Склад: {order.delivery_method.warehouse}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            {order.delivery_method?.id ? (
                              <Badge bg="primary">{String(order.delivery_method.id).toUpperCase()}</Badge>
                            ) : '—'}
                          </td>
                          <td>{order.delivery_method?.warehouse || '—'}</td>
                          <td>{order.tracking_number || '—'}</td>
                          <td>{order.ozon_token || '—'}</td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {/* TODO: Добавить просмотр деталей */}}
                                title="Просмотр деталей"
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {/* TODO: Добавить печать */}}
                                title="Печать"
                              >
                                <i className="bi bi-printer"></i>
                              </Button>
                            </div>
                          </td>
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
              <Form.Label>Юридическое лицо</Form.Label>
              <Form.Select
                value={selectedModalLegalEntity}
                onChange={(e) => setSelectedModalLegalEntity(e.target.value)}
                required
              >
                <option value="">Выберите юридическое лицо</option>
                {legalEntities.map(entity => (
                  <option key={entity.id} value={entity.id}>
                    {entity.title} (ИНН: {entity.inn})
                  </option>
                ))}
              </Form.Select>
              {legalEntitiesError && (
                <Form.Text className="text-danger">{legalEntitiesError}</Form.Text>
              )}
            </Form.Group>
            
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
            disabled={tokenAddLoading || !newClientId.trim() || !newApiKey.trim() || !selectedModalLegalEntity}
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