/**
 * Компонент фильтрации и сортировки заказов Wildberries
 */
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { WildberriesToken } from '../../types/wildberries';
import { getContextLogger } from '../../utils/logger';

const logger = getContextLogger('OrdersFilter');

/**
 * Интерфейс фильтров заказов
 */
export interface OrderFilters {
  status?: string;
  tokenId?: number;
  dateFrom?: string;
  dateTo?: string;
  orderNumber?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Интерфейс пропсов компонента
 */
interface OrdersFilterProps {
  tokens: WildberriesToken[];
  onFilter: (filters: OrderFilters) => void;
  loading?: boolean;
  initialFilters?: OrderFilters;
}

/**
 * Компонент фильтрации заказов
 */
const OrdersFilter: React.FC<OrdersFilterProps> = ({ 
  tokens, 
  onFilter, 
  loading = false,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // При инициализации компонента с начальными фильтрами
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
      
      // Если есть начальные фильтры, автоматически разворачиваем панель
      if (Object.values(initialFilters).some(value => value !== undefined && value !== '')) {
        setExpanded(true);
      }
    }
  }, [initialFilters]);

  /**
   * Обработчик изменения значения фильтра
   */
  const handleFilterChange = (field: keyof OrderFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    logger.debug('Изменение фильтра', { field, value });
  };

  /**
   * Обработчик сброса фильтров
   */
  const handleReset = () => {
    const resetFilters: OrderFilters = {
      status: '',
      tokenId: undefined,
      dateFrom: '',
      dateTo: '',
      orderNumber: '',
      sortBy: '',
      sortDirection: 'desc'
    };
    
    setFilters(resetFilters);
    onFilter(resetFilters);
    
    logger.debug('Сброс фильтров');
  };

  /**
   * Обработчик применения фильтров
   */
  const handleApply = () => {
    // Убираем пустые значения из фильтров
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof OrderFilters] = value;
      }
      return acc;
    }, {} as OrderFilters);
    
    onFilter(cleanFilters);
    
    logger.debug('Применение фильтров', cleanFilters);
  };

  /**
   * Переключение состояния развернутости панели фильтров
   */
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="mb-4">
      <Card.Header 
        className="d-flex justify-content-between align-items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <h5 className="mb-0">Фильтры и сортировка</h5>
        <span className="text-primary">
          {expanded ? '▲ Свернуть' : '▼ Развернуть'}
        </span>
      </Card.Header>
      
      {expanded && (
        <Card.Body>
          <Form>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="status">
                  <Form.Label>Статус заказа</Form.Label>
                  <Form.Select
                    value={filters.status || ''}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('status', e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Все статусы</option>
                    <option value="new">Новый</option>
                    <option value="confirmed">Подтвержден</option>
                    <option value="assembly">В сборке</option>
                    <option value="assembled">Собран</option>
                    <option value="ready_to_shipment">Готов к отправке</option>
                    <option value="shipped">Отправлен</option>
                    <option value="delivered">Доставлен</option>
                    <option value="canceled">Отменен</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group controlId="tokenId">
                  <Form.Label>Токен Wildberries</Form.Label>
                  <Form.Select
                    value={filters.tokenId || ''}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('tokenId', e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={loading}
                  >
                    <option value="">Все токены</option>
                    {tokens.map((token) => (
                      <option key={token.id} value={token.id}>
                        {token.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group controlId="orderNumber">
                  <Form.Label>Номер заказа</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Введите номер заказа"
                    value={filters.orderNumber || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('orderNumber', e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="dateFrom">
                  <Form.Label>Дата от</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('dateFrom', e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group controlId="dateTo">
                  <Form.Label>Дата до</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('dateTo', e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group controlId="sortBy">
                  <Form.Label>Сортировка</Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      value={filters.sortBy || ''}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortBy', e.target.value)}
                      disabled={loading}
                      className="me-2"
                    >
                      <option value="">Без сортировки</option>
                      <option value="created_at">По дате создания</option>
                      <option value="order_id">По номеру заказа</option>
                      <option value="price">По стоимости</option>
                    </Form.Select>
                    
                    <Form.Select
                      value={filters.sortDirection || 'desc'}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortDirection', e.target.value as 'asc' | 'desc')}
                      disabled={loading || !filters.sortBy}
                      style={{ width: '100px' }}
                    >
                      <option value="desc">↓ Убыв</option>
                      <option value="asc">↑ Возр</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={handleReset} 
                disabled={loading}
              >
                Сбросить
              </Button>
              <Button 
                variant="primary" 
                onClick={handleApply} 
                disabled={loading}
              >
                Применить
              </Button>
            </div>
          </Form>
        </Card.Body>
      )}
    </Card>
  );
};

export default OrdersFilter; 