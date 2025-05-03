import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCheck, faTimes, faSyncAlt, faQuestion, faCopy } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../components/Breadcrumb';
import AlertLink from '../../components/AlertLink';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import apiService from '../../services/api/api-service';
import { OzonToken, OzonTokenCreateRequest, OzonTokenUpdateRequest } from '../../services/api/types';

// Импорт модальных окон
const AddTokenModal = lazy(() => import('../../components/modals/ozon/AddTokenModal'));
const EditTokenModal = lazy(() => import('../../components/modals/ozon/EditTokenModal'));
const DeleteTokenModal = lazy(() => import('../../components/modals/ozon/DeleteTokenModal'));

/**
 * Маскирование API ключа для отображения
 */
const maskApiKey = (key: string): string => {
  if (!key) return '';
  if (key.length <= 16) return key;
  return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
};

/**
 * Получение названия юр. лица по ID
 */
const getLegalEntityName = (id: number): string => {
  // TODO: Реализовать получение названия юр. лица
  return `Юр. лицо #${id}`;
};

/**
 * Компонент для отображения списка токенов Ozon
 */
const OzonTokens: React.FC = () => {
  const [tokens, setTokens] = useState<OzonToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Состояния для модальных окон
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<OzonToken | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const tokenRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});

  /**
   * Загрузка списка токенов
   */
  const loadTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Пытаемся получить токены из внешнего API
      try {
        const response = await fetch('http://62.113.44.196:8080/api/v1/ozon-tokens/', {
          headers: {
            'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
          }
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          setTokens(data);
        return;
        }
      } catch (externalError) {
        console.warn('Не удалось загрузить токены из внешнего API, используем встроенный API:', externalError);
      }
      
      // Если внешний API недоступен, используем внутренний API
      const response = await apiService.marketplaceCredentials.getOzonTokens();
      setTokens(response.data || []);
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
  const handleAddToken = async (tokenData: OzonTokenCreateRequest) => {
    try {
      const response = await fetch('http://62.113.44.196:8080/api/v1/ozon-tokens/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tokenData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка при добавлении токена:', errorText);
        throw new Error(`Ошибка при добавлении токена: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Токен успешно добавлен:', data);
      
      // Обновляем список токенов
      await loadTokens();
      return Promise.resolve();
    } catch (error) {
      console.error('Ошибка:', error);
      return Promise.reject(error);
    }
  };

  /**
   * Обработчик редактирования токена
   */
  const handleEditToken = async (tokenData: OzonTokenUpdateRequest) => {
    if (!selectedToken) return;

    try {
      const response = await fetch(`http://62.113.44.196:8080/api/v1/ozon-tokens/${selectedToken.id}/`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tokenData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      await loadTokens();
      setShowEditModal(false);
      setSelectedToken(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при редактировании токена');
      }
    }
  };

  /**
   * Обработчик удаления токена
   */
  const handleDeleteToken = async (id: string) => {
    try {
      const response = await fetch(`http://62.113.44.196:8080/api/v1/ozon-tokens/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      await loadTokens();
      setShowDeleteModal(false);
      setSelectedToken(null);
      return Promise.resolve();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при удалении токена');
      }
      return Promise.reject(err);
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
  const openEditModal = (token: OzonToken) => {
    setSelectedToken(token);
    setShowEditModal(true);
  };

  /**
   * Открыть модальное окно для удаления токена
   */
  const openDeleteModal = (token: OzonToken) => {
    setSelectedToken(token);
    setShowDeleteModal(true);
  };

  // Копирование токена в буфер обмена
  const handleCopyToken = async (token: string, id: string) => {
    try {
      await navigator.clipboard.writeText(token);
      if (tokenRefs.current[id]) {
        tokenRefs.current[id]!.textContent = 'Скопировано!';
        setTimeout(() => {
          if (tokenRefs.current[id]) {
            tokenRefs.current[id]!.textContent = 'Копировать';
          }
        }, 1200);
      }
    } catch {
      alert('Ошибка копирования');
    }
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb 
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Настройки маркетплейсов', path: '/marketplace-settings' },
          { label: 'Ozon', path: '/marketplace-settings/ozon' },
          { label: 'Управление токенами', active: true }
        ]}
      />

      <h1 className="h3 mb-4">Токены Ozon</h1>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="fw-bold">Токены API</div>
              <div>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={handleRefresh} disabled={isLoading}>
                  <i className="bi bi-arrow-clockwise"></i> Обновить
                </Button>
                <span className="text-muted">Всего токенов: {tokens.length}</span>
              </div>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}
                <div className="table-responsive">
                <Table bordered hover size="sm" className="align-middle mb-0">
                    <thead>
                      <tr>
                      <th style={{ width: 40 }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows.length === tokens.length && tokens.length > 0}
                          onChange={e => setSelectedRows(e.target.checked ? tokens.map(t => t.id) : [])}
                        />
                      </th>
                      <th>ID</th>
                      <th>TOKEN</th>
                      <th>Time</th>
                      <th>Account_id</th>
                      <th>Account_title</th>
                      <th>Account_inn</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                    {tokens.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted">Токены Ozon не найдены</td>
                      </tr>
                    ) : (
                      tokens.map(token => (
                        <tr key={token.id}>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={selectedRows.includes(token.id)}
                              onChange={e => setSelectedRows(e.target.checked ? [...selectedRows, token.id] : selectedRows.filter(id => id !== token.id))}
                            />
                          </td>
                          <td>{token.id}</td>
                          <td>
                            <div style={{ fontFamily: 'monospace' }}>
                              {token.api_key ? maskApiKey(token.api_key) : '—'}
                            </div>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0"
                              style={{ fontSize: 13 }}
                              onClick={() => handleCopyToken(token.api_key, token.id)}
                            >
                              <span ref={el => tokenRefs.current[token.id] = el}>Копировать</span>
                            </Button>
                          </td>
                          <td>{token.created_at ? new Date(token.created_at).toLocaleString('ru-RU') : '—'}</td>
                          <td>{(token as any).account_ip || '—'}</td>
                          <td>{(token as any).account_title || 'Не указано'}</td>
                          <td>{(token as any).account_inn || '—'}</td>
                          <td className="text-center">
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                              className="me-1"
                              title="Удалить"
                                onClick={() => openDeleteModal(token)}
                              >
                              <i className="bi bi-trash"></i>
                              </Button>
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </Table>
                </div>
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>Добавить токен
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Как получить токен Ozon</h5>
            </Card.Header>
            <Card.Body>
              <ol>
                <li>Войдите в личный кабинет продавца Ozon.</li>
                <li>Перейдите в раздел <strong>Настройки</strong> &rarr; <strong>Настройки API</strong>.</li>
                <li>Нажмите кнопку <strong>Создать ключ</strong>.</li>
                <li>Укажите название ключа (для внутреннего использования) и сохраните.</li>
                <li>Скопируйте сгенерированный <strong>Client ID</strong> и <strong>API Key</strong>.</li>
                <li>Введите полученные данные в форму добавления токена на этой странице.</li>
              </ol>
              <Alert variant="info">
                Подробную информацию о работе с API Ozon можно найти в&nbsp;
                <AlertLink href="https://docs.ozon.ru/api/seller" target="_blank" rel="noopener noreferrer">
                  официальной документации
                </AlertLink>.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Модальные окна */}
      <Suspense fallback={<div>Загрузка...</div>}>
          <AddTokenModal
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            onSubmit={handleAddToken}
          />
          <EditTokenModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
          token={selectedToken}
            onSubmit={handleEditToken}
          />
          <DeleteTokenModal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            token={selectedToken}
          onDelete={handleDeleteToken}
          />
      </Suspense>
    </Container>
  );
};

export default OzonTokens; 