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
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

/**
 * Интерфейс для данных токена Wildberries
 */
interface WbToken {
  id: number;
  token: string;
  created_at: string;
  name?: string;
  is_active?: boolean;
  updated_at?: string;
  [key: string]: any;
}

/**
 * Компонент для отображения токенов Wildberries
 */
const Wildberries: React.FC = () => {
  const [tokens, setTokens] = useState<WbToken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Состояния для модального окна добавления токена
  const [showAddTokenModal, setShowAddTokenModal] = useState<boolean>(false);
  const [newTokenName, setNewTokenName] = useState<string>('');
  const [newToken, setNewToken] = useState<string>('');
  const [tokenAddLoading, setTokenAddLoading] = useState<boolean>(false);
  const [tokenAddError, setTokenAddError] = useState<string | null>(null);
  const [tokenAddSuccess, setTokenAddSuccess] = useState<boolean>(false);

  // Состояния для модального окна удаления токена
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [tokenToDelete, setTokenToDelete] = useState<WbToken | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  // Загрузка токенов при монтировании компонента
  useEffect(() => {
    fetchTokens();
  }, []);

  // Функция для получения токенов
  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://85.193.81.178:8080/api/v1/wb-tokens/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token d65c2b3ed3a643341c8f2b7f380fb5a12dac826f'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setTokens(data);
        console.log('Успешно получено токенов:', data.length);
        data.forEach(token => {
          console.log('---');
          console.log('Весь токен:', token);
        });
      } else {
        console.log('Ответ сервера не является массивом:', data);
        setError('Неверный формат данных от сервера');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при загрузке токенов');
      }
      console.error('Ошибка при запросе:', err);
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

  // Отображение сокращенного токена
  const formatToken = (token: string) => {
    if (!token) return '—';
    if (token.length <= 8) return token;
    
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
  };

  // Обработчик выбора одного токена
  const handleSelectToken = (id: number) => {
    const newSelected = new Set(selectedTokens);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTokens(newSelected);
    
    // Проверка, все ли токены выбраны
    setSelectAll(newSelected.size === tokens.length);
  };

  // Обработчик выбора всех токенов
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTokens(new Set());
    } else {
      setSelectedTokens(new Set(tokens.map(token => token.id)));
    }
    setSelectAll(!selectAll);
  };

  // Обработчик перехода на страницу заказов с выбранным токеном
  const handleViewOrders = (tokenId: number) => {
    // Здесь должен быть переход на страницу заказов с использованием выбранного токена
    navigate(`/marketplace-settings/wildberries/orders/${tokenId}`);
  };

  // Обработчик перехода на страницу всех заказов
  const handleViewAllOrders = () => {
    navigate('/marketplace-settings/wildberries/orders');
  };

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
        
        // Обновляем список токенов
        await fetchTokens();
        
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
  
  // Сброс формы при закрытии модального окна
  const handleCloseAddTokenModal = () => {
    setShowAddTokenModal(false);
    setNewToken('');
    setNewTokenName('');
    setTokenAddError(null);
    setTokenAddSuccess(false);
  };

  // Открыть модальное окно подтверждения удаления
  const openDeleteModal = (token: WbToken) => {
    setTokenToDelete(token);
    setShowDeleteModal(true);
    setDeleteError(null);
  };
  
  // Закрыть модальное окно подтверждения удаления
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTokenToDelete(null);
    setDeleteError(null);
    setDeleteSuccess(false);
  };
  
  // Обработчик удаления токена
  const handleDeleteToken = async () => {
    if (!tokenToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      const url = `http://85.193.81.178:8080/api/v1/wb-tokens/${tokenToDelete.id}/`;
      
      console.log(`Удаление токена с ID: ${tokenToDelete.id}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Token d65c2b3ed3a643341c8f2b7f380fb5a12dac826f'
        }
      });
      
      console.log('Статус ответа:', response.status);
      
      if (response.ok) {
        console.log("Удаление прошло успешно!");
        setDeleteSuccess(true);
        
        // Обновляем список токенов локально (удаляем из state)
        setTokens(prevTokens => prevTokens.filter(token => token.id !== tokenToDelete.id));
        
        // Закрываем модальное окно через 1.5 секунды
        setTimeout(() => {
          closeDeleteModal();
        }, 1500);
      } else {
        const text = await response.text();
        console.error('Текст ошибки:', text);
        
        try {
          const errorData = JSON.parse(text);
          const errorMessage = errorData.detail || errorData.error || errorData.message || 
                             JSON.stringify(errorData);
          setDeleteError(errorMessage);
        } catch (e) {
          setDeleteError(`Ошибка при удалении: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Ошибка:", error);
      if (error instanceof Error) {
        setDeleteError(error.message);
      } else {
        setDeleteError('Неизвестная ошибка при удалении токена');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Настройки маркетплейсов', path: '/marketplace-settings' },
          { label: 'Wildberries', active: true }
        ]}
      />

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Токены Wildberries</h1>
            <Button 
              variant="primary" 
              onClick={handleViewAllOrders}
            >
              <i className="bi bi-list-ul me-1"></i> Все заказы
            </Button>
          </div>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Ошибка!</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
          
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Список токенов</h5>
              {!loading && (
                <span className="text-muted">Всего токенов: {tokens.length}</span>
              )}
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Загрузка токенов...</p>
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mt-3">Токены не найдены</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddTokenModal(true)}
                  >
                    Добавить токен
                  </Button>
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
                            aria-label="Выбрать все токены"
                          />
                        </th>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Токен</th>
                        <th>Дата создания</th>
                        <th>Статус</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map(token => (
                        <tr key={token.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedTokens.has(token.id)}
                              onChange={() => handleSelectToken(token.id)}
                              aria-label={`Выбрать токен ${token.id}`}
                            />
                          </td>
                          <td>{token.id}</td>
                          <td>{token.name || 'Токен Wildberries'}</td>
                          <td title={token.token}>{formatToken(token.token)}</td>
                          <td>{formatDate(token.created_at)}</td>
                          <td>
                            {token.is_active !== undefined ? (
                              <span className={`badge bg-${token.is_active ? 'success' : 'danger'}`}>
                                {token.is_active ? 'Активен' : 'Неактивен'}
                              </span>
                            ) : (
                              <span className="badge bg-secondary">Неизвестно</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleViewOrders(token.id)}
                                title="Просмотреть заказы по этому токену"
                              >
                                <i className="bi bi-box"></i> Заказы
                              </Button>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => navigate(`/marketplace-settings/wildberries/tokens/edit/${token.id}`)}
                                title="Редактировать токен"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => openDeleteModal(token)}
                                title="Удалить токен"
                              >
                                <i className="bi bi-trash"></i>
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
            <Card.Footer>
              <Button 
                variant="primary" 
                onClick={() => setShowAddTokenModal(true)}
              >
                <i className="bi bi-plus-circle me-1"></i> Добавить токен
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <div className="d-flex gap-4 flex-wrap mb-4">
        <Card>
          <Card.Body>
            <Card.Title>API токены Wildberries</Card.Title>
            <Card.Text>
              Управление токенами доступа к API Wildberries
            </Card.Text>
            <Button 
              variant="primary" 
              onClick={() => navigate('/marketplace-settings/wildberries/tokens')}
            >
              Управление токенами
            </Button>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body>
            <Card.Title>Заказы Wildberries</Card.Title>
            <Card.Text>
              Просмотр и управление заказами маркетплейса Wildberries
            </Card.Text>
            <Button 
              variant="primary" 
              onClick={() => navigate('/marketplace-settings/wildberries/orders')}
            >
              Перейти к заказам
            </Button>
          </Card.Body>
        </Card>
      </div>

      {/* Модальное окно добавления токена */}
      <Modal 
        show={showAddTokenModal} 
        onHide={handleCloseAddTokenModal}
        backdrop="static"
        centered
        contentClassName="bg-dark text-light border border-secondary"
      >
        <Modal.Header closeButton className="border-secondary">
          <Modal.Title>Добавление токена Wildberries</Modal.Title>
        </Modal.Header>
        <Modal.Body className="border-secondary">
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
              <Form.Label className="text-light">Название токена</Form.Label>
              <Form.Control
                type="text"
                placeholder="Например: Основной токен"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="bg-dark text-light border-secondary"
              />
              <Form.Text className="text-muted">
                Не обязательное поле. Помогает идентифицировать токен.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="text-light">API-токен Wildberries</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Вставьте API-токен Wildberries"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                required
                className="bg-dark text-light border-secondary"
              />
              <Form.Text className="text-muted">
                Токен можно получить в личном кабинете Wildberries.
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handleCloseAddTokenModal}
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
        </Modal.Body>
      </Modal>

      {/* Модальное окно подтверждения удаления токена */}
      <Modal 
        show={showDeleteModal} 
        onHide={closeDeleteModal}
        backdrop="static"
        centered
        contentClassName="bg-dark text-light border border-danger"
      >
        <Modal.Header closeButton className="border-secondary">
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Удаление токена
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteSuccess ? (
            <Alert variant="success" className="mb-0">
              <Alert.Heading>Успешно!</Alert.Heading>
              <p>Токен был успешно удален.</p>
            </Alert>
          ) : (
            <>
              {deleteError && (
                <Alert variant="danger" className="mb-3" dismissible onClose={() => setDeleteError(null)}>
                  <Alert.Heading>Ошибка!</Alert.Heading>
                  <p>{deleteError}</p>
                </Alert>
              )}
              
              <p>Вы действительно хотите удалить токен{tokenToDelete?.name ? ` "${tokenToDelete.name}"` : ''}?</p>
              
              <div className="bg-secondary p-3 rounded mb-3">
                <p className="mb-1"><strong>ID:</strong> {tokenToDelete?.id}</p>
                <p className="mb-1"><strong>Токен:</strong> {tokenToDelete?.token ? formatToken(tokenToDelete.token) : ''}</p>
                <p className="mb-0"><strong>Создан:</strong> {tokenToDelete?.created_at ? formatDate(tokenToDelete.created_at) : ''}</p>
              </div>
              
              <p className="text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Это действие невозможно отменить. Удаленный токен не подлежит восстановлению.
              </p>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer className="border-secondary">
          {!deleteSuccess && (
            <>
              <Button 
                variant="outline-secondary" 
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Отмена
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteToken}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Удаление...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Удалить токен
                  </>
                )}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Wildberries; 