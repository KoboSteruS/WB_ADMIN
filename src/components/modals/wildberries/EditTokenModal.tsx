import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

interface TokenData {
  id: string;
  name: string;
}

interface EditTokenModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (tokenData: TokenData) => Promise<void>;
  token: TokenData | null;
}

/**
 * Модальное окно для редактирования токена Wildberries
 */
const EditTokenModal: React.FC<EditTokenModalProps> = ({
  show,
  onHide,
  onSubmit,
  token
}) => {
  // Состояние формы
  const [tokenName, setTokenName] = useState<string>('');
  
  // Состояние валидации
  const [validated, setValidated] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * Инициализация формы при получении токена
   */
  useEffect(() => {
    if (token) {
      setTokenName(token.name);
    }
  }, [token]);

  /**
   * Очистка формы и сброс состояний
   */
  const resetForm = () => {
    if (token) {
      setTokenName(token.name);
    } else {
      setTokenName('');
    }
    setValidated(false);
    setIsSubmitting(false);
    setError(null);
    setSuccess(false);
  };

  /**
   * Обработка закрытия модального окна
   */
  const handleClose = () => {
    resetForm();
    onHide();
  };
  
  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Проверка валидности формы
    if (!form.checkValidity() || !token) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setValidated(true);
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({ 
        id: token.id, 
        name: tokenName.trim() 
      });
      setSuccess(true);
      
      // Автоматически закрываем форму через некоторое время
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при обновлении токена');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Сброс сообщения об ошибке при изменении полей
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [tokenName]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Редактирование токена Wildberries</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {!token && (
            <Alert variant="danger">
              Токен не найден. Пожалуйста, закройте окно и попробуйте снова.
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}
          
          {success && (
            <Alert variant="success">
              Токен успешно обновлен!
            </Alert>
          )}
          
          {token && !success && (
            <Form.Group className="mb-3">
              <Form.Label>Название токена</Form.Label>
              <Form.Control
                type="text"
                placeholder="Например: Основной аккаунт"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                Пожалуйста, укажите название токена
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Используйте понятное название для удобной идентификации токена
              </Form.Text>
              
              <div className="mt-3">
                <Alert variant="info">
                  <p className="mb-0">
                    <strong>Обратите внимание:</strong> Редактировать можно только название токена. 
                    Если вам необходимо изменить сам токен, пожалуйста, удалите его и добавьте новый.
                  </p>
                </Alert>
              </div>
            </Form.Group>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {success ? "Закрыть" : "Отмена"}
          </Button>
          
          {token && !success && (
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
                  Сохранение...
                </>
              ) : (
                "Сохранить изменения"
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditTokenModal; 