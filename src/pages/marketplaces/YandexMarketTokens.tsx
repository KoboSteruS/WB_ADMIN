import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  Alert
} from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { yandexMarketService } from '../../services/api';
import { YandexMarketToken, YandexMarketTokenTestResponse } from '../../types/yandex-market';
import apiService from '../../services/api/api-service';

/**
 * Компонент для управления токенами Яндекс Маркета
 */
const YandexMarketTokens: React.FC = (): JSX.Element => {
  // Состояния для списка токенов и загрузки
  const [tokens, setTokens] = useState<YandexMarketToken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Состояния для модального окна создания токена
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newToken, setNewToken] = useState({
    campaign_id: '',
    api_key: '',
    account_ip: ''
  });
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Состояние для списка юридических лиц
  const [legalEntities, setLegalEntities] = useState<Array<{id: number, name: string}>>([]);
  const [loadingEntities, setLoadingEntities] = useState<boolean>(false);

  // Состояния для модального окна удаления
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [tokenToDelete, setTokenToDelete] = useState<YandexMarketToken | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Состояния для модального окна тестирования
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [tokenToTest, setTokenToTest] = useState<YandexMarketToken | null>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  /**
   * Загрузка списка токенов при монтировании компонента
   */
  useEffect(() => {
    fetchTokens();
    fetchLegalEntities();
  }, []);

  /**
   * Получение списка токенов с сервера
   */
  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await yandexMarketService.getTokens();
      setTokens(data);
    } catch (err: any) {
      console.error('Ошибка при загрузке токенов:', err);
      setError(`Ошибка при загрузке токенов: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Получение списка юридических лиц с сервера
   */
  const fetchLegalEntities = async () => {
    try {
      setLoadingEntities(true);
      const response = await fetch('http://62.113.44.196:8080/api/v1/account-ip/', {
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем данные для выпадающего списка
      const entities = data.map((entity: any) => {
        // Проверяем, что entity - это объект
        if (typeof entity !== 'object' || entity === null) {
          return {
            id: 0,
            name: 'Неизвестное юр. лицо'
          };
        }

        // Извлекаем необходимые поля с проверкой
        const id = typeof entity.id === 'number' ? entity.id : 0;
        const title = typeof entity.title === 'string' ? entity.title : '';
        const inn = typeof entity.inn === 'string' ? entity.inn : '';

        return {
          id,
          name: title || `Юр. лицо ИНН: ${inn}` || `Юр. лицо #${id}`
        };
      });
      
      setLegalEntities(entities);
    } catch (err: any) {
      console.error('Ошибка при загрузке юр. лиц:', err);
      setLegalEntities([]); // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoadingEntities(false);
    }
  };

  /**
   * Обработка изменения полей в форме создания токена
   */
  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewToken(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Отправка формы создания токена
   */
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка заполнения полей
    if (!newToken.campaign_id || !newToken.api_key || !newToken.account_ip) {
      setCreateError('Пожалуйста, заполните все поля');
      return;
    }
    
    try {
      setCreateLoading(true);
      setCreateError(null);
      
      // Преобразование строковых данных в числовые
      const payload = {
        campaign_id: parseInt(newToken.campaign_id, 10),
        api_key: newToken.api_key,
        account_ip: parseInt(newToken.account_ip, 10)
      };
      
      await yandexMarketService.createToken(payload);
      
      // Очистка формы и закрытие модального окна
      setNewToken({ campaign_id: '', api_key: '', account_ip: '' });
      setShowCreateModal(false);
      
      // Обновление списка токенов
      await fetchTokens();
    } catch (err: any) {
      console.error('Ошибка при создании токена:', err);
      setCreateError(`Ошибка при создании токена: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  /**
   * Открытие модального окна подтверждения удаления
   */
  const handleOpenDeleteModal = (token: YandexMarketToken) => {
    setTokenToDelete(token);
    setShowDeleteModal(true);
  };

  /**
   * Удаление токена
   */
  const handleDeleteToken = async () => {
    if (!tokenToDelete) return;
    
    try {
      setDeleteLoading(true);
      await yandexMarketService.deleteToken(tokenToDelete.id);
      
      // Закрытие модального окна и обновление списка
      setShowDeleteModal(false);
      setTokenToDelete(null);
      await fetchTokens();
    } catch (err: any) {
      console.error('Ошибка при удалении токена:', err);
      alert(`Ошибка при удалении токена: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Открытие модального окна тестирования токена
   */
  const handleOpenTestModal = (token: YandexMarketToken) => {
    setTokenToTest(token);
    setTestResult(null);
    setShowTestModal(true);
  };

  /**
   * Тестирование токена
   */
  const handleTestToken = async () => {
    if (!tokenToTest) return;
    
    try {
      setTestLoading(true);
      setTestResult(null);
      
      // Вызов метода тестирования токена
      const response = await yandexMarketService.testToken(tokenToTest.id);
      setTestResult({
        success: response.is_valid,
        message: response.message
      });
    } catch (err: any) {
      console.error('Ошибка при тестировании токена:', err);
      setTestResult({
        success: false,
        message: `Ошибка при тестировании: ${err.message}`
      });
    } finally {
      setTestLoading(false);
    }
  };

  /**
   * Маскирование API ключа для отображения
   */
  const maskApiKey = (key: string): string => {
    if (!key) return '';
    // Показываем только первые 10 и последние 4 символа
    if (key.length <= 14) return key;
    return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
  };

  /**
   * Получение названия юр. лица по ID
   */
  const getLegalEntityName = (id: number): string => {
    const entity = legalEntities.find(e => e.id === id);
    if (!entity) return `Юр. лицо #${id}`;
    
    // Проверяем, является ли entity объектом с полем name
    if (typeof entity === 'object' && entity !== null && 'name' in entity) {
      return entity.name;
    }
    
    return `Юр. лицо #${id}`;
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Токены Яндекс Маркета</h1>
          <p className="text-muted">Управление токенами для интеграции с Яндекс Маркетом</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h2 className="card-title m-0">Список токенов</h2>
              <Button 
                variant="primary" 
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Добавить токен
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <Alert variant="danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              ) : tokens.length === 0 ? (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  Токены не найдены. Добавьте токен для работы с Яндекс Маркетом.
                </Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ID кампании</th>
                      <th>API ключ</th>
                      <th>Дата создания</th>
                      <th>Юр. лицо</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token) => (
                      <tr key={token.id}>
                        <td>{token.id}</td>
                        <td>{token.campaign_id}</td>
                        <td className="text-nowrap">{maskApiKey(token.api_key)}</td>
                        <td>{new Date(token.created_at).toLocaleString()}</td>
                        <td>{getLegalEntityName(token.account_ip)}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(token)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Удалить
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Модальное окно создания токена */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление токена Яндекс Маркета</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createError && (
            <Alert variant="danger" className="mb-3">
              {createError}
            </Alert>
          )}
          <Form onSubmit={handleCreateSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>ID кампании Яндекс Маркета</Form.Label>
              <Form.Control
                type="number"
                name="campaign_id"
                value={newToken.campaign_id}
                onChange={handleCreateInputChange}
                placeholder="Введите ID кампании"
                required
              />
              <Form.Text className="text-muted">
                Идентификатор кампании в Яндекс Маркете
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>API ключ</Form.Label>
              <Form.Control
                type="text"
                name="api_key"
                value={newToken.api_key}
                onChange={handleCreateInputChange}
                placeholder="Введите API ключ"
                required
              />
              <Form.Text className="text-muted">
                Формат: ACMA:XXX:YYY
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Юридическое лицо</Form.Label>
              <Form.Select
                name="account_ip"
                value={newToken.account_ip}
                onChange={handleCreateInputChange}
                required
              >
                <option value="">Выберите юридическое лицо</option>
                {loadingEntities ? (
                  <option disabled>Загрузка...</option>
                ) : (
                  legalEntities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))
                )}
              </Form.Select>
              <Form.Text className="text-muted">
                Юридическое лицо, для которого создается токен
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateSubmit}
            disabled={createLoading}
          >
            {createLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно удаления токена */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Удаление токена</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tokenToDelete && (
            <p>
              Вы действительно хотите удалить токен для кампании {tokenToDelete.campaign_id}?
              <br />
              <strong>Это действие невозможно отменить.</strong>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteToken}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Удаление...
              </>
            ) : (
              'Удалить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно тестирования токена */}
      <Modal show={showTestModal} onHide={() => setShowTestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Проверка токена</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tokenToTest && (
            <div className="mb-3">
              <p>
                Токен для кампании: <strong>{tokenToTest.campaign_id}</strong>
                <br />
                Юр. лицо: <strong>{getLegalEntityName(tokenToTest.account_ip)}</strong>
              </p>
              
              {testLoading ? (
                <div className="text-center p-3">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Проверка...</span>
                  </Spinner>
                  <p className="mt-2">Выполняется проверка токена...</p>
                </div>
              ) : testResult ? (
                <Alert variant={testResult.success ? 'success' : 'danger'}>
                  <i className={`bi ${testResult.success ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                  {testResult.message}
                </Alert>
              ) : (
                <Alert variant="warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Нажмите кнопку "Проверить", чтобы выполнить проверку токена.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTestModal(false)}>
            Закрыть
          </Button>
          <Button 
            variant="primary" 
            onClick={handleTestToken}
            disabled={testLoading}
          >
            {testLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Проверка...
              </>
            ) : (
              'Проверить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default YandexMarketTokens; 