import React, { useEffect, useState, ReactNode } from 'react';
import { Container, Row, Col, Alert, Table, Button, Card } from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';

// Импорт компонентов и хуков для работы с заказами маркетплейсов
import { WbOrder } from '../types/wildberries';
import { OzonOrder } from '../types/ozon';
import { YandexMarketOrder } from '../types/yandexmarket';
import { 
  fetchWbOrders, 
  changeOrderStatus as changeWbOrderStatus, 
  addWbToken, 
  requestShipping,
  addToSupply
} from '../services/wildberriesApi';
import { 
  fetchOzonOrders, 
  changeOrderStatus as changeOzonOrderStatus, 
  addOzonToken 
} from '../services/ozonApi';
import { 
  fetchYandexMarketOrders, 
  changeOrderStatus as changeYandexOrderStatus, 
  addYandexMarketToken 
} from '../services/yandexMarketApi';
import { formatDate, formatPrice } from '../utils/orderUtils';
import { getBadgeColor, getStatusText } from '../utils/statusHelpers';

// Импортируем сервис генерации PDF
import { 
  generateOrdersPDF, 
  generateArticlesSummaryPDF, 
  generateOrdersListPDF, 
  generateStickersPDF,
  generateSupplyBarcodePDF
} from '../services/pdfGenerationService';

// Импортируем сервис генерации Excel
import { generateArticlesSummaryExcel } from '../services/excelGenerationService';

/**
 * Интерфейс для юридического лица
 */
interface LegalEntity {
  id: string;
  title: string;
  inn: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для работы с заказами маркетплейсов
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<LegalEntity | null>(null);
  
  // Состояния для Wildberries
  const [wbOrders, setWbOrders] = useState<WbOrder[]>([]);
  const [wbOrdersLoading, setWbOrdersLoading] = useState<boolean>(false);
  const [wbOrdersError, setWbOrdersError] = useState<string | null>(null);
  const [selectedWbOrders, setSelectedWbOrders] = useState<Set<number | string>>(new Set());
  const [selectAllWb, setSelectAllWb] = useState<boolean>(false);
  const [wbSortColumn, setWbSortColumn] = useState<string | null>(null);
  const [wbSortDirection, setWbSortDirection] = useState<'asc' | 'desc'>('asc');
  const [wbCurrentPage, setWbCurrentPage] = useState<number>(1);
  const [wbItemsPerPage] = useState<number>(25);
  const [wbStatusConfirm, setWbStatusConfirm] = useState<boolean>(false);
  
  // Состояния для Ozon
  const [ozonOrders, setOzonOrders] = useState<OzonOrder[]>([]);
  const [ozonOrdersLoading, setOzonOrdersLoading] = useState<boolean>(false);
  const [ozonOrdersError, setOzonOrdersError] = useState<string | null>(null);
  const [selectedOzonOrders, setSelectedOzonOrders] = useState<Set<number | string>>(new Set());
  const [selectAllOzon, setSelectAllOzon] = useState<boolean>(false);
  const [ozonSortColumn, setOzonSortColumn] = useState<string | null>(null);
  const [ozonSortDirection, setOzonSortDirection] = useState<'asc' | 'desc'>('asc');
  const [ozonCurrentPage, setOzonCurrentPage] = useState<number>(1);
  const [ozonItemsPerPage] = useState<number>(25);
  
  // Состояния для Yandex Market
  const [ymOrders, setYmOrders] = useState<YandexMarketOrder[]>([]);
  const [ymOrdersLoading, setYmOrdersLoading] = useState<boolean>(false);
  const [ymOrdersError, setYmOrdersError] = useState<string | null>(null);
  const [selectedYmOrders, setSelectedYmOrders] = useState<Set<number | string>>(new Set());
  const [selectAllYm, setSelectAllYm] = useState<boolean>(false);
  const [ymSortColumn, setYmSortColumn] = useState<string | null>(null);
  const [ymSortDirection, setYmSortDirection] = useState<'asc' | 'desc'>('asc');
  const [ymCurrentPage, setYmCurrentPage] = useState<number>(1);
  const [ymItemsPerPage] = useState<number>(25);

  // Состояния для обработки статусов
  const [statusChangeLoading, setStatusChangeLoading] = useState<boolean>(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);
  const [statusChangeSuccess, setStatusChangeSuccess] = useState<boolean>(false);

  // Состояние для отображения только выбранного юридического лица
  const [showAllLegalEntities, setShowAllLegalEntities] = useState<boolean>(true);

  // Добавляем состояния для фильтрации по статусам
  const [wbStatusFilter, setWbStatusFilter] = useState<string | null>(null);
  const [ozonStatusFilter, setOzonStatusFilter] = useState<string | null>(null);
  const [ymStatusFilter, setYmStatusFilter] = useState<string | null>(null);

  // Добавляем состояние для фильтра по статусу WB
  const [wbStatusWbFilter, setWbStatusWbFilter] = useState<string | null>(null);

  /**
   * Загрузка списка юридических лиц с сервера
   */
  const fetchLegalEntities = async () => {
    try {
      setLoading(true);
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
      } else {
        setError('Получен неожиданный формат данных');
      }
    } catch (error: any) {
      setError(`Ошибка при загрузке данных: ${error.message}`);
      console.error('Ошибка при запросе:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchLegalEntities();
  }, []);

  /**
   * Загрузка заказов Wildberries для выбранного юр. лица
   */
  const loadWildberriesOrders = async (entity: LegalEntity, statusWbConfirm: boolean = false) => {
    if (!entity || !entity.id) return;
    
    setWbOrdersLoading(true);
    setWbOrdersError(null);
    setSelectedLegalEntity(entity);
    setWbStatusConfirm(statusWbConfirm);
    
    try {
      const ordersData = await fetchWbOrders(entity.id, statusWbConfirm);
      setWbOrders(ordersData);
    } catch (error) {
      console.error('Ошибка при загрузке заказов Wildberries:', error);
      if (error instanceof Error) {
        setWbOrdersError(error.message);
      } else {
        setWbOrdersError('Произошла неизвестная ошибка при загрузке заказов');
      }
    } finally {
      setWbOrdersLoading(false);
    }
  };
  
  /**
   * Загрузка заказов Ozon для выбранного юр. лица
   */
  const loadOzonOrders = async (entity: LegalEntity) => {
    if (!entity || !entity.id) return;
    
    setOzonOrdersLoading(true);
    setOzonOrdersError(null);
    setSelectedLegalEntity(entity);
    
    try {
      const ordersData = await fetchOzonOrders(entity.id);
      setOzonOrders(ordersData);
    } catch (error) {
      console.error('Ошибка при загрузке заказов Ozon:', error);
      if (error instanceof Error) {
        setOzonOrdersError(error.message);
      } else {
        setOzonOrdersError('Произошла неизвестная ошибка при загрузке заказов');
      }
    } finally {
      setOzonOrdersLoading(false);
    }
  };
  
  /**
   * Загрузка заказов Yandex Market для выбранного юр. лица
   */
  const loadYandexMarketOrders = async (entity: LegalEntity) => {
    if (!entity || !entity.id) return;
    
    setYmOrdersLoading(true);
    setYmOrdersError(null);
    setSelectedLegalEntity(entity);
    
    try {
      const ordersData = await fetchYandexMarketOrders(entity.id);
      setYmOrders(ordersData);
    } catch (error) {
      console.error('Ошибка при загрузке заказов Яндекс Маркет:', error);
      if (error instanceof Error) {
        setYmOrdersError(error.message);
      } else {
        setYmOrdersError('Произошла неизвестная ошибка при загрузке заказов');
      }
    } finally {
      setYmOrdersLoading(false);
    }
  };

  /**
   * Обработчик выбора маркетплейса для юр. лица
   */
  const handleSelectMarketplace = (marketplace: string, entity: LegalEntity) => {
    // Сбрасываем пагинацию при загрузке нового маркетплейса
    setWbCurrentPage(1);
    setOzonCurrentPage(1);
    setYmCurrentPage(1);
    
    // Сохраняем ID и данные юр. лица в localStorage для использования в других компонентах
    localStorage.setItem('selectedLegalEntityId', entity.id);
    localStorage.setItem('selectedLegalEntityData', JSON.stringify(entity));
    
    // Устанавливаем выбранный маркетплейс
    setSelectedMarketplace(marketplace);
    
    // Скрываем остальные юридические лица
    setShowAllLegalEntities(false);
    
    // Загружаем заказы выбранного маркетплейса
    if (marketplace === 'wildberries') {
      loadWildberriesOrders(entity);
    } else if (marketplace === 'ozon') {
      loadOzonOrders(entity);
    } else if (marketplace === 'yandex-market') {
      loadYandexMarketOrders(entity);
    }
  };

