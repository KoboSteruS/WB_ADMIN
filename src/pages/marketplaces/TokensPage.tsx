import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { Link } from 'react-router-dom';
import { wildberriesService } from '../../services/api';
import { WildberriesToken } from '../../services/api/types';

const TokensPage: React.FC = () => {
  const [tokens, setTokens] = useState<WildberriesToken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [tokenToDelete, setTokenToDelete] = useState<WildberriesToken | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    token: ''
  });
  const [validated, setValidated] = useState<boolean>(false);

  // Загрузка токенов при монтировании компонента
  useEffect(() => {
    fetchTokens();
  }, []);

  // Получение списка токенов
  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wildberriesService.getTokens();
      setTokens(data);
    } catch (err: any) {
      console.error("Ошибка при загрузке токенов:", err);
      setError(err.message || 'Не удалось загрузить токены');
    } finally {
      setLoading(false);
    }
  };

  // Обработка отправки формы добавления токена
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    setValidated(true);
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }
    
    try {
      setLoading(true);
      const newToken = await wildberriesService.createToken({
        name: formData.name,
        token: formData.token
      });
      setTokens([...tokens, newToken]);
      setShowAddModal(false);
      setFormData({ name: '', token: '' });
      setValidated(false);
      showSuccess('Токен успешно добавлен');
    } catch (err: any) {
      console.error("Ошибка при создании токена:", err);
      setError(err.message || 'Не удалось создать токен');
    } finally {
      setLoading(false);
    }
  };

  // Обработка изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Открытие модального окна подтверждения удаления
  const confirmDelete = (token: WildberriesToken) => {
    setTokenToDelete(token);
    setShowDeleteModal(true);
  };

  // Удаление токена
  const handleDelete = async () => {
    if (!tokenToDelete) return;
    
    try {
      setLoading(true);
      await wildberriesService.deleteToken(Number(tokenToDelete.id));
      setTokens(tokens.filter(t => t.id !== tokenToDelete.id));
      setShowDeleteModal(false);
      showSuccess('Токен успешно удален');
    } catch (err: any) {
      console.error("Ошибка при удалении токена:", err);
      setError(err.message || 'Не удалось удалить токен');
    } finally {
      setLoading(false);
    }
  };

  // Показать уведомление об успешном действии
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="page-title">Управление токенами Wildberries</h1>
              <p className="text-muted">Добавление, редактирование и удаление токенов API Wildberries</p>
            </div>
            <div>
              <Link to="/marketplace-settings/wildberries" className="btn btn-outline-secondary me-2">
                <i className="bi bi-arrow-left"></i> Назад
              </Link>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <i className="bi bi-plus-circle me-1"></i> Добавить токен
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Уведомление об успехе */}
      {showSuccessAlert && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setShowSuccessAlert(false)} dismissible>
              {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Уведомление об ошибке */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Список токенов</h5>
            </Card.Header>
            <Card.Body>
              {loading && tokens.length === 0 ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                  <p className="mt-3">Загрузка токенов...</p>
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-key-fill fs-1 text-muted"></i>
                  <p className="mt-3">У вас пока нет токенов. Добавьте новый токен, чтобы начать работу.</p>
                  <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    <i className="bi bi-plus-circle me-1"></i> Добавить токен
                  </Button>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Токен (фрагмент)</th>
                      <th>Статус</th>
                      <th>Создан</th>
                      <th>Последнее использование</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map(token => (
                      <tr key={token.id}>
                        <td>{token.name}</td>
                        <td>{token.token.substring(0, 8)}...{token.token.substring(token.token.length - 4)}</td>
                        <td>
                          {token.is_active ? (
                            <span className="badge bg-success">Активен</span>
                          ) : (
                            <span className="badge bg-danger">Неактивен</span>
                          )}
                        </td>
                        <td>{formatDate(token.created_at)}</td>
                        <td>{token.last_used ? formatDate(token.last_used) : 'Не использовался'}</td>
                        <td>
                          <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(token)}>
                            <i className="bi bi-trash"></i>
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

      {/* Модальное окно добавления токена */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление нового токена Wildberries</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название токена</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: Основной магазин WB"
                required
              />
              <div className="invalid-feedback">
                Пожалуйста, введите название токена
              </div>
              <Form.Text className="text-muted">
                Укажите понятное название для идентификации токена
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Токен API</Form.Label>
              <Form.Control
                type="password"
                name="token"
                value={formData.token}
                onChange={handleChange}
                placeholder="Введите токен API Wildberries"
                required
              />
              <div className="invalid-feedback">
                Пожалуйста, введите токен API
              </div>
              <Form.Text className="text-muted">
                Токен можно получить в личном кабинете Wildberries
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Сохранение...
                </>
              ) : 'Сохранить'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите удалить токен "{tokenToDelete?.name}"?</p>
          <p className="text-danger">Это действие невозможно отменить.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Удаление...
              </>
            ) : 'Удалить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TokensPage; 