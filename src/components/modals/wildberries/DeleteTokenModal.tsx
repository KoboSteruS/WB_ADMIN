import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

interface DeleteTokenModalProps {
  show: boolean;
  onHide: () => void;
  onDelete: (id: string) => Promise<void>;
  token: {
    id: string;
    name: string;
  } | null;
}

/**
 * Модальное окно для подтверждения удаления токена Wildberries
 */
const DeleteTokenModal: React.FC<DeleteTokenModalProps> = ({
  show,
  onHide,
  onDelete,
  token
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * Сброс состояния модального окна
   */
  const resetState = () => {
    setIsDeleting(false);
    setError(null);
    setSuccess(false);
  };

  /**
   * Обработка закрытия модального окна
   */
  const handleClose = () => {
    resetState();
    onHide();
  };

  /**
   * Обработка удаления токена
   */
  const handleDelete = async () => {
    if (!token) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await onDelete(token.id);
      setSuccess(true);
      
      // Автоматически закрываем модальное окно после успешного удаления
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при удалении токена');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!token) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Удаление токена</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}
        
        {success && (
          <Alert variant="success">
            Токен успешно удален!
          </Alert>
        )}
        
        {!success && (
          <div>
            <p>Вы действительно хотите удалить токен <strong>{token.name}</strong>?</p>
            <p className="text-danger">Это действие нельзя отменить. После удаления все связанные с этим токеном операции будут недоступны.</p>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={isDeleting}
        >
          {success ? "Закрыть" : "Отмена"}
        </Button>
        
        {!success && (
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Удаление...
              </>
            ) : (
              "Удалить"
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTokenModal; 