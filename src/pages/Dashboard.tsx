import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Получаем токен из localStorage при монтировании компонента
    const token = localStorage.getItem('auth_token');
    setAuthToken(token);
  }, []);

  return (
    <Container fluid className="dashboard-container">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Панель управления</h1>
          <p className="text-muted">Обзор ваших маркетплейсов и продаж</p>
        </Col>
      </Row>

      {authToken && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" className="mb-0">
              <i className="bi bi-key me-2"></i>
              <strong>Токен авторизации:</strong> {authToken}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col>
          <Alert variant="info" className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            У вас нет добавленных аккаунтов. Вы видите демо данные.
          </Alert>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6} className="mb-4 mb-lg-0">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Количество</h5>
                <small className="text-muted">данные за 30 дней</small>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">C 17.03.2023 по 15.04.2023</small>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-placeholder" style={{ height: '250px' }}>
                <div className="chart-info">
                  <div className="chart-legend">
                    <span className="chart-legend-item">
                      <span className="chart-legend-color bg-success"></span>
                      <span className="chart-legend-text">Заказы</span>
                    </span>
                    <span className="chart-legend-item">
                      <span className="chart-legend-color bg-danger"></span>
                      <span className="chart-legend-text">Продажи</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Сумма</h5>
                <small className="text-muted">данные за 30 дней</small>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">C 17.03.2023 по 15.04.2023</small>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-placeholder" style={{ height: '250px' }}>
                <div className="chart-info">
                  <div className="chart-legend">
                    <span className="chart-legend-item">
                      <span className="chart-legend-color bg-success"></span>
                      <span className="chart-legend-text">Заказы</span>
                    </span>
                    <span className="chart-legend-item">
                      <span className="chart-legend-color bg-danger"></span>
                      <span className="chart-legend-text">Продажи</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4 mb-lg-0">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Процент выкупа</h5>
                <small className="text-muted">данные за 30 дней</small>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-placeholder" style={{ height: '250px' }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Доля по категории</h5>
                <small className="text-muted">данные за 30 дней</small>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-placeholder" style={{ height: '250px' }}></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 