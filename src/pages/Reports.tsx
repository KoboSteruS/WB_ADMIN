import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

const Reports: React.FC = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Отчеты</h1>
          <p className="text-muted">Просмотр и анализ данных по продажам</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Раздел находится в разработке. Скоро здесь будут доступны подробные отчеты.
          </Alert>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Популярные товары</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="text-center p-5 text-muted">
                <i className="bi bi-cart4 fs-1"></i>
                <p className="mt-3">Данные будут доступны после интеграции с маркетплейсами</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Динамика продаж</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="text-center p-5 text-muted">
                <i className="bi bi-graph-up fs-1"></i>
                <p className="mt-3">Данные будут доступны после интеграции с маркетплейсами</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports; 