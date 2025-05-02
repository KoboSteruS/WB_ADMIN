import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Table, Button } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

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
   * Переход на страницу заказов WB для выбранного юр. лица
   * @param entity - юридическое лицо
   */
  const handleViewWbOrders = (entity: LegalEntity) => {
    // Сохраняем ID и данные юр. лица в localStorage для использования на странице заказов
    localStorage.setItem('selectedLegalEntityId', entity.id);
    localStorage.setItem('selectedLegalEntityData', JSON.stringify(entity));
    
    // Переходим на страницу заказов WB
    navigate('/marketplace-settings/wildberries/orders');
  };

  /**
   * Переход на страницу заказов Яндекс Маркета для выбранного юр. лица
   * @param entity - юридическое лицо
   */
  const handleViewYandexMarketOrders = (entity: LegalEntity) => {
    // Сохраняем ID и данные юр. лица в localStorage для использования на странице заказов
    localStorage.setItem('selectedLegalEntityId', entity.id);
    localStorage.setItem('selectedLegalEntityData', JSON.stringify(entity));
    
    // Переходим на страницу заказов Яндекс Маркета
    navigate('/marketplace-settings/yandex-market/orders');
  };

  /**
   * Переход на страницу заказов Ozon для выбранного юр. лица
   * @param entity - юридическое лицо
   */
  const handleViewOzonOrders = (entity: LegalEntity) => {
    // Сохраняем ID и данные юр. лица в localStorage для использования на странице заказов
    localStorage.setItem('selectedLegalEntityId', entity.id);
    localStorage.setItem('selectedLegalEntityData', JSON.stringify(entity));
    
    // Переходим на страницу заказов Ozon
    navigate('/marketplace-settings/ozon/orders');
  };

  /**
   * Переход на страницу юридических лиц для их редактирования
   */
  const handleManageLegalEntities = () => {
    navigate('/legal-entities');
  };

  return (
    <Container fluid className="dashboard-container">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Панель управления</h1>
          <p className="text-muted">Обзор ваших маркетплейсов и продаж</p>
        </Col>
      </Row>


      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-title mb-0">Юридические лица</h2>
            <Button variant="primary" onClick={handleManageLegalEntities}>
              <i className="bi bi-gear me-2"></i>
              Управление юр. лицами
            </Button>
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
                {legalEntities.map((entity) => (
                  <tr key={entity.id}>
                    <td>{entity.id}</td>
                    <td>{entity.title}</td>
                    <td>{entity.inn}</td>
                    <td>
                      <div className="btn-group" style={{ gap: '15px' }}>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleViewWbOrders(entity)}
                        style={{ backgroundColor: 'purple', border: '2px solid purple'}}
                      >
                        <i className="bi bi-box me-1"></i>
                        Wildberries
                      </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleViewOzonOrders(entity)}
                        >
                          <i className="bi bi-box-arrow-right me-1"></i>
                          OZON
                        </Button>
                        <Button 
                          variant="warning" 
                          size="sm"
                          onClick={() => handleViewYandexMarketOrders(entity)}
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
    </Container>
  );
};

export default Dashboard; 