import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { OzonToken, OzonTokenUpdateRequest } from '../../../services/api/types';

interface EditTokenModalProps {
  show: boolean;
  onHide: () => void;
  token: OzonToken | null;
  onSubmit: (data: OzonTokenUpdateRequest) => Promise<void>;
}

/**
 * Модальное окно для редактирования токена Ozon
 */
const EditTokenModal: React.FC<EditTokenModalProps> = ({ show, onHide, token, onSubmit }) => {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Обновляем состояние при изменении токена
  useEffect(() => {
    if (token) {
      setClientId(token.client_id);
      setApiKey(token.api_key);
      setIsActive(token.is_active);
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSubmit({
        client_id: clientId,
        api_key: apiKey,
        is_active: isActive
      });
      handleClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при редактировании токена');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setClientId('');
    setApiKey('');
    setIsActive(true);
    setError(null);
    setIsLoading(false);
    onHide();
  };

  if (!token) {
    return null;
  }

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать токен Ozon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Client ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите Client ID"
              value={clientId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setClientId(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              Идентификатор клиента из личного кабинета Ozon
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>API ключ</Form.Label>
            <Form.Control
              type="password"
              placeholder="Введите API ключ"
              value={apiKey}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              API ключ из личного кабинета Ozon
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="isActive"
              label="Активен"
              checked={isActive}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditTokenModal; 