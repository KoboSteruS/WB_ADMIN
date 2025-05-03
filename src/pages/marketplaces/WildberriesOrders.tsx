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
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

// Импортируем типы
import { WbOrder, LegalEntity, WildberriesOrdersProps } from '../../types/wildberries';

// Импортируем компоненты
import OrderStatusBadge from '../../components/wildberries/OrderStatusBadge';

// Импортируем утилиты
import { formatDate, formatPrice, getStatusButtonText, isBase64Image, getImageSrcFromBase64 } from '../../utils/orderUtils';
import { getBadgeColor, getStatusText } from '../../utils/statusHelpers';

// Импортируем API сервис
import { fetchWbOrders, changeOrderStatus, addWbToken, requestShipping } from '../../services/wildberriesApi';

// Импортируем сервис генерации PDF
import { 
  generateOrdersPDF, 
  generateArticlesSummaryPDF, 
  generateOrdersListPDF, 
  generateStickersPDF 
} from '../../services/pdfGenerationService';

// Импортируем хук выбора заказов
import { useOrderSelection } from '../../hooks/useOrderSelection';

// Импортируем функции для PDF с поддержкой кириллицы
import { 
  createPDFWithCyrillicSupport, 
  addTextToPDF, 
  addTitleToPDF, 
  addTableToPDF, 
  loadAndCacheFont,
  // Импортируем для возможного использования в будущем
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createCyrillicPDF,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addCyrillicText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addCyrillicTitle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addCyrillicTable
} from '../../utils/pdfUtils';

/**
 * Компонент для отображения заказов Wildberries
 */
