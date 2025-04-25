import React from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const MarketplaceSettings: React.FC = () => {
  const location = useLocation();

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Настройки маркетплейсов</h1>
          <p className="text-muted">Управление интеграциями с маркетплейсами</p>
        </Col>
      </Row>

      <Row>
        <Col md={3} lg={2} className="mb-4">
          <Nav className="flex-column marketplace-nav">
            <Nav.Link 
              as={Link} 
              to="/marketplace-settings/wildberries"
              active={location.pathname === '/marketplace-settings/wildberries'}
            >
              <div className="d-flex align-items-center">
                <div className="marketplace-icon wildberries-icon me-2">WB</div>
                <span>Wildberries</span>
              </div>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/marketplace-settings/ozon"
              active={location.pathname === '/marketplace-settings/ozon'}
            >
              <div className="d-flex align-items-center">
                <div className="marketplace-icon ozon-icon me-2">OZ</div>
                <span>Ozon</span>
              </div>
            </Nav.Link>
            <Nav.Link 
              as={Link}
              to="/marketplace-settings/yandex-market"
              active={location.pathname === '/marketplace-settings/yandex-market'}
            >
              <div className="d-flex align-items-center">
                <div className="marketplace-icon yandex-icon me-2">YM</div>
                <span>Яндекс Маркет</span>
              </div>
            </Nav.Link>
          </Nav>
        </Col>

        <Col md={9} lg={10}>
          <Card>
            <Card.Body>
              <div className="text-center p-5">
                <i className="bi bi-gear-wide-connected fs-1 mb-3 d-block"></i>
                <h4>Выберите маркетплейс</h4>
                <p className="text-muted">Пожалуйста, выберите маркетплейс из меню слева для настройки интеграции</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MarketplaceSettings; 