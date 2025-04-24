import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from '../../components/Breadcrumb';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

/**
 * Интерфейс для данных токена Wildberries
 */
interface WbToken {
  id: number;
  token: string;
  created_at: string;
  name?: string;
  is_active?: boolean;
  updated_at?: string;
  account_id?: number;
  account_title?: string;
  account_inn?: string;
  [key: string]: any;
}

/**
 * Интерфейс для данных юридического лица
 */
interface LegalEntity {
  id: string;
  title: string;
  inn: string;
}

/**
 * Компонент для отображения токенов Wildberries
 */
const Wildberries: React.FC = () => {
  const [tokens, setTokens] = useState<WbToken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Состояния для юридических лиц
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [legalEntitiesLoading, setLegalEntitiesLoading] = useState<boolean>(true);
  const [legalEntitiesError, setLegalEntitiesError] = useState<string | null>(null);
  
  // Состояния для модального окна добавления токена
  const [showAddTokenModal, setShowAddTokenModal] = useState<boolean>(false);
  const [newTokenName, setNewTokenName] = useState<string>('');
  const [newToken, setNewToken] = useState<string>('');
  const [selectedLegalEntityId, setSelectedLegalEntityId] = useState<string>('');
  const [tokenAddLoading, setTokenAddLoading] = useState<boolean>(false);
  const [tokenAddError, setTokenAddError] = useState<string | null>(null);
  const [tokenAddSuccess, setTokenAddSuccess] = useState<boolean>(false);

  // Состояния для модального окна удаления токена
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [tokenToDelete, setTokenToDelete] = useState<WbToken | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  // Состояние для отслеживания процесса обновления данных
  const [refreshing, setRefreshing] = useState(false);
  // Состояние для отслеживания обновления юридических лиц
  const [refreshingLegalEntities, setRefreshingLegalEntities] = useState(false);
  // Состояние для поиска по юридическим лицам
  const [legalEntitySearchTerm, setLegalEntitySearchTerm] = useState('');
  // Состояние для отображения сообщения о копировании ИНН токена
  const [copiedTokenInn, setCopiedTokenInn] = useState<number | null>(null);
  // Состояние для отображения сообщения о копировании ИНН юридического лица
  const [copiedInn, setCopiedInn] = useState<string | null>(null);
  // Состояние для отслеживания обновления конкретного юридического лица
  const [updatingEntityId, setUpdatingEntityId] = useState<string | null>(null);
  // Состояние для отслеживания обновления конкретного токена
  const [updatingTokenId, setUpdatingTokenId] = useState<number | null>(null);

  // Загрузка токенов и юр. лиц при монтировании компонента
  useEffect(() => {
    fetchLegalEntities().then(() => {
      fetchTokens();
    });
  }, []);

  // Функция для получения токенов
  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://62.113.44.196:8080/api/v1/wb-tokens/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Проверка и отладка данных
      console.log('Юридические лица:', legalEntities);
      console.log('Токены до обогащения:', data);

      if (Array.isArray(data)) {
        // Создаем словарь юридических лиц для быстрого доступа
        const legalEntitiesMap: Record<string, LegalEntity> = {};
        legalEntities.forEach(entity => {
          legalEntitiesMap[entity.id] = entity;
        });
        
        console.log('Карта юридических лиц:', legalEntitiesMap);

        // Обогащаем токены данными о юр. лицах
        const enrichedTokens = data.map(token => {
          const accountIp = token.account_ip?.toString();
          console.log(`Обработка токена ID=${token.id}, account_ip=${accountIp}`);
          
          // Получаем юридическое лицо из словаря по ключу
          const legalEntity = accountIp && legalEntitiesMap[accountIp] ? legalEntitiesMap[accountIp] : null;
          console.log(`Найденное юр. лицо для токена ${token.id}:`, legalEntity);
          
          return {
            ...token,
            // Добавляем данные из найденного юр. лица или используем значения по умолчанию
            account_title: legalEntity?.title || 'Не указано',
            account_inn: legalEntity?.inn || '-'
          };
        });
        
        console.log('Обогащенные токены:', enrichedTokens);
        setTokens(enrichedTokens);
        console.log('Успешно получено токенов:', enrichedTokens.length);
        enrichedTokens.forEach(token => {
          console.log('---');
          console.log('ID:', token.id);
          console.log('TOKEN:', token.token);
          console.log('Time:', token.created_at);
          console.log('Account_ip:', token.account_ip || '-');
          console.log('Account_title:', token.account_title);
          console.log('Account_inn:', token.account_inn);
        });
      } else {
        console.log('Ответ сервера не является массивом:', data);
        setError('Неверный формат данных от сервера');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при загрузке токенов');
      }
      console.error('Ошибка при запросе:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения списка юридических лиц
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

  // Форматирование даты
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Отображение сокращенного токена
  const formatToken = (token: string) => {
    if (!token) return '—';
    if (token.length <= 8) return token;
    
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
  };

  // Обработчик выбора одного токена
  const handleSelectToken = (id: number) => {
    const newSelected = new Set(selectedTokens);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTokens(newSelected);
    
    // Проверка, все ли токены выбраны
    setSelectAll(newSelected.size === tokens.length);
  };

  // Обработчик выбора всех токенов
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTokens(new Set());
    } else {
      setSelectedTokens(new Set(tokens.map(token => token.id)));
    }
    setSelectAll(!selectAll);
  };

  // Обработчик перехода на страницу заказов с выбранным токеном
  const handleViewOrders = (tokenId: number) => {
    // Здесь должен быть переход на страницу заказов с использованием выбранного токена
    navigate(`/marketplace-settings/wildberries/orders/${tokenId}`);
  };

  // Обработчик перехода на страницу всех заказов
  const handleViewAllOrders = () => {
    navigate('/marketplace-settings/wildberries/orders');
  };

  /**
   * Обработчик обновления списка токенов
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Сначала получаем актуальные данные о юр. лицах
      await fetchLegalEntities();
      // Затем на основе актуальных данных о юр. лицах обогащаем токены
      await fetchTokens();
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
      setError('Не удалось обновить данные. Пожалуйста, попробуйте еще раз.');
    } finally {
      setRefreshing(false);
    }
  };

  // Обработчик отправки формы добавления токена
  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newToken.trim()) {
      setTokenAddError('Токен не может быть пустым');
      return;
    }
    
    if (!selectedLegalEntityId) {
      setTokenAddError('Необходимо выбрать юридическое лицо');
      return;
    }
    
    setTokenAddLoading(true);
    setTokenAddError(null);
    setTokenAddSuccess(false);
    
    try {
      const url = "http://62.113.44.196:8080/api/v1/wb-tokens/";
      
      // Только для отладки в консоли
      if (newTokenName) {
        console.log('Название токена (не отправляется):', newTokenName);
      }
      
      // Отправляем токен и account_ip в числовом формате
      const data = {
        token: newToken.trim(),
        account_ip: parseInt(selectedLegalEntityId, 10) // Преобразуем в число
      };
      
      console.log('Отправляемые данные:', data);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133',
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      console.log('Статус ответа:', response.status);
      
      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await response.json();
        console.log('JSON ответ:', responseData);
      } else {
        const text = await response.text();
        console.log('Текстовый ответ:', text);
        try {
          responseData = JSON.parse(text);
        } catch (e) {
          responseData = { message: text };
        }
      }
      
      if (response.ok) {
        console.log('Токен успешно добавлен');
        setTokenAddSuccess(true);
        
        // Обновляем список юр. лиц и токенов
        await fetchLegalEntities();
        await fetchTokens();
        
        // Сбрасываем форму через 2 секунды
        setTimeout(() => {
          setNewToken('');
          setNewTokenName('');
          setSelectedLegalEntityId('');
          setTokenAddSuccess(false);
          setShowAddTokenModal(false);
        }, 2000);
      } else {
        // Обработка ошибок от API
        let errorMessage = 'Ошибка при добавлении токена';
        
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData.non_field_errors) {
            errorMessage = Array.isArray(responseData.non_field_errors) 
              ? responseData.non_field_errors.join('. ') 
              : responseData.non_field_errors;
          } else {
            // Проверяем, есть ли ошибки для конкретных полей
            const fieldErrors = [];
            for (const [field, errors] of Object.entries(responseData)) {
              if (Array.isArray(errors)) {
                fieldErrors.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                fieldErrors.push(`${field}: ${errors}`);
              }
            }
            
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('. ');
            } else {
              errorMessage = `Ошибка ${response.status}: ${JSON.stringify(responseData)}`;
            }
          }
        }
        
        setTokenAddError(errorMessage);
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
      if (error instanceof Error) {
        setTokenAddError(`Ошибка сети: ${error.message}`);
      } else {
        setTokenAddError('Неизвестная ошибка при добавлении токена');
      }
    } finally {
      setTokenAddLoading(false);
    }
  };
  
  // Сброс формы при закрытии модального окна
  const handleCloseAddTokenModal = () => {
    setShowAddTokenModal(false);
    setNewToken('');
    setNewTokenName('');
    setSelectedLegalEntityId('');
    setTokenAddError(null);
    setTokenAddSuccess(false);
  };

  // Открыть модальное окно подтверждения удаления
  const openDeleteModal = (token: WbToken) => {
    setTokenToDelete(token);
    setShowDeleteModal(true);
    setDeleteError(null);
  };
  
  // Закрыть модальное окно подтверждения удаления
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTokenToDelete(null);
    setDeleteError(null);
    setDeleteSuccess(false);
  };
  
  // Обработчик удаления токена
  const handleDeleteToken = async () => {
    if (!tokenToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      const url = `http://62.113.44.196:8080/api/v1/wb-tokens/${tokenToDelete.id}/`;
      
      console.log(`Удаление токена с ID: ${tokenToDelete.id}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });
      
      console.log('Статус ответа:', response.status);
      
      if (response.ok) {
        console.log("Удаление прошло успешно!");
        setDeleteSuccess(true);
        
        // Обновляем список токенов локально (удаляем из state)
        setTokens(prevTokens => prevTokens.filter(token => token.id !== tokenToDelete.id));
        
        // Закрываем модальное окно через 1.5 секунды
        setTimeout(() => {
          closeDeleteModal();
          // Обновляем данные из API
          fetchLegalEntities().then(() => fetchTokens());
        }, 1500);
      } else {
        const text = await response.text();
        console.error('Текст ошибки:', text);
        
        try {
          const errorData = JSON.parse(text);
          const errorMessage = errorData.detail || errorData.error || errorData.message || 
                             JSON.stringify(errorData);
          setDeleteError(errorMessage);
        } catch (e) {
          setDeleteError(`Ошибка при удалении: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Ошибка:", error);
      if (error instanceof Error) {
        setDeleteError(error.message);
      } else {
        setDeleteError('Неизвестная ошибка при удалении токена');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Обработчик обновления юридических лиц
  const handleRefreshLegalEntities = async () => {
    setRefreshingLegalEntities(true);
    try {
      await fetchLegalEntities();
    } catch (error) {
      console.error('Ошибка при обновлении юридических лиц:', error);
      setLegalEntitiesError('Не удалось обновить данные. Пожалуйста, попробуйте еще раз.');
    } finally {
      setRefreshingLegalEntities(false);
    }
  };

  // Обработчик копирования ИНН токена в буфер обмена
  const handleCopyTokenInn = (tokenId: number, inn: string) => {
    navigator.clipboard.writeText(inn);
    setCopiedTokenInn(tokenId);
    
    // Убираем сообщение через 2 секунды
    setTimeout(() => {
      setCopiedTokenInn(null);
    }, 2000);
  };

  // Обработчик копирования ИНН юридического лица в буфер обмена
  const handleCopyInn = (inn: string) => {
    navigator.clipboard.writeText(inn);
    setCopiedInn(inn);
    
    // Убираем сообщение через 2 секунды
    setTimeout(() => {
      setCopiedInn(null);
    }, 2000);
  };

  // Фильтрация юридических лиц по поисковому запросу
  const filteredLegalEntities = legalEntities.filter(entity => {
    if (!legalEntitySearchTerm.trim()) return true;
    
    const searchTerm = legalEntitySearchTerm.toLowerCase();
    return (
      entity.title.toLowerCase().includes(searchTerm) ||
      entity.inn.toLowerCase().includes(searchTerm) ||
      entity.id.toString().includes(searchTerm)
    );
  });

  // Обработчик обновления конкретного юридического лица
  const handleRefreshEntity = async (entityId: string) => {
    setUpdatingEntityId(entityId);
    try {
      const response = await fetch(`http://62.113.44.196:8080/api/v1/account-ip/${entityId}/`, {
        method: 'GET',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const updatedEntity = await response.json();
      
      // Обновляем сущность в списке
      setLegalEntities(prevEntities => 
        prevEntities.map(entity => 
          entity.id === entityId ? { ...updatedEntity } : entity
        )
      );
      
      console.log(`Успешно обновлено юридическое лицо с ID: ${entityId}`);
    } catch (error) {
      console.error(`Ошибка при обновлении юридического лица с ID ${entityId}:`, error);
      // При ошибке одного юридического лица, обновляем все для консистентности
      await fetchLegalEntities();
    } finally {
      setUpdatingEntityId(null);
    }
  };

  // Обработчик обновления конкретного токена
  const handleRefreshToken = async (tokenId: number) => {
    setUpdatingTokenId(tokenId);
    try {
      const response = await fetch(`http://62.113.44.196:8080/api/v1/wb-tokens/${tokenId}/`, {
        method: 'GET',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const updatedToken = await response.json();
      
      // Находим юридическое лицо для токена
      const accountIp = updatedToken.account_ip?.toString();
      const legalEntity = accountIp && legalEntities.find(entity => entity.id === accountIp);
      
      // Обновляем токен с данными юридического лица
      const enrichedToken = {
        ...updatedToken,
        account_title: legalEntity?.title || 'Не указано',
        account_inn: legalEntity?.inn || '-'
      };
      
      // Обновляем токен в списке
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.id === tokenId ? enrichedToken : token
        )
      );
      
      console.log(`Успешно обновлен токен с ID: ${tokenId}`);
    } catch (error) {
      console.error(`Ошибка при обновлении токена с ID ${tokenId}:`, error);
      // При ошибке обновления одного токена, обновляем все для консистентности
      await fetchLegalEntities().then(() => fetchTokens());
    } finally {
      setUpdatingTokenId(null);
    }
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Настройки маркетплейсов', path: '/marketplace-settings' },
          { label: 'Wildberries', active: true }
        ]}
      />

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Токены Wildberries</h1>
            <Button 
              variant="primary" 
              onClick={handleViewAllOrders}
            >
              <i className="bi bi-list-ul me-1"></i> Все заказы
            </Button>
          </div>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Ошибка!</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
          
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Токены API</h5>
              <div className="d-flex align-items-center gap-3">
                {refreshing && <Spinner animation="border" size="sm" />}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  title="Обновить данные"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  {refreshing ? 'Обновление...' : 'Обновить'}
                </Button>
                {!loading && (
                  <span className="text-muted">Всего токенов: {tokens.length}</span>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" />
                  <p className="mt-2">Загрузка токенов...</p>
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mt-3">Токены не найдены</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddTokenModal(true)}
                  >
                    Добавить токен
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <Form.Check
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            aria-label="Выбрать все токены"
                          />
                        </th>
                        <th>ID</th>
                        <th>TOKEN</th>
                        <th>Time</th>
                        <th>Account_id</th>
                        <th>Account_title</th>
                        <th>Account_inn</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((token) => (
                        <tr key={token.id}>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={selectedTokens.has(token.id)}
                              onChange={() => handleSelectToken(token.id)}
                              aria-label={`Выбрать токен ${token.id}`}
                            />
                          </td>
                          <td>{token.id}</td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '300px' }}>
                              {token.token}
                            </div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0" 
                              onClick={() => {
                                navigator.clipboard.writeText(token.token);
                                alert('Токен скопирован в буфер обмена');
                              }}
                            >
                              Копировать
                            </Button>
                          </td>
                          <td>{token.created_at || '-'}</td>
                          <td>{token.account_ip || '-'}</td>
                          <td>
                            {updatingTokenId === token.id ? (
                              <div className="d-flex align-items-center">
                                <Spinner animation="border" size="sm" className="me-2" />
                                <span>Обновление...</span>
                              </div>
                            ) : (
                              token.account_title || 'Не указано'
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {token.account_inn || '-'}
                              {token.account_inn && token.account_inn !== '-' && (
                                <>
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 ms-2" 
                                    onClick={() => handleCopyTokenInn(token.id, token.account_inn as string)}
                                  >
                                    <i className="bi bi-clipboard"></i>
                                  </Button>
                                  {copiedTokenInn === token.id && (
                                    <span className="text-success ms-1 small">
                                      <i className="bi bi-check-lg"></i>
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => openDeleteModal(token)}
                                title="Удалить токен"
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                              <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => handleRefreshToken(token.id)}
                                disabled={updatingTokenId === token.id}
                                title="Обновить информацию о токене"
                              >
                                {updatingTokenId === token.id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <i className="bi bi-arrow-clockwise"></i>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
            <Card.Footer>
              <Button 
                variant="primary" 
                onClick={() => setShowAddTokenModal(true)}
              >
                <i className="bi bi-plus-circle me-1"></i> Добавить токен
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>


      {/* Модальное окно добавления токена */}
      <Modal 
        show={showAddTokenModal} 
        onHide={handleCloseAddTokenModal}
        backdrop="static"
        centered
        contentClassName="bg-dark text-light border border-secondary"
      >
        <Modal.Header closeButton className="border-secondary">
          <Modal.Title>Добавление токена Wildberries</Modal.Title>
        </Modal.Header>
        <Modal.Body className="border-secondary">
          {tokenAddSuccess && (
            <Alert variant="success" className="mb-3">
              <Alert.Heading>Успешно!</Alert.Heading>
              <p>Токен был успешно добавлен. Окно будет закрыто автоматически.</p>
            </Alert>
          )}
          
          {tokenAddError && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setTokenAddError(null)}>
              <Alert.Heading>Ошибка!</Alert.Heading>
              <p>{tokenAddError}</p>
            </Alert>
          )}
          
          <Form onSubmit={handleAddToken}>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Выберите юридическое лицо</Form.Label>
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
                        variant="outline-light" 
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
                      className="bg-dark text-light border-secondary me-2"
                      required
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
                      disabled={refreshingLegalEntities}
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
                Юридическое лицо, к которому будет привязан токен
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Название токена</Form.Label>
              <Form.Control
                type="text"
                placeholder="Например: Основной токен"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="bg-dark text-light border-secondary"
              />
              <Form.Text className="text-muted">
                Не обязательное поле. Помогает идентифицировать токен.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="text-light">API-токен Wildberries</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Вставьте API-токен Wildberries"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                required
                className="bg-dark text-light border-secondary"
              />
              <Form.Text className="text-muted">
                Токен можно получить в личном кабинете Wildberries.
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handleCloseAddTokenModal}
              >
                Отмена
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={tokenAddLoading || !newToken.trim() || legalEntitiesLoading || !selectedLegalEntityId}
              >
                {tokenAddLoading ? (
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
                ) : (
                  'Добавить токен'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Модальное окно подтверждения удаления токена */}
      <Modal 
        show={showDeleteModal} 
        onHide={closeDeleteModal}
        backdrop="static"
        centered
        contentClassName="bg-dark text-light border border-danger"
      >
        <Modal.Header closeButton className="border-secondary">
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Удаление токена
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteSuccess ? (
            <Alert variant="success" className="mb-0">
              <Alert.Heading>Успешно!</Alert.Heading>
              <p>Токен был успешно удален.</p>
            </Alert>
          ) : (
            <>
              {deleteError && (
                <Alert variant="danger" className="mb-3" dismissible onClose={() => setDeleteError(null)}>
                  <Alert.Heading>Ошибка!</Alert.Heading>
                  <p>{deleteError}</p>
                </Alert>
              )}
              
              <p>Вы действительно хотите удалить токен{tokenToDelete?.name ? ` "${tokenToDelete.name}"` : ''}?</p>
              
              <div className="bg-secondary p-3 rounded mb-3">
                <p className="mb-1"><strong>ID:</strong> {tokenToDelete?.id}</p>
                <p className="mb-1"><strong>Токен:</strong> {tokenToDelete?.token ? formatToken(tokenToDelete.token) : ''}</p>
                <p className="mb-0"><strong>Создан:</strong> {tokenToDelete?.created_at ? formatDate(tokenToDelete.created_at) : ''}</p>
              </div>
              
              <p className="text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Это действие невозможно отменить. Удаленный токен не подлежит восстановлению.
              </p>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer className="border-secondary">
          {!deleteSuccess && (
            <>
              <Button 
                variant="outline-secondary" 
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Отмена
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteToken}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
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
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Удалить токен
                  </>
                )}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Wildberries;