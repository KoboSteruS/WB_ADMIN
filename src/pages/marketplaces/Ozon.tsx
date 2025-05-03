import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import { Link } from 'react-router-dom';
import AddTokenModal from '../../components/modals/ozon/AddTokenModal';

const Ozon: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingTokenId, setDeletingTokenId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);

  // Функция для получения токенов Озон
  const fetchOzonTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://62.113.44.196:8080/api/v1/ozon-tokens/', {
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
        console.log('Успешно получено:', data);
        data.forEach(token => {
          console.log('---');
          console.log('Всё:', token);
          console.log('Всё:', token.id);
          console.log('Всё:', token.client_id);
          console.log('TOKEN:', token.api_key);
          console.log('Всё:', token.created_at);
          console.log('Всё:', token.account_ip);
        });
        
        setTokens(data);
        setIsConnected(data.length > 0);
      } else {
        console.log('Ответ сервера не является массивом:', data);
        setTokens([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось загрузить список токенов');
      }
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка токенов при монтировании компонента
  useEffect(() => {
    fetchOzonTokens();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Здесь будет логика сохранения настроек API
      console.log('Сохранение настроек Ozon:', { apiKey });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }

    setValidated(true);
  };

  const handleRefresh = () => {
    fetchOzonTokens();
  };

  const handleAddToken = async (tokenData: any) => {
    try {
      // Отправляем запрос напрямую
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
      await fetchOzonTokens();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return Promise.resolve();
    } catch (error) {
      console.error('Ошибка:', error);
      return Promise.reject(error);
    }
  };

  const handleDeleteToken = async (id: string) => {
    try {
      setDeletingTokenId(id);
      
      const response = await fetch(`http://62.113.44.196:8080/api/v1/ozon-tokens/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      // Обновляем список токенов
      setTokens(tokens.filter(token => token.id !== id));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось удалить токен');
      }
    } finally {
      setDeletingTokenId(null);
      setShowDeleteConfirm(false);
    }
  };

  const openDeleteConfirmation = (token: any) => {
    setSelectedToken(token);
    setShowDeleteConfirm(true);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Настройки Ozon</h1>
          <p className="text-muted">Управление интеграцией с маркетплейсом Ozon</p>
        </Col>
      </Row>

      {showSuccess && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
              Настройки успешно сохранены
            </Alert>
          </Col>
        </Row>
      )}

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              Ошибка: {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className='card'>
        <Col>

          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Токены Ozon</h5>
              <div>
                <Button variant="primary" className="me-2" onClick={() => setShowAddModal(true)}>
                  <i className="bi bi-plus-circle"></i> Добавить токен
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  {isLoading ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    'Обновить'
                  )}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Загрузка токенов...</p>
                </div>
              ) : tokens.length === 0 ? (
                <Alert variant="info">
                  Токены Ozon не найдены.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client ID</th>
                        <th>API Key</th>
                        <th>Создан</th>
                        <th>IP</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((token) => (
                        <tr key={token.id}>
                          <td>{token.id}</td>
                          <td>{token.client_id || 'Не указан'}</td>
                          <td>
                            <code title={token.api_key}>
                              {token.api_key ? `${token.api_key.substring(0, 8)}...${token.api_key.substring(token.api_key.length - 8)}` : 'Не указан'}
                            </code>
                          </td>
                          <td>{new Date(token.created_at).toLocaleString('ru-RU')}</td>
                          <td>{token.account_ip || 'Не указан'}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => openDeleteConfirmation(token)}
                                disabled={deletingTokenId === token.id}
                              >
                                {deletingTokenId === token.id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
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
      <AddTokenModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddToken}
      />
      
      {/* Модальное окно подтверждения удаления */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        backdrop="static"
        keyboard={!deletingTokenId}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Удаление токена</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedToken && (
            <>
              <p>Вы действительно хотите удалить токен Ozon?</p>
              <div className="bg-light p-3 rounded mb-3">
                <p className="mb-1"><strong>ID:</strong> {selectedToken.id}</p>
                <p className="mb-1"><strong>Client ID:</strong> {selectedToken.client_id || 'Не указан'}</p>
                <p className="mb-0"><strong>Создан:</strong> {new Date(selectedToken.created_at).toLocaleString('ru-RU')}</p>
              </div>
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Это действие необратимо. Удаленный токен не подлежит восстановлению.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteConfirm(false)}
            disabled={!!deletingTokenId}
          >
            Отмена
          </Button>
          {selectedToken && (
            <Button 
              variant="danger" 
              onClick={() => handleDeleteToken(selectedToken.id)}
              disabled={!!deletingTokenId}
            >
              {deletingTokenId ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Ozon; 