export const WildberriesOrders: React.FC<WildberriesOrdersProps> = ({ token }) => {
  const navigate = useNavigate();
  
  // Состояния для данных
  const [orders, setOrders] = useState<WbOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTestData, setShowTestData] = useState<boolean>(false);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [showRawResponse, setShowRawResponse] = useState<boolean>(false);
  
  // Состояния для операций со статусами
  const [statusChangeLoading, setStatusChangeLoading] = useState<boolean>(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);
  const [statusChangeSuccess, setStatusChangeSuccess] = useState<boolean>(false);
  
  // Состояния для модального окна добавления токена
  const [showAddTokenModal, setShowAddTokenModal] = useState<boolean>(false);
  const [newTokenName, setNewTokenName] = useState<string>('');
  const [newToken, setNewToken] = useState<string>('');
  const [tokenAddLoading, setTokenAddLoading] = useState<boolean>(false);
  const [tokenAddError, setTokenAddError] = useState<string | null>(null);
  const [tokenAddSuccess, setTokenAddSuccess] = useState<boolean>(false);
  
  // Данные о выбранном юридическом лице
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<LegalEntity | null>(null);
  
  // Тестовые данные для таблицы
  const testOrders: WbOrder[] = [
    {
      id: 1,
      address: null,
      ddate: null,
      sale_price: 66300.00,
      required_meta: [],
      delivery_type: 'fbs',
      comment: '',
      scan_price: null,
      order_uid: '12908181_7068212498275133801',
      article: 'PURE Testobuster 120 capsul',
      color_code: '',
      rid: '7068212498275133801.0.0',
      created_at: '2025-04-23T09:40:34+03:00',
      offices: ['Москва_Восток'],
      skus: ['2039371154416'],
      order_id: 3266581928,
      warehouse_id: 881268,
      nm_id: 203084307,
      chrt_id: 327271177,
      price: 59600.00,
      converted_price: 59600.00,
      currency_code: 643,
      converted_currency_code: 643,
      cargo_type: 1,
      is_zero_order: false,
      options: {isB2B: false},
      wb_token: 1,
      supply_id: 'WB-GI-153618984',
      wb_status: 'ready_to_shipment',
      own_status: 'ready_to_shipment'
    },
    {
      id: 2,
      address: null,
      ddate: null,
      sale_price: 55000.00,
      required_meta: [],
      delivery_type: 'fbs',
      comment: '',
      scan_price: null,
      order_uid: '12908182_7068212498275133802',
      article: 'PURE Testobuster 60 capsul',
      color_code: '',
      rid: '7068212498275133802.0.0',
      created_at: '2025-04-23T10:45:22+03:00',
      offices: ['Москва_Запад'],
      skus: ['2039371154417'],
      order_id: 3266581929,
      warehouse_id: 881268,
      nm_id: 203084308,
      chrt_id: 327271178,
      price: 45000.00,
      converted_price: 45000.00,
      currency_code: 643,
      converted_currency_code: 643,
      cargo_type: 1,
      is_zero_order: false,
      options: {isB2B: false},
      wb_token: 1,
      supply_id: 'WB-GI-153618985',
      wb_status: 'ready_to_shipment',
      own_status: 'ready_to_shipment'
    }
  ];

  // Определяем, какие данные отображать - тестовые или из API
  const displayOrders = showTestData ? testOrders : orders;
  
  // Используем хук для работы с выбранными заказами
  const { 
    selectedOrders, 
    selectAll, 
    handleSelectOrder, 
    handleSelectAll, 
    getSelectedOrdersStatus,
    getNextOrdersStatus,
    getSelectedOrdersData,
    selectionCount
  } = useOrderSelection(displayOrders);

  // Загрузка данных о юр. лице из localStorage при монтировании компонента
  useEffect(() => {
    // Получаем ID и данные юр. лица из localStorage
    const legalEntityIdFromStorage = localStorage.getItem('selectedLegalEntityId');
    const legalEntityDataFromStorage = localStorage.getItem('selectedLegalEntityData');
    
    if (legalEntityDataFromStorage) {
      try {
        const parsedData = JSON.parse(legalEntityDataFromStorage);
        setSelectedLegalEntity(parsedData);
      } catch (e) {
        console.error('Ошибка при парсинге данных юр. лица:', e);
      }
    }
  }, []);

  // Загрузка заказов при монтировании компонента
  useEffect(() => {
    if (!showTestData) {
      fetchWildberriesOrders();
    } else {
      setLoading(false);
      setError(null);
    }
  }, [showTestData, selectedLegalEntity]);

  // Предварительно загружаем шрифт для PDF при монтировании компонента
  useEffect(() => {
    // Инициализируем загрузку шрифта для будущего использования
    loadAndCacheFont()
      .then(() => console.log('Шрифт для PDF успешно предзагружен'))
      .catch(err => console.error('Ошибка при предзагрузке шрифта для PDF:', err));
  }, []);

  // Функция для получения заказов
  const fetchWildberriesOrders = async () => {
    setLoading(true);
    setError(null);
    setRawResponse('');
    
    // Если нет выбранного юр. лица и не показываем тестовые данные, выводим предупреждение
    if (!selectedLegalEntity && !showTestData) {
      setError('Не выбрано юридическое лицо');
      setLoading(false);
      return;
    }
    
    console.log('Отправка запроса на получение заказов...');
    console.log('Юридическое лицо:', selectedLegalEntity?.title);
    
    try {
      // Получаем заказы через API-сервис
      const ordersData = await fetchWbOrders(selectedLegalEntity?.id);
      setOrders(ordersData);
      console.log('Успешно получено заказов:', ordersData.length);
    } catch (err) {
      console.error('❌ Ошибка при запросе:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла неизвестная ошибка при загрузке заказов');
      }
    } finally {
      setLoading(false);
    }
  };

  // Переключение между реальными и тестовыми данными
  const toggleDataSource = () => {
    setShowTestData(!showTestData);
  };

  // Переключатель для отображения сырого ответа
  const toggleRawResponse = () => {
    setShowRawResponse(!showRawResponse);
  };

  // Обработчик открытия модального окна с защитой от перехода
  const handleOpenAddToken = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Открываем модальное окно...");
    setShowAddTokenModal(true);
  };

  // Сброс формы при закрытии модального окна
  const handleCloseAddTokenModal = () => {
    console.log("Закрываем модальное окно");
    setShowAddTokenModal(false);
    setNewToken('');
    setNewTokenName('');
    setTokenAddError(null);
    setTokenAddSuccess(false);
  };

  // Обработчик отправки формы добавления токена
  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newToken.trim()) {
      setTokenAddError('Токен не может быть пустым');
      return;
    }
    
    setTokenAddLoading(true);
    setTokenAddError(null);
    setTokenAddSuccess(false);
    
    try {
      await addWbToken({
        token: newToken.trim(),
        name: newTokenName.trim() || undefined
      });
      
        console.log('Токен успешно добавлен');
        setTokenAddSuccess(true);
      
        // Сбрасываем форму через 2 секунды
        setTimeout(() => {
          setNewToken('');
          setNewTokenName('');
          setTokenAddSuccess(false);
          setShowAddTokenModal(false);
        }, 2000);
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
      if (error instanceof Error) {
        setTokenAddError(error.message);
      } else {
        setTokenAddError('Неизвестная ошибка при добавлении токена');
      }
    } finally {
      setTokenAddLoading(false);
    }
  };

  /**
   * Обработчик смены статуса заказов
   */
  const handleChangeOrderStatus = async () => {
    if (selectionCount === 0) {
      setStatusChangeError('Выберите хотя бы один заказ');
      return;
    }

    // Определяем текущий статус выбранных заказов
    const currentStatus = getSelectedOrdersStatus();
    // Определяем следующий статус
    const nextStatus = getNextOrdersStatus();

    setStatusChangeLoading(true);
    setStatusChangeError(null);
    setStatusChangeSuccess(false);

    try {
      // Получаем ID заказов
      const orderIds = Array.from(selectedOrders).map(orderId => {
        const order = displayOrders.find(o => 
          (o.id || o.order_id) === orderId
        );
        return order?.order_id || orderId;
      });

      // Отправляем запрос на изменение статуса через API-сервис
      await changeOrderStatus({
            orders: orderIds,
            status: nextStatus
      });

        setStatusChangeSuccess(true);
        
        // Если переходим в статус "assembly", скачиваем PDF-файлы
        if (nextStatus === 'assembly') {
        downloadOrderPDFs();
        }
        
        // Обновляем данные заказов
        setTimeout(() => {
        fetchWildberriesOrders();
        }, 1500);
    } catch (error) {
      console.error('Ошибка запроса:', error);
      setStatusChangeError('Произошла ошибка при отправке запроса');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  /**
   * Скачивание PDF-файлов с данными заказов
   */
  const downloadOrderPDFs = () => {
    const selectedOrdersData = getSelectedOrdersData();
    
    if (selectedOrdersData.length === 0) {
      alert('Выберите хотя бы один заказ');
      return;
    }
    
    // Сортируем выбранные заказы по nm_id для единообразия
    const sortedByNmId = [...selectedOrdersData].sort((a, b) => {
      const nmIdA = a.nm_id?.toString().toLowerCase() || '';
      const nmIdB = b.nm_id?.toString().toLowerCase() || '';
      return nmIdA.localeCompare(nmIdB);
    });
    
    // Генерируем PDF с выбранными заказами через сервис
    generateOrdersPDF(sortedByNmId, selectedLegalEntity || undefined);
  };

  /**
   * Обработчик запроса на доставку
   */
  const handleShippingRequest = async () => {
    if (selectionCount === 0) {
      alert('Выберите хотя бы один заказ для запроса на доставку');
      return;
    }

    // Получаем выбранные заказы
    const selectedOrdersData = getSelectedOrdersData();
    
    if (selectedOrdersData.length === 0) {
      alert('Не удалось получить данные выбранных заказов');
      return;
    }
    
    // Проверяем наличие supply_id в заказах
    const ordersWithSupplyId = selectedOrdersData.filter(order => order.supply_id);
    if (ordersWithSupplyId.length === 0) {
      alert('У выбранных заказов отсутствует идентификатор поставки (supply_id)');
      return;
    }
    
    // Получаем уникальные идентификаторы поставок
    const supplyIdMap: {[key: string]: boolean} = {};
    ordersWithSupplyId.forEach(order => {
      if (order.supply_id) {
        supplyIdMap[order.supply_id] = true;
      }
    });
    const supplyIds = Object.keys(supplyIdMap);
    
    // Получаем wb_token_id из первого заказа (предполагаем, что все заказы имеют одинаковый токен)
    const wb_token_id = ordersWithSupplyId[0].wb_token || 1;
    
    try {
      // Показываем индикатор загрузки
      setStatusChangeLoading(true);
      
      // Отправляем запрос через API-сервис
      await requestShipping(supplyIds, wb_token_id);
      
        setStatusChangeSuccess(true);
        alert(`Запрос на доставку успешно отправлен для ${supplyIds.length} поставок`);
        
        // Обновляем данные заказов
        setTimeout(() => {
        fetchWildberriesOrders();
        }, 1500);
    } catch (error) {
      console.error('Ошибка запроса:', error);
      alert(`Произошла ошибка при отправке запроса: ${error instanceof Error ? error.message : String(error)}`);
      setStatusChangeError('Произошла ошибка при отправке запроса');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  return (
    <Container fluid className="py-3">
      <Breadcrumb
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Настройки маркетплейсов', path: '/marketplace-settings' },
          { label: 'Wildberries', path: '/marketplace-settings/wildberries' },
          { label: 'Заказы', active: true }
        ]}
      />

      <Row className="mb-4">
        <Col>
          <div className="mb-4">
            <div className="mb-3">
              <h1 className="h3 mb-0">Заказы Wildberries</h1>
              {selectedLegalEntity && (
                <p className="text-muted mb-0">
                  Юридическое лицо: <strong>{selectedLegalEntity.title}</strong> (ИНН: {selectedLegalEntity.inn})
                </p>
              )}
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleChangeOrderStatus}
                disabled={selectionCount === 0 || statusChangeLoading}
              >
                {statusChangeLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    {getStatusButtonText(getSelectedOrdersStatus())} ({selectionCount})
                  </>
                )}
              </Button>
              
              {getSelectedOrdersStatus() === 'ready_to_shipment' && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleShippingRequest}
                  disabled={selectionCount === 0 || statusChangeLoading}
                >
                  {statusChangeLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Отправка запроса...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-truck me-2"></i>
                      Запрос на доставку ({selectionCount})
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="outline-primary" 
                size="sm" 
                onClick={showTestData ? toggleDataSource : fetchWildberriesOrders}
              >
                <i className="bi bi-arrow-repeat"></i> {showTestData ? "Показать реальные данные" : "Обновить"}
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                onClick={downloadOrderPDFs}
                disabled={selectionCount === 0}
                className="me-2"
              >
                <i className="bi bi-file-pdf me-1"></i> Скачать PDF
              </Button>
              <Button 
                variant="primary"
                onClick={handleOpenAddToken}
                type="button"
                className="mx-2"
              >
                <i className="bi bi-plus-circle"></i> Добавить токен
              </Button>
              <Button 
                variant={showRawResponse ? "info" : "outline-info"}
                onClick={toggleRawResponse}
                className="me-2"  
              >
                <i className="bi bi-braces"></i> {showRawResponse ? "Скрыть ответ API" : "Показать ответ API"}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(-1)}
              >
                Назад
              </Button>
            </div>
          </div>
          
          {error && !showTestData && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Ошибка!</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
          
          {statusChangeError && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {statusChangeError}
            </Alert>
          )}
          
          {statusChangeSuccess && (
            <Alert variant="success" className="mb-3">
              <i className="bi bi-check-circle me-2"></i>
              Статус заказов успешно изменен
            </Alert>
          )}
          
          {showRawResponse && rawResponse && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Сырой ответ API</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="bg-dark text-light p-3" style={{ overflow: 'auto', maxHeight: '300px' }}>
                  <pre>{rawResponse}</pre>
                </div>
              </Card.Body>
            </Card>
          )}
          
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Список заказов</h5>
              <div>
                <span className="text-muted">
                  {showTestData 
                    ? `Тестовые данные: ${testOrders.length} заказов` 
                    : `Всего заказов: ${orders.length}`}
                </span>
              </div>
            </Card.Header>
            <Card.Body>
              {loading && !showTestData ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Загрузка заказов...</p>
                </div>
              ) : displayOrders.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mt-3">Заказы не найдены</p>
                  {!showTestData && (
                    <Button 
                      variant="primary" 
                      onClick={() => setShowTestData(true)} 
                      className="mb-3"
                    >
                      Показать тестовые данные
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered striped>
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            aria-label="Выбрать все заказы"
                          />
                        </th>
                        <th>ID заказа</th>
                        <th>Дата создания</th>
                        <th>Order UID</th>
                        <th>Название</th>
                        <th>Артикул</th>
                        <th>Статус WB</th>
                        <th>Собственный статус</th>
                        <th>Штрихкоды</th>
                        <th>Цена продажи</th>
                        <th>Цена закупки</th>
                        <th>Офисы</th>
                        <th>Тип доставки</th>
                        <th>Warehouse ID</th>
                        <th>Cargo Type</th>
                        <th>RID</th>
                        <th>CHRT ID</th>
                        <th>B2B</th>
                        <th>Токен WB</th>
                        <th>Идентификатор поставки</th>
                        <th>Комментарий</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayOrders.map((order, index) => (
                        <tr key={order.id || order.order_id || index}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedOrders.has(order.id || order.order_id || index)}
                              onChange={() => handleSelectOrder(order.id || order.order_id || index)}
                              aria-label={`Выбрать заказ ${order.id || order.order_id || index}`}
                            />
                          </td>
                          <td>{order.order_id || '—'}</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>{order.order_uid || '—'}</td>
                          <td>{order.article || '—'}</td>
                          <td>{order.nm_id || '—'}</td>
                          <td>
                            <Badge bg={getBadgeColor(order.wb_status)}>
                              {getStatusText(order.wb_status)}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={getBadgeColor(order.own_status)}>
                              {getStatusText(order.own_status)}
                            </Badge>
                          </td>
                          <td>
                            {order.skus && order.skus.length > 0 
                              ? order.skus.join(', ') 
                              : '—'}
                          </td>
                          <td>{formatPrice(order.sale_price)}</td>
                          <td>{formatPrice(order.price)}</td>
                          <td>
                            {order.offices && order.offices.length > 0 
                              ? order.offices.join(', ') 
                              : '—'}
                          </td>
                          <td>
                            {order.delivery_type 
                              ? <Badge bg="primary">{typeof order.delivery_type === 'string' ? order.delivery_type.toUpperCase() : order.delivery_type}</Badge>
                              : '—'}
                          </td>
                          <td>{order.warehouse_id || '—'}</td>
                          <td>{order.cargo_type || '—'}</td>
                          <td>{order.rid || '—'}</td>
                          <td>{order.chrt_id || '—'}</td>
                          <td>{order.options?.isB2B ? 'Да' : 'Нет'}</td>
                          <td>{order.wb_token || '—'}</td>
                          <td>
                            {order.supply_id 
                              ? <Badge bg="info">{order.supply_id}</Badge>
                              : '—'
                            }
                          </td>
                          <td>{order.comment || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Модальное окно добавления токена */}
      <Modal show={showAddTokenModal} onHide={handleCloseAddTokenModal}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление токена Wildberries</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                    <Form.Label>API-токен Wildberries</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Вставьте API-токен Wildberries"
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      required
                    />
                    <Form.Text className="text-muted">
                      Токен можно получить в личном кабинете Wildberries.
                    </Form.Text>
                  </Form.Group>
                  
            <Form.Group className="mb-3">
              <Form.Label>Название токена (опционально)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите название для токена"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handleCloseAddTokenModal}>
                      Отмена
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={tokenAddLoading || !newToken.trim()}
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
    </Container>
  );
};

export default WildberriesOrders;