  /**
   * Обработчики выбора заказов Wildberries
   */
  const handleSelectWbOrder = (orderId: number | string) => {
    setSelectedWbOrders(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(orderId)) {
        newSelected.delete(orderId);
      } else {
        newSelected.add(orderId);
      }
      return newSelected;
    });
  };

  const handleSelectAllWb = () => {
    if (selectAllWb) {
      setSelectedWbOrders(new Set());
    } else {
      const currentPageOrders = getCurrentPageWbOrders();
      const allOrderIds = currentPageOrders.map(order => order.id || order.order_id || '');
      setSelectedWbOrders(new Set(allOrderIds));
    }
    setSelectAllWb(!selectAllWb);
  };
  
  /**
   * Обработчики выбора заказов Ozon
   */
  const handleSelectOzonOrder = (orderId: number | string) => {
    setSelectedOzonOrders(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(orderId)) {
        newSelected.delete(orderId);
      } else {
        newSelected.add(orderId);
      }
      return newSelected;
    });
  };

  const handleSelectAllOzon = () => {
    if (selectAllOzon) {
      setSelectedOzonOrders(new Set());
    } else {
      const currentPageOrders = getCurrentPageOzonOrders();
      const allOrderIds = currentPageOrders.map(order => order.id || order.order_id || '');
      setSelectedOzonOrders(new Set(allOrderIds));
    }
    setSelectAllOzon(!selectAllOzon);
  };
  
  /**
   * Обработчики выбора заказов Яндекс Маркет
   */
  const handleSelectYmOrder = (orderId: number | string) => {
    setSelectedYmOrders(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(orderId)) {
        newSelected.delete(orderId);
      } else {
        newSelected.add(orderId);
      }
      return newSelected;
    });
  };

  const handleSelectAllYm = () => {
    if (selectAllYm) {
      setSelectedYmOrders(new Set());
    } else {
      const currentPageOrders = getCurrentPageYmOrders();
      const allOrderIds = currentPageOrders.map(order => order.id || order.order_id || '');
      setSelectedYmOrders(new Set(allOrderIds));
    }
    setSelectAllYm(!selectAllYm);
  };

  /**
   * Переход на страницу юридических лиц для их редактирования
   */
  const handleManageLegalEntities = () => {
    navigate('/legal-entities');
  };

  /**
   * Очистка выбранного маркетплейса и возврат к полному списку юр. лиц
   */
  const handleClearSelectedMarketplace = () => {
    setSelectedMarketplace(null);
    setSelectedWbOrders(new Set());
    setSelectAllWb(false);
    setSelectedOzonOrders(new Set());
    setSelectAllOzon(false);
    setSelectedYmOrders(new Set());
    setSelectAllYm(false);
    
    // Показываем все юридические лица
    setShowAllLegalEntities(true);
  };

  /**
   * Получает следующий статус для заказов Wildberries
   */
  const getNextWbStatus = (currentStatus: string): string => {
    const status = currentStatus.toLowerCase();
    
    // Никогда не возвращаемся к статусу "new"
    switch (status) {
      case 'new':
        return 'assembly';
      case 'assembly':
        return 'ready_to_shipment';
      case 'ready_to_shipment':
        return 'shipped';
      case 'shipped':
        return 'shipped'; // Оставляем тот же статус
      case 'mixed':
        // Для смешанных статусов, возвращаем следующий логический статус
        // Чаще всего это будет assembly
        return 'assembly';
      default:
        // По умолчанию продвигаем к статусу assembly
        return 'assembly';
    }
  };
  
  /**
   * Получает текущий статус выбранных заказов Wildberries
   */
  const getSelectedWbOrdersStatus = (): string => {
    if (selectedWbOrders.size === 0) return 'new';
    
    // Создаем множество уникальных статусов
    const statuses = new Set<string>();
    
    // Заполняем множество статусами всех выбранных заказов
    wbOrders.forEach(order => {
      if (selectedWbOrders.has(order.id || order.order_id || '')) {
        // Приоритет отдаем own_status (собственный статус)
        const status = (order.own_status || order.wb_status || 'new').toLowerCase();
        console.log('Статус заказа:', order.order_id, 'own_status:', order.own_status, 'wb_status:', order.wb_status, 'итоговый статус:', status);
        statuses.add(status);
      }
    });
    
    console.log('Уникальные статусы выбранных заказов:', Array.from(statuses));
    
    // Если все заказы имеют один и тот же статус, возвращаем его
    if (statuses.size === 1) {
      const status = Array.from(statuses)[0];
      // Если статус пустой или null, возвращаем "assembly" вместо "new"
      if (!status || status === 'null' || status === 'undefined') {
        return 'assembly';
      }
      return status;
    }
    
    // Если статусы разные, возвращаем смешанный статус
    return 'mixed';
  };
  
  /**
   * Получает текст для кнопки смены статуса Wildberries
   */
  const getWbStatusButtonText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'Начать сборку';
      case 'assembly':
        return 'Завершить сборку';
      case 'ready_to_shipment':
        return 'Отгрузить';
      case 'shipped':
        return 'Отгружено';
      case 'mixed':
        return 'Обработать заказы';
      default:
        return 'Сменить статус';
    }
  };
  
  /**
   * Получает данные выбранных заказов Wildberries
   */
  const getSelectedWbOrdersData = (): WbOrder[] => {
    return wbOrders.filter(order => 
      selectedWbOrders.has(order.id || order.order_id || '')
    );
  };
  
  /**
   * Обработчик смены статуса заказов Wildberries
   */
  const handleChangeWbOrderStatus = async () => {
    if (selectedWbOrders.size === 0) {
      setStatusChangeError('Выберите хотя бы один заказ');
      return;
    }

    // Получаем выбранные заказы
    const selectedOrdersData = getSelectedWbOrdersData();
    
    // Проверяем данные о заказах
    if (selectedOrdersData.length === 0) {
      setStatusChangeError('Не удалось получить данные о выбранных заказах');
      return;
    }
    
    // Проверяем, что у всех заказов один и тот же собственный статус
    const statuses = new Set<string>();
    selectedOrdersData.forEach(order => {
      // Добавляем только непустые статусы
      if (order.own_status) {
        statuses.add(order.own_status.toLowerCase());
      }
    });
    
    console.log('Собственные статусы выбранных заказов:', Array.from(statuses));
    
    if (statuses.size > 1) {
      setStatusChangeError('Нельзя работать с заказами, имеющими разные собственные статусы');
      return;
    }

    // Определяем текущий статус выбранных заказов
    const currentStatus = getSelectedWbOrdersStatus();
    console.log('Текущий определенный статус:', currentStatus);
    
    // Проверяем на пустой статус
    if (!currentStatus || currentStatus === 'null' || currentStatus === 'undefined') {
      console.log('Статус не определен или пустой, используем assembly');
      const nextStatus = 'assembly';
      processStatusChange(nextStatus, selectedOrdersData);
      return;
    }
    
    // Определяем следующий статус
    const nextStatus = getNextWbStatus(currentStatus);

    console.log('Текущий статус:', currentStatus);
    console.log('Следующий статус:', nextStatus);

    processStatusChange(nextStatus, selectedOrdersData);
  };
  
  /**
   * Обработка изменения статуса (вынесена в отдельную функцию для удобства)
   */
  const processStatusChange = async (nextStatus: string, selectedOrdersData: WbOrder[]) => {
    setStatusChangeLoading(true);
    setStatusChangeError(null);
    setStatusChangeSuccess(false);

    try {
      // Получаем ID заказов
      const orderIds = Array.from(selectedWbOrders).map(orderId => {
        const order = wbOrders.find(o => 
          (o.id || o.order_id) === orderId
        );
        // Используем числовое значение order_id, если это возможно
        const finalOrderId = order?.order_id || orderId;
        // Пытаемся преобразовать к числу, если это строка с числом
        return typeof finalOrderId === 'string' && !isNaN(Number(finalOrderId)) 
          ? Number(finalOrderId) 
          : finalOrderId;
      });

      // Получаем wb_token_id из первого заказа (или используем 1 по умолчанию)
      let wb_token_id = 1;
      const firstSelectedOrder = selectedOrdersData[0];
      if (firstSelectedOrder && firstSelectedOrder.wb_token) {
        wb_token_id = firstSelectedOrder.wb_token;
      }

      console.log('Выбранные заказы:', selectedWbOrders);
      console.log('Данные выбранных заказов:', selectedOrdersData);
      console.log('ID заказов для отправки:', orderIds);
      console.log('ID токена Wildberries:', wb_token_id);
      console.log('Новый статус:', nextStatus);

      // Проверяем, что массив не пустой
      if (orderIds.length === 0) {
        throw new Error('Не удалось получить ID заказов');
      }

      // Проверяем статус перед отправкой
      if (!nextStatus) {
        throw new Error('Не удалось определить следующий статус');
      }

      // Отправляем запрос на изменение статуса через API-сервис с указанием токена
      const result = await changeWbOrderStatus({
        orders: orderIds,
        status: nextStatus,
        wb_token_id: wb_token_id
      });

      console.log('Результат смены статуса:', result);
      setStatusChangeSuccess(true);
        
      // Если переходим в статус "assembly", скачиваем отчеты
      if (nextStatus === 'assembly') {
        downloadWbOrderReports();
      }
        
      // Обновляем данные заказов с небольшой задержкой
      setTimeout(() => {
        if (selectedLegalEntity) {
          loadWildberriesOrders(selectedLegalEntity);
        }
      }, 2000);
    } catch (error) {
      console.error('Ошибка запроса:', error);
      setStatusChangeError(error instanceof Error ? error.message : 'Произошла ошибка при отправке запроса');
    } finally {
      setStatusChangeLoading(false);
    }
  };
  
  /**
   * Скачивание отчетов о заказах Wildberries (сводка в Excel, список и стикеры в PDF)
   */
  const downloadWbOrderReports = () => {
    const selectedOrdersData = getSelectedWbOrdersData();
    
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
    
    console.log('Генерация отчетов для заказов:', sortedByNmId);
    
    try {
      // Шаг 1: Генерируем сводку по артикулам в Excel
      console.log('Генерация Excel: Сводка по артикулам');
      generateArticlesSummaryExcel(sortedByNmId, selectedLegalEntity || undefined);
      
      // Шаг 2: Генерируем PDF со списком всех заказов
      console.log('Генерация PDF: Список всех заказов');
      generateOrdersListPDF(sortedByNmId, selectedLegalEntity || undefined);
      
      // Шаг 3: Генерируем PDF со стикерами
      console.log('Генерация PDF: Наклейки для заказов');
      generateStickersPDF(sortedByNmId);
      
      console.log('Все отчеты успешно сгенерированы');
      alert('Отчеты успешно сгенерированы и сохранены');
    } catch (error) {
      console.error('Ошибка при генерации отчетов:', error);
      alert(`Произошла ошибка при генерации отчетов: ${error instanceof Error ? (error as Error).message : String(error)}`);
    }
  };
  
  /**
   * Обработчик запроса на доставку для Wildberries
   */
  const handleWbShippingRequest = async () => {
    if (selectedWbOrders.size === 0) {
      alert('Выберите хотя бы один заказ для запроса на доставку');
      return;
    }

    // Получаем выбранные заказы
    const selectedOrdersData = getSelectedWbOrdersData();
    
    // Проверяем, что у всех заказов один и тот же собственный статус
    const statuses = new Set<string>();
    selectedOrdersData.forEach(order => {
      statuses.add((order.own_status || '').toLowerCase());
    });
    
    if (statuses.size > 1) {
      setStatusChangeError('Нельзя работать с заказами, имеющими разные собственные статусы');
      return;
    }
    
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
        if (selectedLegalEntity) {
          loadWildberriesOrders(selectedLegalEntity);
        }
      }, 1500);
    } catch (error) {
      console.error('Ошибка запроса:', error);
      alert(`Произошла ошибка при отправке запроса: ${error instanceof Error ? error.message : String(error)}`);
      setStatusChangeError('Произошла ошибка при отправке запроса');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  /**
   * Получает следующий статус для заказов Ozon
   */
  const getNextOzonStatus = (currentStatus: string): string => {
    switch (currentStatus.toLowerCase()) {
      case 'new':
        return 'processing';
      case 'processing':
        return 'ready_to_ship';
      case 'ready_to_ship':
        return 'shipped';
      default:
        return 'new';
    }
  };

  /**
   * Получает текущий статус выбранных заказов Ozon
   */
  const getSelectedOzonOrdersStatus = (): string => {
    if (selectedOzonOrders.size === 0) return 'new';
    
    // Создаем множество уникальных статусов
    const statuses = new Set<string>();
    
    // Заполняем множество статусами всех выбранных заказов
    ozonOrders.forEach(order => {
      if (selectedOzonOrders.has(order.id || order.order_id || '')) {
        statuses.add((order.status || 'new').toLowerCase());
      }
    });
    
    // Если все заказы имеют один и тот же статус, возвращаем его
    if (statuses.size === 1) {
      return Array.from(statuses)[0];
    }
    
    // Если статусы разные, возвращаем смешанный статус
    return 'mixed';
  };

  /**
   * Получает текст для кнопки смены статуса Ozon
   */
  const getOzonStatusButtonText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'Начать обработку';
      case 'processing':
        return 'Подготовить к отправке';
      case 'ready_to_ship':
        return 'Отправить';
      case 'shipped':
        return 'Отправлено';
      case 'mixed':
        return 'Обработать заказы';
      default:
        return 'Сменить статус';
    }
  };

  /**
   * Получает данные выбранных заказов Ozon
   */
  const getSelectedOzonOrdersData = (): OzonOrder[] => {
    return ozonOrders.filter(order => 
      selectedOzonOrders.has(order.id || order.order_id || '')
    );
  };

  /**
   * Обработчик смены статуса заказов Ozon
   */
  const handleChangeOzonOrderStatus = async () => {
    if (selectedOzonOrders.size === 0) {
      setStatusChangeError('Выберите хотя бы один заказ');
      return;
    }

    // Определяем текущий статус выбранных заказов
    const currentStatus = getSelectedOzonOrdersStatus();
    // Определяем следующий статус
    const nextStatus = getNextOzonStatus(currentStatus);

    setStatusChangeLoading(true);
    setStatusChangeError(null);
    setStatusChangeSuccess(false);

    try {
      // Получаем ID заказов
      const orderIds = Array.from(selectedOzonOrders).map(orderId => {
        const order = ozonOrders.find(o => 
          (o.id || o.order_id) === orderId
        );
        return order?.order_id || orderId;
      });

      // Отправляем запрос на изменение статуса через API-сервис
      await changeOzonOrderStatus({
        orders: orderIds,
        status: nextStatus
      });

      setStatusChangeSuccess(true);
        
      // Обновляем данные заказов
      setTimeout(() => {
        if (selectedLegalEntity) {
          loadOzonOrders(selectedLegalEntity);
        }
      }, 1500);
    } catch (error) {
      console.error('Ошибка запроса:', error);
      setStatusChangeError('Произошла ошибка при отправке запроса');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  /**
   * Получает следующий статус для заказов Яндекс Маркет
   */
  const getNextYandexStatus = (currentStatus: string): string => {
    const upperStatus = currentStatus.toUpperCase();
    
    // Обрабатываем статусы Яндекс Маркет
    if (upperStatus === 'PROCESSING') {
      // Смотрим, есть ли конкретный подстатус
      const selected = getSelectedYandexOrdersData();
      if (selected.length > 0) {
        const substatus = selected[0].substatus?.toUpperCase();
        
        if (substatus === 'READY_TO_SHIP') {
          return 'SHIPPED'; // Если подстатус READY_TO_SHIP, следующий шаг - SHIPPED
        } else {
          return 'READY_TO_SHIP'; // Иначе переводим в READY_TO_SHIP
        }
      }
      return 'READY_TO_SHIP'; // По умолчанию - в готовый к отправке
    } 
    
    // Для остальных статусов используем стандартную логику
    switch (currentStatus.toLowerCase()) {
      case 'new':
        return 'processing';
      case 'processing':
        return 'ready_to_ship';
      case 'ready_to_ship':
        return 'shipped';
      default:
        return 'processing';
    }
  };

  /**
   * Получает данные выбранных заказов Яндекс Маркет
   */
  const getSelectedYandexOrdersData = (): YandexMarketOrder[] => {
    return ymOrders.filter(order => 
      selectedYmOrders.has(order.id || order.order_id || '')
    );
  };

  /**
   * Получает текущий статус выбранных заказов Яндекс Маркет
   */
  const getSelectedYandexOrdersStatus = (): string => {
    if (selectedYmOrders.size === 0) return 'new';
    
    // Создаем множество уникальных статусов
    const statuses = new Set<string>();
    
    // Заполняем множество статусами всех выбранных заказов
    ymOrders.forEach(order => {
      if (selectedYmOrders.has(order.id || order.order_id || '')) {
        statuses.add((order.status || 'new').toLowerCase());
      }
    });
    
    // Если все заказы имеют один и тот же статус, возвращаем его
    if (statuses.size === 1) {
      return Array.from(statuses)[0];
    }
    
    // Если статусы разные, возвращаем смешанный статус
    return 'mixed';
  };

  /**
   * Получает текст для кнопки смены статуса Яндекс Маркет
   */
  const getYandexStatusButtonText = (status: string): string => {
    const upperStatus = status.toUpperCase();
    
    // Обрабатываем статусы Яндекс Маркет
    if (upperStatus === 'PROCESSING') {
      // Смотрим, есть ли конкретный подстатус
      const selected = getSelectedYandexOrdersData();
      if (selected.length > 0) {
        const substatus = selected[0].substatus?.toUpperCase();
        
        if (substatus === 'READY_TO_SHIP') {
          return 'Отправить'; // Если подстатус READY_TO_SHIP, следующий шаг - отправка
        } else {
          return 'Подготовить к отправке'; // Иначе подготавливаем к отправке
        }
      }
      return 'Подготовить к отправке'; // По умолчанию - подготовка к отправке
    } else if (upperStatus === 'SHIPPED') {
      return 'Отправлено';
    }
    
    // Для остальных статусов используем стандартную логику
    switch (status.toLowerCase()) {
      case 'new':
        return 'Начать обработку';
      case 'processing':
        return 'Подготовить к отправке';
      case 'ready_to_ship':
        return 'Отправить';
      case 'shipped':
        return 'Отправлено';
      case 'mixed':
        return 'Обработать заказы';
      default:
        return 'Сменить статус';
    }
  };

  /**
   * Обработчик смены статуса заказов Яндекс Маркет
   */
  const handleChangeYandexOrderStatus = async () => {
    if (selectedYmOrders.size === 0) {
      setStatusChangeError('Выберите хотя бы один заказ');
      return;
    }

    // Определяем текущий статус выбранных заказов
    const currentStatus = getSelectedYandexOrdersStatus();
    // Определяем следующий статус
    const nextStatus = getNextYandexStatus(currentStatus);

    setStatusChangeLoading(true);
    setStatusChangeError(null);
    setStatusChangeSuccess(false);

    try {
      // Получаем ID заказов
      const orderIds = Array.from(selectedYmOrders).map(orderId => {
        const order = ymOrders.find(o => 
          (o.id || o.order_id) === orderId
        );
        return order?.order_id || orderId;
      });

      // Отправляем запрос на изменение статуса через API-сервис
      await changeYandexOrderStatus({
        orders: orderIds,
        status: nextStatus
      });

      setStatusChangeSuccess(true);
        
      // Обновляем данные заказов
      setTimeout(() => {
        if (selectedLegalEntity) {
          loadYandexMarketOrders(selectedLegalEntity);
        }
      }, 1500);
    } catch (error) {
      console.error('Ошибка запроса:', error);
      setStatusChangeError('Произошла ошибка при отправке запроса');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  /**
   * Обработчик сортировки заказов Wildberries
   */
  const handleWbSort = (column: string) => {
    // Если выбран тот же столбец, меняем направление сортировки
    if (wbSortColumn === column) {
      setWbSortDirection(wbSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Если выбран новый столбец, устанавливаем его и сортировку по возрастанию
      setWbSortColumn(column);
      setWbSortDirection('asc');
    }
  };

  /**
   * Обработчик сортировки заказов Ozon
   */
  const handleOzonSort = (column: string) => {
    if (ozonSortColumn === column) {
      setOzonSortDirection(ozonSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOzonSortColumn(column);
      setOzonSortDirection('asc');
    }
  };

  /**
   * Обработчик сортировки заказов Yandex Market
   */
  const handleYmSort = (column: string) => {
    if (ymSortColumn === column) {
      setYmSortDirection(ymSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setYmSortColumn(column);
      setYmSortDirection('asc');
    }
  };

  /**
   * Функция для получения отсортированных заказов Wildberries
   */
  const getSortedWbOrders = () => {
    if (!wbSortColumn) return wbOrders;

    return [...wbOrders].sort((a, b) => {
      // Проверка на сортировку по дате
      if (wbSortColumn === 'created_at') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        
        return wbSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Обработка числовых полей
      if (wbSortColumn === 'sale_price' || wbSortColumn === 'nm_id') {
        const numA = parseFloat(String(a[wbSortColumn as keyof WbOrder] || 0));
        const numB = parseFloat(String(b[wbSortColumn as keyof WbOrder] || 0));
        
        return wbSortDirection === 'asc' ? numA - numB : numB - numA;
      }
      
      // Для текстовых полей
      let valueA = a[wbSortColumn as keyof WbOrder];
      let valueB = b[wbSortColumn as keyof WbOrder];
      
      // Обработка значений null или undefined
      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';
      
      // Преобразование к строке для сравнения
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      // Сортировка
      if (wbSortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  };

  /**
   * Функция для получения заказов Wildberries текущей страницы
   */
  const getCurrentPageWbOrders = () => {
    const filteredOrders = getFilteredWbOrders();
    const indexOfLastItem = wbCurrentPage * wbItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - wbItemsPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  /**
   * Функция для получения отсортированных заказов Ozon
   */
  const getSortedOzonOrders = () => {
    if (!ozonSortColumn) return ozonOrders;

    return [...ozonOrders].sort((a, b) => {
      // Проверка на сортировку по дате
      if (ozonSortColumn === 'created_at' || ozonSortColumn === 'in_process_at' || ozonSortColumn === 'created_date') {
        // Находим первое непустое поле с датой
        const getDateValue = (order: OzonOrder) => {
          if (ozonSortColumn === 'created_at' && order.created_at) {
            return new Date(order.created_at).getTime();
          } else if (ozonSortColumn === 'in_process_at' && order.in_process_at) {
            return new Date(order.in_process_at).getTime();
          } else if (order.created_date) {
            return new Date(order.created_date).getTime();
          }
          return 0;
        };
        
        const dateA = getDateValue(a);
        const dateB = getDateValue(b);
        
        return ozonSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Обработка числовых полей
      if (ozonSortColumn === 'price' || ozonSortColumn === 'sale_price') {
        // Берем первое непустое значение
        const getPriceValue = (order: OzonOrder) => {
          if (ozonSortColumn === 'price' && order.price !== undefined) {
            return parseFloat(String(order.price || 0));
          }
          return parseFloat(String(order.sale_price || 0));
        };
        
        const numA = getPriceValue(a);
        const numB = getPriceValue(b);
        
        return ozonSortDirection === 'asc' ? numA - numB : numB - numA;
      }
      
      // Для нескольких возможных полей с тем же значением
      let valueA, valueB;
      
      // Обработка полей с несколькими возможными именами
      if (ozonSortColumn === 'product_name') {
        valueA = a.product_name || a.name || '';
        valueB = b.product_name || b.name || '';
      } else if (ozonSortColumn === 'sku') {
        valueA = a.sku || a.offer_id || '';
        valueB = b.sku || b.offer_id || '';
      } else if (ozonSortColumn === 'city') {
        valueA = a.city || (a.delivery_method?.warehouse ? a.delivery_method.warehouse.split(',')[0] : '');
        valueB = b.city || (b.delivery_method?.warehouse ? b.delivery_method.warehouse.split(',')[0] : '');
      } else if (ozonSortColumn === 'delivery_type') {
        valueA = a.delivery_type || (a.delivery_method ? a.delivery_method.name : '');
        valueB = b.delivery_type || (b.delivery_method ? b.delivery_method.name : '');
      } else {
        // Для остальных полей
        valueA = a[ozonSortColumn as keyof OzonOrder];
        valueB = b[ozonSortColumn as keyof OzonOrder];
      }
      
      // Обработка значений null или undefined
      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';
      
      // Преобразование к строке для сравнения
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      // Сортировка
      if (ozonSortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  };

  /**
   * Функция для получения заказов Ozon текущей страницы
   */
  const getCurrentPageOzonOrders = () => {
    const filteredOrders = getFilteredOzonOrders();
    const indexOfLastItem = ozonCurrentPage * ozonItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - ozonItemsPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  /**
   * Функция для получения отсортированных заказов Yandex Market
   */
  const getSortedYmOrders = () => {
    if (!ymSortColumn) return ymOrders;

    return [...ymOrders].sort((a, b) => {
      // Проверка на сортировку по дате
      if (ymSortColumn === 'created_at' || ymSortColumn === 'created_date') {
        const dateA = a[ymSortColumn as keyof YandexMarketOrder] 
          ? new Date(String(a[ymSortColumn as keyof YandexMarketOrder])).getTime() 
          : 0;
        const dateB = b[ymSortColumn as keyof YandexMarketOrder] 
          ? new Date(String(b[ymSortColumn as keyof YandexMarketOrder])).getTime() 
          : 0;
        
        return ymSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Обработка числовых полей
      if (ymSortColumn === 'price' || ymSortColumn === 'total_price') {
        const getPriceValue = (order: YandexMarketOrder) => {
          if (ymSortColumn === 'price' && order.price !== undefined) {
            return parseFloat(String(order.price || 0));
          }
          return parseFloat(String(order.total_price || 0));
        };
        
        const numA = getPriceValue(a);
        const numB = getPriceValue(b);
        
        return ymSortDirection === 'asc' ? numA - numB : numB - numA;
      }
      
      // Для нескольких возможных полей с тем же значением
      let valueA, valueB;
      
      // Обработка полей с несколькими возможными именами
      if (ymSortColumn === 'name') {
        valueA = a.name || a.product_name || '';
        valueB = b.name || b.product_name || '';
      } else if (ymSortColumn === 'shop_sku') {
        valueA = a.shop_sku || a.offer_id || '';
        valueB = b.shop_sku || b.offer_id || '';
      } else if (ymSortColumn === 'region') {
        valueA = a.region || a.delivery_region || '';
        valueB = b.region || b.delivery_region || '';
      } else {
        // Для остальных полей
        valueA = a[ymSortColumn as keyof YandexMarketOrder];
        valueB = b[ymSortColumn as keyof YandexMarketOrder];
      }
      
      // Обработка значений null или undefined
      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';
      
      // Преобразование к строке для сравнения
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      // Сортировка
      if (ymSortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  };

  /**
   * Функция для получения заказов Yandex Market текущей страницы
   */
  const getCurrentPageYmOrders = () => {
    const filteredOrders = getFilteredYmOrders();
    const indexOfLastItem = ymCurrentPage * ymItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - ymItemsPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  /**
   * Компонент заголовка столбца с сортировкой
   */
  const SortableColumnHeader = ({ 
    column, 
    title, 
    currentSortColumn, 
    currentSortDirection, 
    onSort,
    isDateColumn = false
  }: { 
    column: string; 
    title: string; 
    currentSortColumn: string | null; 
    currentSortDirection: 'asc' | 'desc'; 
    onSort: (column: string) => void;
    isDateColumn?: boolean;
  }) => (
    <th onClick={() => onSort(column)} style={{ cursor: 'pointer' }}>
      <div className="d-flex align-items-center justify-content-between">
        <span>{title}</span>
        <span>
          {currentSortColumn === column ? (
            <i className={`bi bi-sort-${isDateColumn ? 'numeric-' : ''}${currentSortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
          ) : (
            <i className={`bi bi-filter${isDateColumn ? '-square' : ''} ms-1 text-muted`}></i>
          )}
        </span>
      </div>
    </th>
  );

  /**
   * Компонент пагинации для отображения страниц
   */
  const PaginationComponent = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => {
    // Определяем, сколько страниц показывать до и после текущей
    const pagesToShow = 2;
    let startPage = Math.max(1, currentPage - pagesToShow);
    let endPage = Math.min(totalPages, currentPage + pagesToShow);

    // Если меньше страниц показано слева, добавляем справа
    if (currentPage - startPage < pagesToShow) {
      endPage = Math.min(totalPages, endPage + (pagesToShow - (currentPage - startPage)));
    }

    // Если меньше страниц показано справа, добавляем слева
    if (endPage - currentPage < pagesToShow) {
      startPage = Math.max(1, startPage - (pagesToShow - (endPage - currentPage)));
    }

    // Создаем массив страниц для отображения
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
      <div className="d-flex justify-content-between align-items-center my-3">
        <div>
          <span className="text-muted">
            Страница {currentPage} из {totalPages}
          </span>
        </div>
        <Pagination>
          <Pagination.First
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          
          {startPage > 1 && (
            <>
              <Pagination.Item onClick={() => onPageChange(1)}>1</Pagination.Item>
              {startPage > 2 && <Pagination.Ellipsis />}
            </>
          )}
          
          {pages.map(page => (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Pagination.Item>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <Pagination.Ellipsis />}
              <Pagination.Item onClick={() => onPageChange(totalPages)}>
                {totalPages}
              </Pagination.Item>
            </>
          )}
          
          <Pagination.Next
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
  };

  /**
   * Обработчик добавления заказов Wildberries в поставку
   */
  const handleAddToSupply = async () => {
    if (selectedWbOrders.size === 0) {
      setStatusChangeError('Выберите хотя бы один заказ для добавления в поставку');
      return;
    }

    // Получаем выбранные заказы
    const selectedOrdersData = getSelectedWbOrdersData();
    
    // Проверяем, что у всех заказов один и тот же собственный статус
    const statuses = new Set<string>();
    selectedOrdersData.forEach(order => {
      statuses.add((order.own_status || '').toLowerCase());
    });
    
    if (statuses.size > 1) {
      setStatusChangeError('Нельзя работать с заказами, имеющими разные собственные статусы');
      return;
    }
    
    // Проверяем, есть ли заказы со статусом confirm
    const hasConfirmStatus = selectedOrdersData.some(order => 
      (order.wb_status || '').toLowerCase() === 'confirm' || 
      (order.own_status || '').toLowerCase() === 'confirm'
    );
    
    if (hasConfirmStatus) {
      setStatusChangeError('Нельзя отправлять в поставку заказы со статусом confirm');
      return;
    }

    setStatusChangeLoading(true);
    setStatusChangeError(null);
    setStatusChangeSuccess(false);

    try {
      // Получаем ID заказов
      const orderIds = Array.from(selectedWbOrders).map(orderId => {
        const order = wbOrders.find(o => 
          (o.id || o.order_id) === orderId
        );
        return order?.order_id || orderId;
      });

      // Получаем wb_token_id из первого заказа (или используем 1 по умолчанию)
      let wb_token_id = 1;
      const firstSelectedOrder = wbOrders.find(order => 
        selectedWbOrders.has(order.id || order.order_id || '')
      );
      if (firstSelectedOrder && firstSelectedOrder.wb_token) {
        wb_token_id = firstSelectedOrder.wb_token;
      }

      // Отправляем запрос на добавление в поставку
      const result = await addToSupply(orderIds, wb_token_id);

      setStatusChangeSuccess(true);
      alert(`Заказы успешно добавлены в поставку. ${result.response || result.message || ''}`);
      
      // Обновляем данные заказов
      setTimeout(() => {
        if (selectedLegalEntity) {
          loadWildberriesOrders(selectedLegalEntity);
        }
      }, 1500);
    } catch (error) {
      console.error('Ошибка запроса:', error);
      setStatusChangeError('Произошла ошибка при добавлении заказов в поставку');
      alert(`Ошибка: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  /**
   * Обработчик переключения отображения всех заказов Wildberries
   */
  const handleToggleWbOrders = () => {
    if (selectedLegalEntity) {
      loadWildberriesOrders(selectedLegalEntity, !wbStatusConfirm);
    }
  };

  /**
   * Обработчик клика по ID поставки для генерации PDF со штрих-кодом поставки
   */
  const handleSupplyIdClick = async (order: WbOrder) => {
    if (!order.supply_id) {
      alert('Отсутствует идентификатор поставки');
      return;
    }

    if (!order.supply_barcode) {
      alert('Для данной поставки не найден штрих-код');
      return;
    }

    try {
      await generateSupplyBarcodePDF(order.supply_barcode, order.supply_id);
    } catch (error) {
      console.error('Ошибка при генерации PDF со штрих-кодом поставки:', error);
      alert(`Ошибка при генерации PDF: ${error instanceof Error ? (error as Error).message : String(error)}`);
    }
  };

  /**
   * Универсальная обработка заказов Wildberries
   * Выполняет последовательность действий в зависимости от текущего статуса заказов:
   * 1. Для new: Добавляет в поставку -> Переводит в assembly -> Скачивает документы
   * 2. Для assembly: Переводит в ready_to_shipment
   * 3. Для ready_to_shipment: Отправляет запрос на доставку -> Переводит в shipped
   */
  const handleComplexWbOperation = async () => {
    if (selectedWbOrders.size === 0) {
      setStatusChangeError('Выберите хотя бы один заказ');
      return;
    }

    // Получаем выбранные заказы
    const selectedOrdersData = getSelectedWbOrdersData();
    
    if (selectedOrdersData.length === 0) {
      setStatusChangeError('Не удалось получить данные выбранных заказов');
      return;
    }
    
    // Проверяем, что у всех заказов один и тот же собственный статус
    const statuses = new Set<string>();
    selectedOrdersData.forEach(order => {
      statuses.add((order.own_status || '').toLowerCase());
    });
    
    if (statuses.size > 1) {
      setStatusChangeError('Нельзя работать с заказами, имеющими разные собственные статусы');
      return;
    }

    // Определяем текущий статус заказов
    const currentStatus = getSelectedWbOrdersStatus();
    console.log('Текущий статус заказов:', currentStatus);
    
    setStatusChangeLoading(true);
    setStatusChangeError(null);
    setStatusChangeSuccess(false);
    
    try {
      // Получаем ID заказов
      const orderIds = Array.from(selectedWbOrders).map(orderId => {
        const order = wbOrders.find(o => 
          (o.id || o.order_id) === orderId
        );
        // Используем числовое значение order_id, если это возможно
        const finalOrderId = order?.order_id || orderId;
        // Пытаемся преобразовать к числу, если это строка с числом
        return typeof finalOrderId === 'string' && !isNaN(Number(finalOrderId)) 
          ? Number(finalOrderId) 
          : finalOrderId;
      });

      // Получаем wb_token_id из первого заказа (или используем 1 по умолчанию)
      let wb_token_id = 1;
      const firstSelectedOrder = selectedOrdersData[0];
      if (firstSelectedOrder && firstSelectedOrder.wb_token) {
        wb_token_id = firstSelectedOrder.wb_token;
      }

      console.log('ID заказов для обработки:', orderIds);
      console.log('ID токена Wildberries:', wb_token_id);

      // СЦЕНАРИЙ 1: Заказы в статусе 'new'
      if (currentStatus === 'new') {
        // Шаг 1: Добавляем в поставку
        console.log('Шаг 1: Добавление заказов в поставку');
        const addToSupplyResult = await addToSupply(orderIds, wb_token_id);
        console.log('Результат добавления в поставку:', addToSupplyResult);
        
        // Шаг 2: Переводим в статус 'assembly'
        console.log('Шаг 2: Перевод заказов в статус assembly');
        const changeStatusResult = await changeWbOrderStatus({
          orders: orderIds,
          status: 'assembly',
          wb_token_id: wb_token_id
        });
        console.log('Результат смены статуса:', changeStatusResult);
        
        // Шаг 3: Скачиваем отчеты
        console.log('Шаг 3: Скачивание отчетов');
        downloadWbOrderReports();
        
        setStatusChangeSuccess(true);
        alert('Заказы успешно добавлены в поставку, переведены в статус "Сборка" и сгенерированы отчеты');
      }
      
      // СЦЕНАРИЙ 2: Заказы в статусе 'assembly'
      else if (currentStatus === 'assembly') {
        // Переводим в статус 'ready_to_shipment'
        console.log('Перевод заказов в статус ready_to_shipment');
        const changeStatusResult = await changeWbOrderStatus({
          orders: orderIds,
          status: 'ready_to_shipment',
          wb_token_id: wb_token_id
        });
        console.log('Результат смены статуса:', changeStatusResult);
        
        setStatusChangeSuccess(true);
        alert('Заказы успешно переведены в статус "Готов к отгрузке"');
      }
      
      // СЦЕНАРИЙ 3: Заказы в статусе 'ready_to_shipment'
      else if (currentStatus === 'ready_to_shipment') {
        // Проверяем наличие supply_id в заказах
        const ordersWithSupplyId = selectedOrdersData.filter(order => order.supply_id);
        if (ordersWithSupplyId.length === 0) {
          throw new Error('У выбранных заказов отсутствует идентификатор поставки (supply_id)');
        }
        
        // Получаем уникальные идентификаторы поставок
        const supplyIdMap: {[key: string]: boolean} = {};
        ordersWithSupplyId.forEach(order => {
          if (order.supply_id) {
            supplyIdMap[order.supply_id] = true;
          }
        });
        const supplyIds = Object.keys(supplyIdMap);
        
        // Шаг 1: Отправляем запрос на доставку
        console.log('Шаг 1: Отправка запроса на доставку');
        const shippingResult = await requestShipping(supplyIds, wb_token_id);
        console.log('Результат запроса на доставку:', shippingResult);
        
        // Шаг 2: Переводим в статус 'shipped'
        console.log('Шаг 2: Перевод заказов в статус shipped');
        const changeStatusResult = await changeWbOrderStatus({
          orders: orderIds,
          status: 'shipped',
          wb_token_id: wb_token_id
        });
        console.log('Результат смены статуса:', changeStatusResult);
        
        setStatusChangeSuccess(true);
        alert('Заказы успешно отправлены в доставку и переведены в статус "Отгружено"');
      }
      
      // СЦЕНАРИЙ 4: Другие статусы
      else {
        // Для других статусов просто переводим на следующий статус
        const nextStatus = getNextWbStatus(currentStatus);
        console.log('Перевод заказов в статус', nextStatus);
        const changeStatusResult = await changeWbOrderStatus({
          orders: orderIds,
          status: nextStatus,
          wb_token_id: wb_token_id
        });
        console.log('Результат смены статуса:', changeStatusResult);
        
        setStatusChangeSuccess(true);
        alert(`Заказы успешно переведены в статус "${getWbStatusButtonText(nextStatus)}"`);
      }
            
      // Обновляем данные заказов с небольшой задержкой
      setTimeout(() => {
        if (selectedLegalEntity) {
          loadWildberriesOrders(selectedLegalEntity);
        }
      }, 2000);
    } catch (error) {
      console.error('Ошибка универсальной обработки заказов:', error);
      setStatusChangeError(error instanceof Error ? error.message : 'Произошла ошибка при обработке заказов');
      alert(`Ошибка: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  /**
   * Обновление базы данных Wildberries
   */
  const updateWbDatabase = async () => {
    try {
      setWbOrdersLoading(true);
      const response = await fetch('http://62.113.44.196:8080/api/v1/wb-orders/update/', {
        method: 'POST',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      // После успешного обновления БД, перезагружаем заказы
      if (selectedLegalEntity) {
        await loadWildberriesOrders(selectedLegalEntity);
      }
    } catch (error) {
      console.error('Ошибка при обновлении БД Wildberries:', error);
      setWbOrdersError(error instanceof Error ? error.message : 'Произошла ошибка при обновлении БД');
    } finally {
      setWbOrdersLoading(false);
    }
  };

  /**
   * Обновление базы данных Ozon
   */
  const updateOzonDatabase = async () => {
    try {
      setOzonOrdersLoading(true);
      const response = await fetch('http://62.113.44.196:8080/api/v1/ozon-orders/update/', {
        method: 'POST',
        headers: {
          'Authorization': 'Token 4e5cee7ce7f660fd6a00793bc33401016655e133'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      // После успешного обновления БД, перезагружаем заказы
      if (selectedLegalEntity) {
        await loadOzonOrders(selectedLegalEntity);
      }
    } catch (error) {
      console.error('Ошибка при обновлении БД Ozon:', error);
      setOzonOrdersError(error instanceof Error ? error.message : 'Произошла ошибка при обновлении БД');
    } finally {
      setOzonOrdersLoading(false);
    }
  };

  /**
   * Получение отфильтрованных заказов Wildberries
   */
  const getFilteredWbOrders = () => {
    let filteredOrders = getSortedWbOrders();
    
    // Фильтрация по внутреннему статусу
    if (wbStatusFilter) {
      filteredOrders = filteredOrders.filter(order => 
        (order.own_status || '').toLowerCase() === wbStatusFilter.toLowerCase()
      );
    }
    
    // Фильтрация по статусу WB
    if (wbStatusWbFilter) {
      filteredOrders = filteredOrders.filter(order => 
        (order.wb_status || '').toLowerCase() === wbStatusWbFilter.toLowerCase()
      );
    }
    
    return filteredOrders;
  };

  /**
   * Получение отфильтрованных заказов Ozon
   */
  const getFilteredOzonOrders = () => {
    let filteredOrders = getSortedOzonOrders();
    
    if (ozonStatusFilter) {
      filteredOrders = filteredOrders.filter(order => 
        (order.status || '').toLowerCase() === ozonStatusFilter.toLowerCase()
      );
    }
    
    return filteredOrders;
  };

  /**
   * Получение отфильтрованных заказов Яндекс Маркет
   */
  const getFilteredYmOrders = () => {
    let filteredOrders = getSortedYmOrders();
    
    if (ymStatusFilter) {
      filteredOrders = filteredOrders.filter(order => 
        (order.status || '').toLowerCase() === ymStatusFilter.toLowerCase()
      );
    }
    
    return filteredOrders;
  };

  return (
    <Container fluid className="dashboard-container">

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-title mb-0">Юридические лица</h2>
            {!showAllLegalEntities && (
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => setShowAllLegalEntities(true)}
              >
                <i className="bi bi-list me-1"></i>Показать все юр. лица
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          ) : legalEntities.length === 0 ? (
            <Alert variant="warning">
              <i className="bi bi-info-circle me-2"></i>
              Юридические лица не найдены. <Button variant="link" className="p-0" onClick={handleManageLegalEntities}>Добавить юр. лицо</Button>
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Наименование</th>
                  <th>ИНН</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {legalEntities
                  .filter(entity => showAllLegalEntities || (selectedLegalEntity && entity.id === selectedLegalEntity.id))
                  .map((entity) => (
                    <tr key={entity.id}>
                      <td>{entity.id}</td>
                      <td>{entity.title}</td>
                      <td>{entity.inn}</td>
                      <td>
                        <div className="btn-group" style={{ gap: '15px' }}>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleSelectMarketplace('wildberries', entity)}
                          style={{ backgroundColor: 'purple', border: '2px solid purple'}}
                        >
                          <i className="bi bi-box me-1"></i>
                          Wildberries
                        </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleSelectMarketplace('ozon', entity)}
                          >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            OZON
                          </Button>
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => handleSelectMarketplace('yandex-market', entity)}
                          >
                            <i className="bi bi-box-seam me-1"></i>
                            YandexMarket
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* Отображение заказов Wildberries */}
      {selectedMarketplace === 'wildberries' && selectedLegalEntity && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">Заказы Wildberries</h3>
                  <p className="text-muted mb-0">
                    Юридическое лицо: <strong>{selectedLegalEntity.title}</strong> (ИНН: {selectedLegalEntity.inn})
                  </p>
                </div>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={handleClearSelectedMarketplace}
                    className="ms-2"
                  >
                    <i className="bi bi-x-circle me-1"></i>Скрыть
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {statusChangeError && (
                  <Alert variant="danger" className="mb-3" dismissible onClose={() => setStatusChangeError(null)}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {statusChangeError}
                  </Alert>
                )}
                
                {statusChangeSuccess && (
                  <Alert variant="success" className="mb-3" dismissible onClose={() => setStatusChangeSuccess(false)}>
                    <i className="bi bi-check-circle me-2"></i>
                    Действие успешно выполнено
                  </Alert>
                )}
                
                <div className="mb-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleComplexWbOperation}
                    disabled={selectedWbOrders.size === 0 || statusChangeLoading}
                    className="me-2"
                  >
                    {statusChangeLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-2"></i>
                        Обработать заказы ({selectedWbOrders.size})
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => { if (selectedLegalEntity) loadWildberriesOrders(selectedLegalEntity); }}
                    className="me-2"
                  >
                    <i className="bi bi-arrow-repeat me-1"></i> Обновить
                  </Button>

                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    onClick={updateWbDatabase}
                    className="me-2"
                  >
                    <i className="bi bi-database me-1"></i> Обновить БД
                  </Button>

                  <Button 
                    variant={wbStatusConfirm ? "outline-info" : "outline-warning"} 
                    size="sm" 
                    onClick={handleToggleWbOrders}
                  >
                    <i className="bi bi-eye me-1"></i> 
                    {wbStatusConfirm ? "Показать все заказы" : "Показать заказы с подтверждением"}
                  </Button>
                </div>
                
                {/* Кнопки фильтрации по статусам Wildberries */}
                <div className="mb-3">
                  <div className="mb-2">
                    <h6 className="mb-2">Внутренний статус:</h6>
                    <ButtonGroup>
                      <Button
                        variant={wbStatusFilter === null ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusFilter(null)}
                      >
                        Все
                      </Button>
                      <Button
                        variant={wbStatusFilter === 'new' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusFilter('new')}
                      >
                        Новые
                      </Button>
                      <Button
                        variant={wbStatusFilter === 'assembly' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusFilter('assembly')}
                      >
                        В сборке
                      </Button>
                      <Button
                        variant={wbStatusFilter === 'ready_to_shipment' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusFilter('ready_to_shipment')}
                      >
                        Готовы к отгрузке
                      </Button>
                      <Button
                        variant={wbStatusFilter === 'shipped' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusFilter('shipped')}
                      >
                        Отгружены
                      </Button>
                    </ButtonGroup>
                  </div>
                  
                  <div>
                    <h6 className="mb-2">Статус WB:</h6>
                    <ButtonGroup>
                      <Button
                        variant={wbStatusWbFilter === null ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusWbFilter(null)}
                      >
                        Все
                      </Button>
                      <Button
                        variant={wbStatusWbFilter === 'new' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusWbFilter('new')}
                      >
                        Новый
                      </Button>
                      <Button
                        variant={wbStatusWbFilter === 'confirm' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusWbFilter('confirm')}
                      >
                        Подтвержден
                      </Button>
                      <Button
                        variant={wbStatusWbFilter === 'cancel' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusWbFilter('cancel')}
                      >
                        Отменен
                      </Button>
                      <Button
                        variant={wbStatusWbFilter === 'delivered' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusWbFilter('delivered')}
                      >
                        Доставлен
                      </Button>
                      <Button
                        variant={wbStatusWbFilter === 'complete' ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setWbStatusWbFilter('complete')}
                      >
                        Выполнен
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>

                {wbOrdersLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Загрузка заказов...</p>
                  </div>
                ) : wbOrdersError ? (
                  <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {wbOrdersError}
                  </Alert>
                ) : wbOrders.length === 0 ? (
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    Заказы не найдены
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover bordered striped>
                      <thead>
                        <tr>
                          <th>
                            <Form.Check
                              type="checkbox"
                              checked={selectAllWb}
                              onChange={handleSelectAllWb}
                              aria-label="Выбрать все заказы"
                            />
                          </th>
                          <SortableColumnHeader
                            column="order_id"
                            title="ID заказа"
                            currentSortColumn={wbSortColumn}
                            currentSortDirection={wbSortDirection}
                            onSort={handleWbSort}
                          />
                          <SortableColumnHeader
                            column="created_at"
                            title="Дата создания"
                            currentSortColumn={wbSortColumn}
                            currentSortDirection={wbSortDirection}
                            onSort={handleWbSort}
                            isDateColumn={true}
                          />
                          <SortableColumnHeader
                            column="article"
                            title="Наименование"
                            currentSortColumn={wbSortColumn}
                            currentSortDirection={wbSortDirection}
                            onSort={handleWbSort}
                          />
                          <SortableColumnHeader
                            column="nm_id"
                            title="Артикул"
                            currentSortColumn={wbSortColumn}
                            currentSortDirection={wbSortDirection}
                            onSort={handleWbSort}
                          />
                          <SortableColumnHeader
                            column="wb_status"
                            title="Статус WB"
                            currentSortColumn={wbSortColumn}
                            currentSortDirection={wbSortDirection}
                            onSort={handleWbSort}
                          />
                          <SortableColumnHeader
                            column="own_status"
                            title="Внутренний статус"
                            currentSortColumn={wbSortColumn}
                            currentSortDirection={wbSortDirection}
                            onSort={handleWbSort}
                          />
                          <SortableColumnHeader
                            column="supply_id"
                            title="Номер поставки"
                            currentSortColumn={wbSortColumn}
                            currentSortDirection={wbSortDirection}
                            onSort={handleWbSort}
                          />
                          <th>Склад</th>
                          <SortableColumnHeader
                            column="sale_price"
                            title="Цена продажи"
                            currentSortColumn={wbSortColumn}
                            currentSortDirection={wbSortDirection}
                            onSort={handleWbSort}
                          />
                          <th>Часть А</th>
                          <th>Часть В</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentPageWbOrders().map((order, index) => (
                          <tr key={order.id || order.order_id || index}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedWbOrders.has(order.id || order.order_id || index)}
                                onChange={() => handleSelectWbOrder(order.id || order.order_id || index)}
                                aria-label={`Выбрать заказ ${order.id || order.order_id || index}`}
                              />
                            </td>
                            <td>{order.order_id || '—'}</td>
                            <td>{formatDate(order.created_at)}</td>
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
                              {order.supply_id 
                                ? (
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-info" 
                                    style={{textDecoration: 'none'}} 
                                    onClick={() => handleSupplyIdClick(order)}
                                    disabled={!order.supply_barcode}
                                  >
                                    {order.supply_id}
                                    {order.supply_barcode ? <i className="bi bi-file-earmark-pdf ms-1" /> : null}
                                  </Button>
                                )
                                : '—'
                              }
                            </td>
                            <td>
                              {order.offices && order.offices.length > 0 
                                ? order.offices.join(', ') 
                                : '—'}
                            </td>
                            <td>{formatPrice(order.sale_price)}</td>
                            <td>{order.part_a || '—'}</td>
                            <td>{order.part_b || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {wbOrders.length > 0 && (
                      <PaginationComponent
                        currentPage={wbCurrentPage}
                        totalPages={Math.ceil(wbOrders.length / wbItemsPerPage)}
                        onPageChange={(page) => setWbCurrentPage(page)}
                      />
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Отображение заказов Ozon */}
      {selectedMarketplace === 'ozon' && selectedLegalEntity && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">Заказы OZON</h3>
                  <p className="text-muted mb-0">
                    Юридическое лицо: <strong>{selectedLegalEntity.title}</strong> (ИНН: {selectedLegalEntity.inn})
                  </p>
                </div>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={handleClearSelectedMarketplace}
                  >
                    <i className="bi bi-x-circle me-1"></i>Скрыть
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {statusChangeError && (
                  <Alert variant="danger" className="mb-3" dismissible onClose={() => setStatusChangeError(null)}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {statusChangeError}
                  </Alert>
                )}
                
                {statusChangeSuccess && (
                  <Alert variant="success" className="mb-3" dismissible onClose={() => setStatusChangeSuccess(false)}>
                    <i className="bi bi-check-circle me-2"></i>
                    Действие успешно выполнено
                  </Alert>
                )}
                
                <div className="mb-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleChangeOzonOrderStatus}
                    disabled={selectedOzonOrders.size === 0 || statusChangeLoading}
                    className="me-2"
                  >
                    {statusChangeLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-right-circle me-2"></i>
                        {getOzonStatusButtonText(getSelectedOzonOrdersStatus())} ({selectedOzonOrders.size})
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => { if (selectedLegalEntity) loadOzonOrders(selectedLegalEntity); }}
                    className="me-2"
                  >
                    <i className="bi bi-arrow-repeat me-1"></i> Обновить
                  </Button>

                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    onClick={updateOzonDatabase}
                    className="me-2"
                  >
                    <i className="bi bi-database me-1"></i> Обновить БД
                  </Button>
                </div>

                {/* Кнопки фильтрации по статусам Ozon */}
                <div className="mb-3">
                  <ButtonGroup>
                    <Button
                      variant={ozonStatusFilter === null ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setOzonStatusFilter(null)}
                    >
                      Все
                    </Button>
                    <Button
                      variant={ozonStatusFilter === 'new' ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setOzonStatusFilter('new')}
                    >
                      Новые
                    </Button>
                    <Button
                      variant={ozonStatusFilter === 'processing' ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setOzonStatusFilter('processing')}
                    >
                      В обработке
                    </Button>
                    <Button
                      variant={ozonStatusFilter === 'ready_to_ship' ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setOzonStatusFilter('ready_to_ship')}
                    >
                      Готовы к отправке
                    </Button>
                    <Button
                      variant={ozonStatusFilter === 'shipped' ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setOzonStatusFilter('shipped')}
                    >
                      Отправлены
                    </Button>
                  </ButtonGroup>
                </div>

                {ozonOrdersLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Загрузка заказов...</p>
                  </div>
                ) : ozonOrdersError ? (
                  <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {ozonOrdersError}
                  </Alert>
                ) : ozonOrders.length === 0 ? (
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    Заказы не найдены
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover bordered striped>
                      <thead>
                        <tr>
                          <th>
                            <Form.Check
                              type="checkbox"
                              checked={selectAllOzon}
                              onChange={handleSelectAllOzon}
                              aria-label="Выбрать все заказы"
                            />
                          </th>
                          <SortableColumnHeader
                            column="order_id"
                            title="ID заказа"
                            currentSortColumn={ozonSortColumn}
                            currentSortDirection={ozonSortDirection}
                            onSort={handleOzonSort}
                          />
                          <SortableColumnHeader
                            column="created_at"
                            title="Дата создания"
                            currentSortColumn={ozonSortColumn}
                            currentSortDirection={ozonSortDirection}
                            onSort={handleOzonSort}
                            isDateColumn={true}
                          />
                          <SortableColumnHeader
                            column="product_name"
                            title="Название"
                            currentSortColumn={ozonSortColumn}
                            currentSortDirection={ozonSortDirection}
                            onSort={handleOzonSort}
                          />
                          <SortableColumnHeader
                            column="sku"
                            title="Артикул"
                            currentSortColumn={ozonSortColumn}
                            currentSortDirection={ozonSortDirection}
                            onSort={handleOzonSort}
                          />
                          <SortableColumnHeader
                            column="status"
                            title="Статус"
                            currentSortColumn={ozonSortColumn}
                            currentSortDirection={ozonSortDirection}
                            onSort={handleOzonSort}
                          />
                          <SortableColumnHeader
                            column="price"
                            title="Цена продажи"
                            currentSortColumn={ozonSortColumn}
                            currentSortDirection={ozonSortDirection}
                            onSort={handleOzonSort}
                          />
                          <SortableColumnHeader
                            column="city"
                            title="Склад"
                            currentSortColumn={ozonSortColumn}
                            currentSortDirection={ozonSortDirection}
                            onSort={handleOzonSort}
                          />
                          <SortableColumnHeader
                            column="delivery_type"
                            title="Способ доставки"
                            currentSortColumn={ozonSortColumn}
                            currentSortDirection={ozonSortDirection}
                            onSort={handleOzonSort}
                          />
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentPageOzonOrders().map((order, index) => (
                          <tr key={order.id || order.order_id || index}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedOzonOrders.has(order.id || order.order_id || index)}
                                onChange={() => handleSelectOzonOrder(order.id || order.order_id || index)}
                                aria-label={`Выбрать заказ ${order.id || order.order_id || index}`}
                              />
                            </td>
                            <td>{order.order_id || '—'}</td>
                            <td>{formatDate(order.in_process_at || order.created_at || order.created_date)}</td>
                            <td>{order.product_name || order.name || '—'}</td>
                            <td>{order.sku || order.offer_id || '—'}</td>
                            <td>
                              <Badge bg={getBadgeColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </td>
                            <td>{formatPrice(order.price || order.sale_price)}</td>
                            <td>{order.city || (order.delivery_method && order.delivery_method.warehouse ? order.delivery_method.warehouse.split(',')[0] : '—')}</td>
                            <td>{order.delivery_type || (order.delivery_method ? order.delivery_method.name : '—')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {ozonOrders.length > 0 && (
                      <PaginationComponent
                        currentPage={ozonCurrentPage}
                        totalPages={Math.ceil(ozonOrders.length / ozonItemsPerPage)}
                        onPageChange={(page) => setOzonCurrentPage(page)}
                      />
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Отображение заказов Яндекс Маркет */}
      {selectedMarketplace === 'yandex-market' && selectedLegalEntity && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">Заказы Яндекс Маркет</h3>
                  <p className="text-muted mb-0">
                    Юридическое лицо: <strong>{selectedLegalEntity.title}</strong> (ИНН: {selectedLegalEntity.inn})
                  </p>
                </div>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={handleClearSelectedMarketplace}
                  >
                    <i className="bi bi-x-circle me-1"></i>Скрыть
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {statusChangeError && (
                  <Alert variant="danger" className="mb-3" dismissible onClose={() => setStatusChangeError(null)}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {statusChangeError}
                  </Alert>
                )}
                
                {statusChangeSuccess && (
                  <Alert variant="success" className="mb-3" dismissible onClose={() => setStatusChangeSuccess(false)}>
                    <i className="bi bi-check-circle me-2"></i>
                    Действие успешно выполнено
                  </Alert>
                )}
                
                <div className="mb-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleChangeYandexOrderStatus}
                    disabled={selectedYmOrders.size === 0 || statusChangeLoading}
                    className="me-2"
                  >
                    {statusChangeLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-right-circle me-2"></i>
                        {getYandexStatusButtonText(getSelectedYandexOrdersStatus())} ({selectedYmOrders.size})
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => { if (selectedLegalEntity) loadYandexMarketOrders(selectedLegalEntity); }}
                    className="me-2"
                  >
                    <i className="bi bi-arrow-repeat me-1"></i> Обновить
                  </Button>
                </div>

                {/* Кнопки фильтрации по статусам Яндекс Маркет */}
                <div className="mb-3">
                  <ButtonGroup>
                    <Button
                      variant={ymStatusFilter === null ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setYmStatusFilter(null)}
                    >
                      Все
                    </Button>
                    <Button
                      variant={ymStatusFilter === 'new' ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setYmStatusFilter('new')}
                    >
                      Новые
                    </Button>
                    <Button
                      variant={ymStatusFilter === 'processing' ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setYmStatusFilter('processing')}
                    >
                      В обработке
                    </Button>
                    <Button
                      variant={ymStatusFilter === 'ready_to_ship' ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setYmStatusFilter('ready_to_ship')}
                    >
                      Готовы к отправке
                    </Button>
                    <Button
                      variant={ymStatusFilter === 'shipped' ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setYmStatusFilter('shipped')}
                    >
                      Отправлены
                    </Button>
                  </ButtonGroup>
                </div>

                {ymOrdersLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Загрузка заказов...</p>
                  </div>
                ) : ymOrdersError ? (
                  <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {ymOrdersError}
                  </Alert>
                ) : ymOrders.length === 0 ? (
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    Заказы не найдены
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover bordered striped>
                      <thead>
                        <tr>
                          <th>
                            <Form.Check
                              type="checkbox"
                              checked={selectAllYm}
                              onChange={handleSelectAllYm}
                              aria-label="Выбрать все заказы"
                            />
                          </th>
                          <SortableColumnHeader
                            column="order_id"
                            title="ID заказа"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                          <SortableColumnHeader
                            column="created_at"
                            title="Дата создания"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                            isDateColumn={true}
                          />
                          <SortableColumnHeader
                            column="name"
                            title="Название товара"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                          <SortableColumnHeader
                            column="shop_sku"
                            title="Код товара"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                          <SortableColumnHeader
                            column="status"
                            title="Статус"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                          <SortableColumnHeader
                            column="price"
                            title="Стоимость"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                          <SortableColumnHeader
                            column="region"
                            title="Регион"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                          <SortableColumnHeader
                            column="delivery_type"
                            title="Способ доставки"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                          <SortableColumnHeader
                            column="customer_name"
                            title="Клиент"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                          <SortableColumnHeader
                            column="delivery_address"
                            title="Адрес доставки"
                            currentSortColumn={ymSortColumn}
                            currentSortDirection={ymSortDirection}
                            onSort={handleYmSort}
                          />
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentPageYmOrders().map((order, index) => (
                          <tr key={order.id || order.order_id || index}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedYmOrders.has(order.id || order.order_id || index)}
                                onChange={() => handleSelectYmOrder(order.id || order.order_id || index)}
                                aria-label={`Выбрать заказ ${order.id || order.order_id || index}`}
                              />
                            </td>
                            <td>{order.order_id || '—'}</td>
                            <td>{formatDate(order.created_at || order.created_date)}</td>
                            <td>{order.name || order.product_name || '—'}</td>
                            <td>{order.shop_sku || order.offer_id || '—'}</td>
                            <td>
                              <Badge bg={getBadgeColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </td>
                            <td>{formatPrice(order.price || order.total_price)}</td>
                            <td>{order.region || order.delivery_region || '—'}</td>
                            <td>{order.delivery_type || order.delivery_service_name || '—'}</td>
                            <td>{order.customer_name || '—'}</td>
                            <td>{order.delivery_address || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {ymOrders.length > 0 && (
                      <PaginationComponent
                        currentPage={ymCurrentPage}
                        totalPages={Math.ceil(ymOrders.length / ymItemsPerPage)}
                        onPageChange={(page) => setYmCurrentPage(page)}
                      />
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Dashboard; 