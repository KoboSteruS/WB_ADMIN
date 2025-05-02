import React, { useState, ChangeEvent, FormEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { OzonTokenCreateRequest } from '../../../services/api/types';

interface AddTokenModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: OzonTokenCreateRequest) => Promise<void>;
}

const AddTokenModal: React.FC<AddTokenModalProps> = ({ show, onHide, onSubmit }) => {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await onSubmit({
        client_id: clientId,
        api_key: apiKey
      });
      handleClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при добавлении токена');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      setClientId('');
      setApiKey('');
      setError(null);
    setIsLoading(false);
      onHide();
  };
  
  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
          <Modal.Title>Добавить токен Ozon</Modal.Title>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Добавление...' : 'Добавить'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddTokenModal; 