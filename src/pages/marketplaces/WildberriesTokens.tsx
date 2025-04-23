import React, { useState, useEffect, lazy, Suspense } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import AlertLink from '../../components/AlertLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCheck, faTimes, faSyncAlt, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { wildberriesService } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';

// Ленивая загрузка модальных окон
const AddTokenModal = lazy(() => import('../../components/modals/wildberries/AddTokenModal'));
const EditTokenModal = lazy(() => import('../../components/modals/wildberries/EditTokenModal'));
const DeleteTokenModal = lazy(() => import('../../components/modals/wildberries/DeleteTokenModal'));

interface Token {
  id: string;
  name: string;
  token: string;
  active: boolean;
  lastChecked?: string;
  isValid?: boolean;
}

interface TokenData {
  name: string;
  token: string;
}

interface TokenEditData {
  id: string;
  name: string;
}

/**
 * Страница управления токенами Wildberries
 */
const WildberriesTokens: React.FC = () => {
  // Состояние списка токенов
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Состояния для модальных окон
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  
  // Состояния для операций с токенами
  const [testingTokenId, setTestingTokenId] = useState<string | null>(null);
  const [togglingTokenId, setTogglingTokenId] = useState<string | null>(null);

  /**
   * Загрузка списка токенов
   */
  const loadTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Запрос к API для получения токенов Wildberries
      const response = await wildberriesService.getTokens();
      
      // Преобразование типов для соответствия интерфейсу Token
      const mappedTokens: Token[] = (response || []).map((token: any) => ({
        id: token.id.toString(),
        name: token.name,
        token: token.token,
        active: token.is_active,
        lastChecked: token.last_checked,
        isValid: token.is_valid
      }));
      
      setTokens(mappedTokens);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось загрузить список токенов');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Загрузка токенов при монтировании компонента
   */
  useEffect(() => {
    loadTokens();
  }, []);

  /**
   * Обработчик добавления нового токена
   */
  const handleAddToken = async (tokenData: TokenData) => {
    try {
      await wildberriesService.createToken(tokenData);
      await loadTokens();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * Обработчик редактирования токена
   */
  const handleEditToken = async (tokenData: TokenEditData) => {
    try {
      await wildberriesService.updateToken(Number(tokenData.id), { name: tokenData.name });
      await loadTokens();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * Обработчик удаления токена
   */
  const handleDeleteToken = async (id: string) => {
    try {
      await wildberriesService.deleteToken(Number(id));
      await loadTokens();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * Обработчик включения/отключения токена
   */
  const handleToggleTokenActive = async (id: string, active: boolean) => {
    try {
      setTogglingTokenId(id);
      await wildberriesService.toggleTokenActive(Number(id), !active);
      
      // Обновляем локальное состояние
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.id === id ? { ...token, active: !active } : token
        )
      );
    } catch (err) {
      if (err instanceof Error) {
        alert(`Ошибка при изменении статуса токена: ${err.message}`);
      } else {
        alert('Произошла ошибка при изменении статуса токена');
      }
    } finally {
      setTogglingTokenId(null);
    }
  };

  /**
   * Обработчик проверки токена
   */
  const handleTestToken = async (id: string) => {
    try {
      setTestingTokenId(id);
      // Запрос к API для проверки токена Wildberries
      const result = await wildberriesService.testToken(Number(id));
      
      // Обновляем локальное состояние
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.id === id ? { 
            ...token, 
            lastChecked: new Date().toISOString(),
            isValid: result.is_valid
          } : token
        )
      );
    } catch (err) {
      // Обновляем статус на недействительный в случае ошибки
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.id === id ? { 
            ...token, 
            lastChecked: new Date().toISOString(),
            isValid: false
          } : token
        )
      );
      
      if (err instanceof Error) {
        alert(`Ошибка при проверке токена: ${err.message}`);
      } else {
        alert('Произошла ошибка при проверке токена');
      }
    } finally {
      setTestingTokenId(null);
    }
  };

  /**
   * Обработчик обновления списка токенов
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTokens();
    setRefreshing(false);
  };

  /**
   * Открыть модальное окно для редактирования токена
   */
  const openEditModal = (token: Token) => {
    setSelectedToken(token);
    setShowEditModal(true);
  };

  /**
   * Открыть модальное окно для удаления токена
   */
  const openDeleteModal = (token: Token) => {
    setSelectedToken(token);
    setShowDeleteModal(true);
  };

  /**
   * Рендеринг статуса валидности токена
   */
  const renderTokenValidity = (token: Token) => {
    if (token.isValid === undefined) {
      return (
        <Badge bg="secondary">
          <FontAwesomeIcon icon={faQuestion} className="me-1" />
          Не проверен
        </Badge>
      );
    }
    
    return token.isValid ? (
      <Badge bg="success">
        <FontAwesomeIcon icon={faCheck} className="me-1" />
        Действителен
      </Badge>
    ) : (
      <Badge bg="danger">
        <FontAwesomeIcon icon={faTimes} className="me-1" />
        Недействителен
      </Badge>
    );
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb 
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Настройки маркетплейсов', path: '/marketplace-settings' },
          { label: 'Wildberries', path: '/marketplace-settings/wildberries' },
          { label: 'Управление токенами', active: true }
        ]}
      />

      <h1 className="h3 mb-4">Управление токенами Wildberries</h1>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Список токенов</h5>
              <div>
                <Button 
                  variant="outline-secondary" 
                  className="me-2"
                  onClick={handleRefresh}
                  disabled={isLoading || refreshing}
                >
                  {refreshing ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                  ) : (
                    <FontAwesomeIcon icon={faSyncAlt} />
                  )}
                  <span className="d-none d-md-inline ms-1">Обновить</span>
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddModal(true)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span className="ms-1">Добавить токен</span>
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}
              
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Загрузка токенов...</p>
                </div>
              ) : tokens.length === 0 ? (
                <Alert variant="info">
                  Токены Wildberries не найдены. Добавьте токен для работы с API Wildberries.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Название</th>
                        <th>Токен</th>
                        <th>Статус</th>
                        <th>Валидность</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map(token => (
                        <tr key={token.id}>
                          <td>{token.name}</td>
                          <td>
                            <code>
                              {token.token.substring(0, 7)}...
                              {token.token.substring(token.token.length - 7)}
                            </code>
                          </td>
                          <td>
                            {token.active ? (
                              <Badge bg="success">Активен</Badge>
                            ) : (
                              <Badge bg="secondary">Неактивен</Badge>
                            )}
                          </td>
                          <td>{renderTokenValidity(token)}</td>
                          <td>
                            <div className="btn-group">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => openEditModal(token)}
                                title="Редактировать"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                              
                              <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                onClick={() => handleToggleTokenActive(token.id, token.active)}
                                disabled={togglingTokenId === token.id}
                                title={token.active ? "Деактивировать" : "Активировать"}
                              >
                                {togglingTokenId === token.id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : token.active ? (
                                  <FontAwesomeIcon icon={faTimes} />
                                ) : (
                                  <FontAwesomeIcon icon={faCheck} />
                                )}
                              </Button>
                              
                              <Button 
                                variant="outline-info" 
                                size="sm" 
                                onClick={() => handleTestToken(token.id)}
                                disabled={testingTokenId === token.id}
                                title="Проверить токен"
                              >
                                {testingTokenId === token.id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <FontAwesomeIcon icon={faSyncAlt} />
                                )}
                              </Button>
                              
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => openDeleteModal(token)}
                                title="Удалить"
                              >
                                <FontAwesomeIcon icon={faTrash} />
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
      
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Как получить токен Wildberries</h5>
            </Card.Header>
            <Card.Body>
              <ol>
                <li>Войдите в личный кабинет продавца Wildberries.</li>
                <li>Перейдите в раздел <strong>Настройки</strong> &rarr; <strong>Доступ к API</strong>.</li>
                <li>Нажмите кнопку <strong>Создать новый токен</strong>.</li>
                <li>Укажите название токена (для внутреннего использования) и выберите необходимые права доступа.</li>
                <li>Скопируйте сгенерированный токен (обратите внимание, что токен показывается только один раз).</li>
                <li>Введите полученный токен в форму добавления на этой странице.</li>
              </ol>
              <Alert variant="info">
                Подробную информацию о работе с API Wildberries можно найти в&nbsp;
                <AlertLink href="https://openapi.wb.ru/" target="_blank" rel="noopener noreferrer">
                  официальной документации
                </AlertLink>.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Модальные окна */}
      <Suspense fallback={<div>Загрузка...</div>}>
        {showAddModal && (
          <AddTokenModal
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            onSubmit={handleAddToken}
          />
        )}
        
        {showEditModal && selectedToken && (
          <EditTokenModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            onSubmit={handleEditToken}
            token={selectedToken}
          />
        )}
        
        {showDeleteModal && selectedToken && (
          <DeleteTokenModal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            onDelete={handleDeleteToken}
            token={selectedToken}
          />
        )}
      </Suspense>
    </Container>
  );
};

export default WildberriesTokens; 