import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Table, Button, Form } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

/**
 * Интерфейс для юридического лица
 */
interface LegalEntity {
  id: string;
  title: string;
  inn: string;
}

/**
 * Компонент для управления юридическими лицами
 */
const LegalEntities: React.FC = () => {
  const navigate = useNavigate();
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newEntity, setNewEntity] = useState<{ title: string; inn: string }>({ title: '', inn: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [entityToDelete, setEntityToDelete] = useState<LegalEntity | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  /**
   * Загрузка списка юридических лиц с сервера
   */
  const fetchLegalEntities = async () => {
    try {
      setLoading(true);
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
        setError('Получен неожиданный формат данных');
      }
    } catch (error: any) {
      setError(`Ошибка при загрузке данных: ${error.message}`);
      console.error('Ошибка при запросе:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchLegalEntities();
  }, []);

  /**
   * Закрытие модального окна добавления
   */
  const handleClose = () => {
    setShowModal(false);
    setNewEntity({ title: '', inn: '' });
    setSubmitError(null);
  };

  /**
   * Открытие модального окна добавления
   */
  const handleShow = () => setShowModal(true);

  /**
   * Обработка изменения полей формы
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntity(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Переход на страницу заказов WB для выбранного юр. лица
   * @param entity - юридическое лицо
   */
  const handleViewWbOrders = (entity: LegalEntity) => {
    // Сохраняем ID и данные юр. лица в localStorage для использования на странице заказов
    localStorage.setItem('selectedLegalEntityId', entity.id);
    localStorage.setItem('selectedLegalEntityData', JSON.stringify(entity));
    
    // Переходим на страницу заказов WB
    navigate('/marketplace-settings/wildberries/orders');
  };

  /**
   * Возврат на главную страницу
   */
  const handleBackToDashboard = () => {
    navigate('/');
  };

  /**
   * Отправка формы добавления юр. лица
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEntity.title.trim() || !newEntity.inn.trim()) {
      setSubmitError('Необходимо заполнить все поля');
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      const response = await fetch('http://62.113.44.196:8080/api/v1/account-ip/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'title': newEntity.title,
          'inn': newEntity.inn
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData ? JSON.stringify(errorData) : `HTTP Error: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('Успешно добавлено юр. лицо:', data);
      
      // Обновляем список юр. лиц
      await fetchLegalEntities();
      
      // Закрываем модальное окно
      handleClose();
    } catch (error: any) {
      console.error('Ошибка при создании юр. лица:', error);
      setSubmitError(`Ошибка при создании: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Открытие модального окна подтверждения удаления
   */
  const handleShowDeleteConfirm = (entity: LegalEntity) => {
    setEntityToDelete(entity);
    setShowDeleteModal(true);
  };

  /**
   * Закрытие модального окна подтверждения удаления
   */
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setEntityToDelete(null);
  };

  /**
   * Удаление юридического лица
   */
  const handleDeleteEntity = async () => {
    if (!entityToDelete) return;

    try {
      setDeleting(true);
      
      const response = await fetch(`http://62.113.44.196:8080/api/v1/account-ip/${entityToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      try {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          console.log('Success:', data);
        } else {
          console.log('Empty response body (успешное удаление)');
        }
      } catch (error) {
        console.log('Не JSON ответ или пустой ответ (успешное удаление)');
      }
      
      // Обновляем список юр. лиц
      await fetchLegalEntities();
      
      // Закрываем модальное окно
      handleCloseDeleteModal();
    } catch (error: any) {
      console.error('Ошибка при удалении юр. лица:', error);
      alert(`Ошибка при удалении: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="page-title">Юридические лица</h1>
              <p className="text-muted">Управление юридическими лицами для работы с маркетплейсами</p>
            </div>
            <Button variant="outline-secondary" onClick={handleBackToDashboard}>
              <i className="bi bi-arrow-left me-2"></i>
              Вернуться на Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-title mb-0">Список юридических лиц</h2>
            <Button variant="primary" onClick={handleShow}>
              <i className="bi bi-plus-circle me-2"></i>
              Добавить юр. лицо
            </Button>
          </div>
          
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
          ) : legalEntities.length === 0 ? (
            <Alert variant="warning">
              <i className="bi bi-info-circle me-2"></i>
              Юридические лица не найдены
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Наименование</th>
                  <th>ИНН</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {legalEntities.map((entity) => (
                  <tr key={entity.id}>
                    <td>{entity.id}</td>
                    <td>{entity.title}</td>
                    <td>{entity.inn}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button 
                          variant="danger" 
                          onClick={() => handleShowDeleteConfirm(entity)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Удалить
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* Модальное окно для добавления юр. лица */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление юридического лица</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Наименование</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newEntity.title}
                onChange={handleInputChange}
                placeholder="Введите наименование юр. лица"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInn">
              <Form.Label>ИНН</Form.Label>
              <Form.Control
                type="text"
                name="inn"
                value={newEntity.inn}
                onChange={handleInputChange}
                placeholder="Введите ИНН"
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleClose} className="me-2">
                Отмена
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Сохранение...
                  </>
                ) : (
                  'Сохранить'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {entityToDelete && (
            <p>
              Вы действительно хотите удалить юридическое лицо "{entityToDelete.title}" (ИНН: {entityToDelete.inn})?
              <br />
              <b>Это действие невозможно отменить.</b>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteEntity} 
            disabled={deleting}
          >
            {deleting ? (
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
    </Container>
  );
};

export default LegalEntities; 