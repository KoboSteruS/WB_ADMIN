import React, { useState, FormEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

interface TokenData {
  name: string;
  token: string;
}

interface AddTokenModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: TokenData) => Promise<void>;
}

/**
 * Модальное окно для добавления нового токена Ozon
 */
const AddTokenModal: React.FC<AddTokenModalProps> = ({ show, onHide, onSubmit }) => {
  // Состояние формы
  const [name, setName] = useState<string>('');
  const [token, setToken] = useState<string>('');
  
  // Состояние валидации
  const [validated, setValidated] = useState<boolean>(false);
  
  // Состояние отправки формы
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Проверка валидации формы
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      await onSubmit({ name, token });
      setSuccess(true);
      
      // Сбрасываем поля формы
      setName('');
      setToken('');
      setValidated(false);
      
      // Закрываем модальное окно через 1 секунду после успешной отправки
      setTimeout(() => {
        onHide();
        setSuccess(false);
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при добавлении токена');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Обработчик закрытия модального окна
   */
  const handleClose = () => {
    if (!isSubmitting) {
      // Сбрасываем состояние
      setName('');
      setToken('');
      setValidated(false);
      setError(null);
      setSuccess(false);
      onHide();
    }
  };
  
  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={!isSubmitting}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Добавление токена Ozon</Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success">
              Токен успешно добавлен!
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Название токена</Form.Label>
            <Form.Control
              type="text"
              placeholder="Например: Основной магазин"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              maxLength={100}
            />
            <Form.Control.Feedback type="invalid">
              Укажите название токена
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Название для идентификации токена в системе
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>API Token</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Вставьте токен API Ozon"
              value={token}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setToken(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              Введите токен API Ozon
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Скопируйте Client ID и API Key из личного кабинета Ozon
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
            ) : "Добавить токен"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddTokenModal; 