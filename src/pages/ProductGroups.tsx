import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

const ProductGroups: React.FC = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Группировка товаров</h1>
          <p className="text-muted">Управление группами товаров для удобного анализа</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Раздел находится в разработке. Скоро здесь будет доступна группировка товаров.
          </Alert>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Группы товаров</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="text-center p-5 text-muted">
                <i className="bi bi-boxes fs-1"></i>
                <p className="mt-3">Данные будут доступны после интеграции с маркетплейсами</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductGroups; 