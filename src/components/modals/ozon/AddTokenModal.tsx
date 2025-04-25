import React, { useState, FormEvent, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

interface LegalEntity {
  id: string;
  title: string;
  inn: string;
}

interface TokenData {
  client_id: string;
  api_key: string;
  account_ip: number;
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
  const [clientId, setClientId] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedLegalEntityId, setSelectedLegalEntityId] = useState<string>('');
  
  // Состояние юридических лиц
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [legalEntitiesLoading, setLegalEntitiesLoading] = useState<boolean>(true);
  const [legalEntitiesError, setLegalEntitiesError] = useState<string | null>(null);
  const [refreshingLegalEntities, setRefreshingLegalEntities] = useState<boolean>(false);
  
  // Состояние валидации
  const [validated, setValidated] = useState<boolean>(false);
  
  // Состояние отправки формы
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  /**
   * Функция для получения списка юридических лиц
   */
  const fetchLegalEntities = async () => {
    try {
      setLegalEntitiesLoading(true);
      setLegalEntitiesError(null);
      setRefreshingLegalEntities(true);
      
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
        console.log('Успешно получено юр. лиц:', data.length);
      } else {
        console.log('Ответ сервера не является массивом:', data);
        setLegalEntitiesError('Неверный формат данных от сервера');
      }
    } catch (err) {
      if (err instanceof Error) {
        setLegalEntitiesError(err.message);
      } else {
        setLegalEntitiesError('Произошла ошибка при загрузке юридических лиц');
      }
      console.error('Ошибка при запросе юр. лиц:', err);
    } finally {
      setLegalEntitiesLoading(false);
      setRefreshingLegalEntities(false);
    }
  };
  
  /**
   * Загрузка юридических лиц при открытии модального окна
   */
  useEffect(() => {
    if (show) {
      fetchLegalEntities();
    }
  }, [show]);
  
  /**
   * Обработчик обновления юридических лиц
   */
  const handleRefreshLegalEntities = async () => {
    await fetchLegalEntities();
  };
  
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
    
    if (!clientId.trim()) {
      setError('Client ID не может быть пустым');
      return;
    }
    
    if (!apiKey.trim()) {
      setError('API Key не может быть пустым');
      return;
    }
    
    if (!selectedLegalEntityId) {
      setError('Необходимо выбрать юридическое лицо');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Подготавливаем данные для отправки
      const data: TokenData = {
        client_id: clientId.trim(),
        api_key: apiKey.trim(),
        account_ip: parseInt(selectedLegalEntityId, 10)
      };
      
      console.log('Отправляемые данные:', data);
      
      await onSubmit(data);
      setSuccess(true);
      
      // Сбрасываем поля формы
      setClientId('');
      setApiKey('');
      setSelectedLegalEntityId('');
      setValidated(false);
      
      // Закрываем модальное окно через 1.5 секунды после успешной отправки
      setTimeout(() => {
        onHide();
        setSuccess(false);
      }, 1500);
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
      setClientId('');
      setApiKey('');
      setSelectedLegalEntityId('');
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
            <Form.Label>Выберите юридическое лицо</Form.Label>
            <div className="d-flex justify-content-between align-items-center mb-2">
              {legalEntitiesLoading ? (
                <div className="text-center py-2 w-100">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Загрузка юридических лиц...</span>
                </div>
              ) : legalEntitiesError ? (
                <Alert variant="danger" className="py-2 w-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Ошибка загрузки юридических лиц: {legalEntitiesError}</span>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={handleRefreshLegalEntities}
                      disabled={refreshingLegalEntities}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                  </div>
                </Alert>
              ) : legalEntities.length === 0 ? (
                <Alert variant="warning" className="py-2 w-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Юридические лица не найдены. Сначала добавьте юридическое лицо.</span>
                    <Button 
                      variant="outline-warning" 
                      size="sm" 
                      onClick={handleRefreshLegalEntities}
                      disabled={refreshingLegalEntities}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                  </div>
                </Alert>
              ) : (
                <>
                  <Form.Select 
                    value={selectedLegalEntityId}
                    onChange={(e) => setSelectedLegalEntityId(e.target.value)}
                    className="me-2"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Выберите юридическое лицо</option>
                    {legalEntities.map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.title} (ИНН: {entity.inn})
                      </option>
                    ))}
                  </Form.Select>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={handleRefreshLegalEntities}
                    disabled={refreshingLegalEntities || isSubmitting}
                    title="Обновить список юридических лиц"
                  >
                    {refreshingLegalEntities ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <i className="bi bi-arrow-clockwise"></i>
                    )}
                  </Button>
                </>
              )}
            </div>
            <Form.Text className="text-muted">
              Юридическое лицо, к которому будет привязан токен Ozon
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Client ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите Client ID из личного кабинета Ozon"
              value={clientId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientId(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              Введите Client ID
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Client ID можно найти в личном кабинете Ozon в разделе API
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>API Key</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Вставьте API Key из личного кабинета Ozon"
              value={apiKey}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setApiKey(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              Введите API Key
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              API Key можно найти в личном кабинете Ozon в разделе API
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
            disabled={isSubmitting || legalEntitiesLoading || !clientId.trim() || !apiKey.trim() || !selectedLegalEntityId}
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