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
  id: number;
  sale_price?: number;
  status?: string;
  created_at?: string;
  ddate?: string;
  createdAt?: string;
  article?: string;
  nmId?: number;
  skus?: string[];
  salePrice?: number;
  comment?: string;
  offices?: string[];
  [key: string]: any;
}

/**
 * Компонент для отображения заказов Wildberries
 */
const WildberriesOrders: React.FC = () => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<WbOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showTestData, setShowTestData] = useState<boolean>(false);
  
  // Состояния для модального окна добавления токена
  const [showAddTokenModal, setShowAddTokenModal] = useState<boolean>(false);
  const [newTokenName, setNewTokenName] = useState<string>('');
  const [newToken, setNewToken] = useState<string>('');
  const [tokenAddLoading, setTokenAddLoading] = useState<boolean>(false);
  const [tokenAddError, setTokenAddError] = useState<string | null>(null);
  const [tokenAddSuccess, setTokenAddSuccess] = useState<boolean>(false);
  
  // Тестовые данные для таблицы
  const testOrders: WbOrder[] = [
    {
      id: 1,
      ddate: '2023-07-15',
      createdAt: '2023-07-10',
      article: 'WB123456',
      nmId: 123456,
      skus: ['sku1', 'sku2'],
      salePrice: 1500,
      comment: 'Тестовый заказ 1',
      offices: ['Офис 1', 'Офис 2'],
      status: 'completed'
    },
    {
      id: 2,
      ddate: '2023-07-20',
      createdAt: '2023-07-12',
      article: 'WB789012',
      nmId: 789012,
      skus: ['sku3'],
      salePrice: 2500,
      comment: 'Тестовый заказ 2',
      offices: ['Офис 3'],
      status: 'in_progress'
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
    
    try {
      console.log('Отправка запроса на получение заказов...');
      const response = await fetch('http://85.193.81.178:8080/api/v1/wb-orders/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token d65c2b3ed3a643341c8f2b7f380fb5a12dac826f'
        }
      });
      
      console.log(`Статус ответа: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Данные получены:', data);
      
      let orderData: WbOrder[] = [];
      
      if (Array.isArray(data)) {
        console.log('Получен массив данных');
        orderData = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.results)) {
          console.log('Получены данные в поле results');
          orderData = data.results;
        } else if (Array.isArray(data.data)) {
          console.log('Получены данные в поле data');
          orderData = data.data;
        } else if (Array.isArray(data.orders)) {
          console.log('Получены данные в поле orders');
          orderData = data.orders;
        } else {
          console.log('Структура данных не определена, использую тестовые данные');
          setShowTestData(true);
          return;
        }
      } else {
        console.log('Неизвестный формат данных, использую тестовые данные');
        setShowTestData(true);
        return;
      }
      
      setOrders(orderData);
      console.log(`Успешно получено заказов: ${orderData.length}`);
      
      if (orderData.length > 0) {
        console.log('Пример заказа:', orderData[0]);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Ошибка при запросе:', error.message);
        setError(error.message);
      } else {
        console.error('Произошла неизвестная ошибка при загрузке заказов');
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
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Форматирование цены
  const formatPrice = (price?: number) => {
    if (price === undefined) return '—';
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
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
  const handleSelectOrder = (id: number) => {
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
      setSelectedOrders(new Set(items.map(order => order.id)));
    }
    setSelectAll(!selectAll);
  };

  // Переключение между реальными и тестовыми данными
  const toggleDataSource = () => {
    setShowTestData(!showTestData);
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
      const url = "http://85.193.81.178:8080/api/v1/wb-tokens/";
      const data = {
        token: newToken.trim(),
        name: newTokenName.trim() || undefined
      };
      
      console.log('Отправляемые данные:', data);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': 'Token d65c2b3ed3a643341c8f2b7f380fb5a12dac826f',
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
                        <th>Дата доставки</th>
                        <th>Дата создания</th>
                        <th>ID</th>
                        <th>Артикул</th>
                        <th>NM ID</th>
                        <th>SKUs</th>
                        <th>Цена продажи</th>
                        <th>Комментарий</th>
                        <th>Офисы</th>
                        <th>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayOrders.map(order => (
                        <tr key={order.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedOrders.has(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              aria-label={`Выбрать заказ ${order.id}`}
                            />
                          </td>
                          <td>{formatDate(order.ddate)}</td>
                          <td>{formatDate(order.createdAt || order.created_at)}</td>
                          <td>{order.id}</td>
                          <td>{order.article || '—'}</td>
                          <td>{order.nmId || '—'}</td>
                          <td>
                            {order.skus && order.skus.length > 0 
                              ? order.skus.join(', ') 
                              : '—'}
                          </td>
                          <td>{formatPrice(order.salePrice || order.sale_price)}</td>
                          <td>{order.comment || '—'}</td>
                          <td>
                            {order.offices && order.offices.length > 0 
                              ? order.offices.join(', ') 
                              : '—'}
                          </td>
                          <td>{getStatusBadge(order.status)}</td>
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