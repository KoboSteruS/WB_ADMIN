import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { OzonToken } from '../../../services/api/types';

interface DeleteTokenModalProps {
  show: boolean;
  onHide: () => void;
  token: OzonToken | null;
  onDelete: (id: string) => Promise<void>;
}

/**
 * Модальное окно для подтверждения удаления токена Ozon
 */
const DeleteTokenModal: React.FC<DeleteTokenModalProps> = ({
  show,
  onHide,
  token,
  onDelete
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Обработка удаления токена
   */
  const handleDelete = async () => {
    if (!token) return;

    setError(null);
    setIsLoading(true);

    try {
      await onDelete(token.id);
      handleClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при удалении токена');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработка закрытия модального окна
   */
  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onHide();
  };

  if (!token) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Удалить токен Ozon</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        <p>
          Вы уверены, что хотите удалить токен с Client ID <strong>{token.client_id}</strong>?
        </p>
        <Alert variant="warning">
          <p className="mb-0">
            <strong>Внимание!</strong> Это действие нельзя отменить. После удаления токена все связанные с ним операции будут недоступны.
          </p>
        </Alert>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={isLoading}
        >
          Отмена
        </Button>
        
        <Button 
          variant="danger" 
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? 'Удаление...' : 'Удалить'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTokenModal; 