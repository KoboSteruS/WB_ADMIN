import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';

const Subscriptions: React.FC = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Подписки</h1>
          <p className="text-muted">Управление подписками и тарифными планами</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card className="h-100 subscription-card">
            <Card.Header className="text-center py-3">
              <h5 className="mb-0">Базовый</h5>
              <Badge bg="secondary" className="mt-2">Текущий план</Badge>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className="price mb-4">0 ₽<small className="text-muted">/мес</small></h2>
              <ul className="feature-list">
                <li>Доступ к базовой аналитике</li>
                <li>Подключение 1 маркетплейса</li>
                <li>Сбор данных 1 раз в день</li>
                <li>Базовые отчеты</li>
                <li className="text-muted">Группировка товаров</li>
                <li className="text-muted">Расширенная аналитика</li>
                <li className="text-muted">Приоритетная поддержка</li>
              </ul>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <Button variant="secondary" disabled>
                Текущий план
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 subscription-card highlighted-plan">
            <div className="popular-badge">
              Популярный
            </div>
            <Card.Header className="text-center py-3">
              <h5 className="mb-0">Профессиональный</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className="price mb-4">990 ₽<small className="text-muted">/мес</small></h2>
              <ul className="feature-list">
                <li>Доступ к расширенной аналитике</li>
                <li>Подключение до 3 маркетплейсов</li>
                <li>Сбор данных каждые 6 часов</li>
                <li>Расширенные отчеты</li>
                <li>Группировка товаров</li>
                <li>ABC-анализ товаров</li>
                <li className="text-muted">Приоритетная поддержка</li>
              </ul>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <Button variant="primary">
                Выбрать план
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 subscription-card">
            <Card.Header className="text-center py-3">
              <h5 className="mb-0">Бизнес</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className="price mb-4">2490 ₽<small className="text-muted">/мес</small></h2>
              <ul className="feature-list">
                <li>Доступ ко всем функциям</li>
                <li>Подключение неограниченного количества маркетплейсов</li>
                <li>Сбор данных каждый час</li>
                <li>Все типы отчетов</li>
                <li>Расширенная группировка товаров</li>
                <li>Полная аналитика</li>
                <li>Приоритетная поддержка 24/7</li>
              </ul>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <Button variant="outline-primary">
                Выбрать план
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">История платежей</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="text-center p-5 text-muted">
                <i className="bi bi-receipt fs-1"></i>
                <p className="mt-3">У вас пока нет истории платежей</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Subscriptions; 