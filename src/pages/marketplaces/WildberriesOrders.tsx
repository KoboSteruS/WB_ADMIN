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

/**
 * Интерфейс для данных заказа Wildberries
 */
interface WbOrder {
  id?: number;
  address?: string | null;
  ddate?: string | null;
  sale_price?: string | number;
  required_meta?: any[];
  delivery_type?: string;
  comment?: string;
  scan_price?: string | number | null;
  order_uid?: string;
  article?: string;
  color_code?: string;
  rid?: string;
  created_at?: string;
  offices?: string[];
  skus?: string[];
  order_id?: string | number;
  warehouse_id?: number;
  nm_id?: number;
  chrt_id?: number;
  price?: string | number;
  converted_price?: string | number;
  currency_code?: number;
  converted_currency_code?: number;
  cargo_type?: number;
  is_zero_order?: boolean;
  options?: {
    isB2B?: boolean;
    [key: string]: any;
  };
  wb_token?: number;
  [key: string]: any;
}

interface WildberriesOrdersProps {
  token?: string;
}

/**
 * Компонент для отображения заказов Wildberries
 */
const WildberriesOrders: React.FC<WildberriesOrdersProps> = ({ token }) => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<WbOrder[]>([]);
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
  const [newToken, setNewToken] = useState<string>('');
  const [tokenAddLoading, setTokenAddLoading] = useState<boolean>(false);
  const [tokenAddError, setTokenAddError] = useState<string | null>(null);
  const [tokenAddSuccess, setTokenAddSuccess] = useState<boolean>(false);
  
  // Тестовые данные для таблицы, обновленные с дополнительными полями
  const testOrders: WbOrder[] = [
    {
      id: 1,
      address: null,
      ddate: null,
      sale_price: 66300.00,
      required_meta: [],
      delivery_type: 'fbs',
      comment: '',
      scan_price: null,
      order_uid: '12908181_7068212498275133801',
      article: 'PURE Testobuster 120 capsul',
      color_code: '',
      rid: '7068212498275133801.0.0',
      created_at: '2025-04-23T09:40:34+03:00',
      offices: ['Москва_Восток'],
      skus: ['2039371154416'],
      order_id: 3266581928,
      warehouse_id: 881268,
      nm_id: 203084307,
      chrt_id: 327271177,
      price: 59600.00,
      converted_price: 59600.00,
      currency_code: 643,
      converted_currency_code: 643,
      cargo_type: 1,
      is_zero_order: false,
      options: {isB2B: false},
      wb_token: 1
    },
    {
      id: 2,
      address: null,
      ddate: null,
      sale_price: 55000.00,
      required_meta: [],
      delivery_type: 'fbs',
      comment: '',
      scan_price: null,
      order_uid: '12908182_7068212498275133802',
      article: 'PURE Testobuster 60 capsul',
      color_code: '',
      rid: '7068212498275133802.0.0',
      created_at: '2025-04-23T10:45:22+03:00',
      offices: ['Москва_Запад'],
      skus: ['2039371154417'],
      order_id: 3266581929,
      warehouse_id: 881268,
      nm_id: 203084308,
      chrt_id: 327271178,
      price: 45000.00,
      converted_price: 45000.00,
      currency_code: 643,
      converted_currency_code: 643,
      cargo_type: 1,
      is_zero_order: false,
      options: {isB2B: false},
      wb_token: 1
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

  // Убеждаемся, что Modal компонент корректно работает
  useEffect(() => {
    console.log("Состояние модального окна:", showAddTokenModal);
  }, [showAddTokenModal]);

  // Функция для получения заказов
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setRawResponse('');
    console.log('Отправка запроса на получение заказов...');
    
    try {
      const apiUrl = 'http://62.113.44.196:8080/api/v1/wb-orders/';
      console.log('URL запроса:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });
    
      console.log(`Статус ответа: ${response.status} ${response.statusText}`);
      
      // Сохраняем и выводим все заголовки ответа
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('Заголовки ответа:', headers);
      
      // Получаем сырой текст ответа
      const responseText = await response.text();
      setRawResponse(responseText);
      console.log('Сырой ответ:', responseText);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
      }
    
      // Пробуем распарсить JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Данные JSON:', data);
      } catch (err) {
        console.error('Ошибка парсинга JSON:', err);
        setError('Ошибка парсинга ответа сервера. Сервер вернул некорректный JSON.');
        setOrders([]);
        setLoading(false);
        return;
      }
    
      if (Array.isArray(data)) {
        console.log('Успешно получено заказов:', data.length);
        if (data.length > 0) {
          console.log('Пример заказа:', data[0]);
          console.log('Доступные поля:', Object.keys(data[0]).join(', '));
        }
        
        setOrders(data);
      } else {
        console.log('Ответ сервера не является массивом:', data);
        // Проверим другие возможные структуры данных
        if (data && typeof data === 'object') {
          if (Array.isArray(data.results)) {
            console.log('Получены данные в поле results');
            setOrders(data.results);
          } else if (Array.isArray(data.data)) {
            console.log('Получены данные в поле data');
            setOrders(data.data);
          } else if (Array.isArray(data.orders)) {
            console.log('Получены данные в поле orders');
            setOrders(data.orders);
          } else if (Array.isArray(data.items)) {
            console.log('Получены данные в поле items');
            setOrders(data.items);
          } else {
            console.log('Структура данных не определена');
            setError('В ответе сервера не найдены заказы. Проверьте формат ответа в консоли.');
            setOrders([]);
          }
        } else {
          setError('Неверный формат данных от сервера');
          setOrders([]);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Ошибка при запросе:', error.message);
        setError(error.message);
      } else {
        console.error('Произошла неизвестная ошибка при загрузке заказов');
        setError('Произошла неизвестная ошибка при загрузке заказов');
      }
      setOrders([]);
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
        year: 'numeric'
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

  // Получение статуса заказа с соответствующим стилем
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge bg="secondary">Нет статуса</Badge>;
    
    let variant = 'secondary';
    
    try {
      switch(status.toLowerCase()) {
        case 'new':
        case 'created':
          variant = 'info';
          break;
        case 'confirmed':
        case 'in_progress':
          variant = 'primary';
          break;
        case 'delivered':
        case 'completed':
          variant = 'success';
          break;
        case 'cancelled':
        case 'canceled':
          variant = 'danger';
          break;
        default:
          variant = 'secondary';
      }
    } catch (e) {
      console.error('Ошибка при обработке статуса:', e);
    }
    
    return <Badge bg={variant}>{status}</Badge>;
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

  // Данные для отображения
  const displayOrders = showTestData ? testOrders : orders;

  // Обработчик отправки формы добавления токена
  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newToken.trim()) {
      setTokenAddError('Токен не может быть пустым');
      return;
    }
    
    setTokenAddLoading(true);
    setTokenAddError(null);
    setTokenAddSuccess(false);
    
    try {
      const url = "http://62.113.44.196:8080/api/v1/wb-tokens/";
      const data = {
        token: newToken.trim(),
        name: newTokenName.trim() || undefined
      };
      
      console.log('Sending data:', data);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133',
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      console.log('Статус ответа:', response.status);
      
      const text = await response.text();
      console.log('Текст ответа:', text);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Токен успешно добавлен');
        setTokenAddSuccess(true);
        // Сбрасываем форму через 2 секунды
        setTimeout(() => {
          setNewToken('');
          setNewTokenName('');
          setTokenAddSuccess(false);
          setShowAddTokenModal(false);
        }, 2000);
      } else {
        // Пытаемся распарсить JSON с ошибкой
        try {
          const errorData = JSON.parse(text);
          const errorMessage = errorData.detail || errorData.error || errorData.message || 
                              JSON.stringify(errorData);
          setTokenAddError(errorMessage);
        } catch (e) {
          // Если не удалось распарсить, выводим просто текст
          setTokenAddError(text || 'Ошибка при добавлении токена');
        }
      }
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

  // Обработчик открытия модального окна с защитой от перехода
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
    setNewToken('');
    setNewTokenName('');
    setTokenAddError(null);
    setTokenAddSuccess(false);
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Настройки маркетплейсов', path: '/marketplace-settings' },
          { label: 'Wildberries', path: '/marketplace-settings/wildberries' },
          { label: 'Заказы', active: true }
        ]}
      />

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Заказы Wildberries</h1>
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
                onClick={() => navigate('/marketplace-settings/wildberries')}
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
                        <th>Дата создания</th>
                        <th>Order UID</th>
                        <th>Артикул</th>
                        <th>NM ID</th>
                        <th>Штрихкоды</th>
                        <th>Цена продажи</th>
                        <th>Цена закупки</th>
                        <th>Офисы</th>
                        <th>Тип доставки</th>
                        <th>Warehouse ID</th>
                        <th>Cargo Type</th>
                        <th>RID</th>
                        <th>CHRT ID</th>
                        <th>B2B</th>
                        <th>Токен WB</th>
                        <th>Комментарий</th>
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
                          <td>{formatDate(order.created_at)}</td>
                          <td>{order.order_uid || '—'}</td>
                          <td>{order.article || '—'}</td>
                          <td>{order.nm_id || '—'}</td>
                          <td>
                            {order.skus && order.skus.length > 0 
                              ? order.skus.join(', ') 
                              : '—'}
                          </td>
                          <td>{formatPrice(order.sale_price)}</td>
                          <td>{formatPrice(order.price)}</td>
                          <td>
                            {order.offices && order.offices.length > 0 
                              ? order.offices.join(', ') 
                              : '—'}
                          </td>
                          <td>
                            {order.delivery_type 
                              ? <Badge bg="primary">{order.delivery_type.toUpperCase()}</Badge>
                              : '—'}
                          </td>
                          <td>{order.warehouse_id || '—'}</td>
                          <td>{order.cargo_type || '—'}</td>
                          <td>{order.rid || '—'}</td>
                          <td>{order.chrt_id || '—'}</td>
                          <td>{order.options?.isB2B ? 'Да' : 'Нет'}</td>
                          <td>{order.wb_token || '—'}</td>
                          <td>{order.comment || '—'}</td>
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
      
      {/* Рендеринг модального окна с явными стилями и отключенным всплытием событий */}
      {showAddTokenModal && (
        <div 
          className="modal-backdrop show" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050 
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div 
            className="modal-dialog" 
            style={{ 
              margin: '1.75rem auto',
              maxWidth: '600px',
              width: '100%',
              position: 'relative',
              zIndex: 1051
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Добавление токена Wildberries</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCloseAddTokenModal();
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
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
                
                <Form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToken(e);
                  }}
                >
                  <Form.Group className="mb-3">
                    <Form.Label>Название токена</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Например: Основной токен"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Не обязательное поле. Помогает идентифицировать токен.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>API-токен Wildberries</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Вставьте API-токен Wildberries"
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      required
                    />
                    <Form.Text className="text-muted">
                      Токен можно получить в личном кабинете Wildberries.
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between mt-4">
                    <Button 
                      variant="secondary" 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCloseAddTokenModal();
                      }}
                    >
                      Отмена
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={tokenAddLoading || !newToken.trim()}
                    >
                      {tokenAddLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Добавление...
                        </>
                      ) : (
                        'Добавить токен'
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default WildberriesOrders;