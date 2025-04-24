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
import { faPlus, faEdit, faTrash, faCheck, faTimes, faSyncAlt, faQuestion, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { wildberriesService } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import Form from 'react-bootstrap/Form';

// Ленивая загрузка модальных окон
const AddTokenModal = lazy(() => import('../../components/modals/wildberries/AddTokenModal'));
const EditTokenModal = lazy(() => import('../../components/modals/wildberries/EditTokenModal'));
const DeleteTokenModal = lazy(() => import('../../components/modals/wildberries/DeleteTokenModal'));

interface Token {
  id: string;
  name: string;
  token: string;
  time?: string; // Время окончания токена
  account_id?: string;
  account_title?: string;
  account_inn?: string;
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
        id: token.id?.toString() || '',
        name: token.name || token.account_title || 'Токен Wildberries',
        token: token.token || '',
        time: token.time || '',
        account_id: token.account_id?.toString() || '',
        account_title: token.account_title || '',
        account_inn: token.account_inn || '',
        active: token.is_active || false,
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

  /**
   * Рендеринг таблицы с токенами
   */
  const renderTokensTable = () => {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Список токенов</h5>
          <small className="text-muted">Всего токенов: {tokens.length}</small>
        </div>
        <Table striped bordered hover responsive className="border">
          <thead className="bg-light">
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>ID</th>
              <th>Название</th>
              <th>Токен</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.id}>
                <td className="text-center">
                  <Form.Check type="checkbox" id={`check-${token.id}`} />
                </td>
                <td>{token.id}</td>
                <td>{token.name || 'Токен Wildberries'}</td>
                <td className="text-truncate" style={{ maxWidth: '200px' }}>{token.token}</td>
                <td>{token.time || '-'}</td>
                <td>
                  <div className="d-flex gap-1 justify-content-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {/* действие для заказов */}}
                      title="Заказы"
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => openEditModal(token)}
                      title="Редактировать"
                    >
                      <FontAwesomeIcon icon={faEdit} />
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
        <div className="mt-3">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Добавить токен
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb 
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Маркетплейсы', path: '/marketplaces' },
          { label: 'Токены Wildberries', active: true }
        ]} 
      />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Токены Wildberries</h1>
            <div>
              <Button
                variant="outline-secondary"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <FontAwesomeIcon icon={faSyncAlt} spin={refreshing} /> Обновить
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Body>
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Загрузка токенов...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">
                  <Alert.Heading>Ошибка загрузки</Alert.Heading>
                  <p>{error}</p>
                  <hr />
                  <div className="d-flex justify-content-end">
                    <Button variant="outline-danger" onClick={handleRefresh}>
                      <FontAwesomeIcon icon={faSyncAlt} className="me-2" /> Повторить
                    </Button>
                  </div>
                </Alert>
              ) : tokens.length === 0 ? (
                <Alert variant="info">
                  <Alert.Heading>Нет токенов</Alert.Heading>
                  <p>
                    У вас пока нет добавленных токенов Wildberries. 
                    Добавьте новый токен, чтобы начать работу с API Wildberries.
                  </p>
                  <hr />
                  <p className="mb-0">
                    Как получить токен? <AlertLink href="https://openapi.wildberries.ru/">Документация Wildberries API</AlertLink>
                  </p>
                </Alert>
              ) : (
                renderTokensTable()
              )}
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
            token={selectedToken}
            onSubmit={handleEditToken}
          />
        )}
        
        {showDeleteModal && selectedToken && (
          <DeleteTokenModal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            token={selectedToken}
            onDelete={() => handleDeleteToken(selectedToken.id)}
          />
        )}
      </Suspense>
    </Container>
  );
};

export default WildberriesTokens; 