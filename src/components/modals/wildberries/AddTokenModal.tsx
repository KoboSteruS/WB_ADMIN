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
 * Модальное окно для добавления нового токена Wildberries
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
    e.stopPropagation();
    
    // Проверка валидации формы
    const form = e.currentTarget;
    if (!form.checkValidity() || !token.trim()) {
      setValidated(true);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Прямой вызов API вместо использования onSubmit
      const url = "http://62.113.44.196:8080/api/v1/wb-tokens/";
      const data = {
        token: token.trim(),
        name: name.trim() || undefined
      };
      
      console.log('Отправка данных:', data);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': 'Token d65c2b3ed3a643341c8f2b7f380fb5a12dac826f',
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      console.log('Статус ответа:', response.status);
      
      const responseText = await response.text();
      console.log('Текст ответа:', responseText);

      if (response.ok) {
        setSuccess(true);
        
        // Сбрасываем поля формы
        setName('');
        setToken('');
        setValidated(false);
        
        // Вызываем переданный обработчик для обновления списка токенов
        try {
          await onSubmit({ name: data.name || '', token: data.token });
        } catch (e) {
          console.error('Ошибка при вызове onSubmit:', e);
        }
        
        // Закрываем модальное окно через 1.5 секунды после успешной отправки
        setTimeout(() => {
          onHide();
          setSuccess(false);
        }, 1500);
      } else {
        // Пытаемся распарсить JSON с ошибкой
        try {
          const errorData = JSON.parse(responseText);
          const errorMessage = errorData.detail || errorData.error || errorData.message || 
                              JSON.stringify(errorData);
          setError(errorMessage);
        } catch (e) {
          // Если не удалось распарсить, выводим просто текст
          setError(responseText || `Ошибка: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при добавлении токена');
      }
      console.error('Ошибка при отправке запроса:', err);
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
        <Modal.Title>Добавление токена Wildberries</Modal.Title>
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
              disabled={isSubmitting}
              maxLength={100}
            />
            <Form.Text className="text-muted">
              Название для идентификации токена в системе (необязательно)
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>API Token</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Вставьте токен API Wildberries"
              value={token}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setToken(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              Введите токен API Wildberries
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Скопируйте токен из личного кабинета Wildberries
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
            disabled={isSubmitting || !token.trim()}
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