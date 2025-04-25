import React from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Компонент главной страницы Яндекс Маркета
 */
const YandexMarket: React.FC = () => {
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Яндекс Маркет</h1>
          <p className="text-muted">Интеграция с Яндекс Маркетом</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h2 className="card-title mb-0">Функциональность Яндекс Маркета</h2>
            </Card.Header>
            <Card.Body>
              <p>
                Используйте эту интеграцию для работы с Яндекс Маркетом. Управляйте токенами,
                получайте информацию о заказах, товарах и аналитику по продажам.
              </p>

              <h3 className="mt-4 mb-3">Доступные возможности</h3>
              <Row>
                <Col md={6} lg={3} className="mb-4">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <i className="bi bi-key fs-1 mb-3 text-primary"></i>
                      <h5>Управление токенами</h5>
                      <p className="text-muted">
                        Добавление и настройка токенов для интеграции с API Яндекс Маркета
                      </p>
                      <Link to="/marketplace-settings/yandex-market" className="btn btn-primary mt-2">
                        Перейти к настройкам
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3} className="mb-4">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <i className="bi bi-box-seam fs-1 mb-3 text-secondary"></i>
                      <h5>Управление заказами</h5>
                      <p className="text-muted">
                        Просмотр, управление и аналитика заказов из Яндекс Маркета
                      </p>
                      <button className="btn btn-secondary mt-2" disabled>
                        В разработке
                      </button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3} className="mb-4">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <i className="bi bi-cart3 fs-1 mb-3 text-secondary"></i>
                      <h5>Управление товарами</h5>
                      <p className="text-muted">
                        Управление каталогом товаров на Яндекс Маркете
                      </p>
                      <button className="btn btn-secondary mt-2" disabled>
                        В разработке
                      </button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3} className="mb-4">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <i className="bi bi-graph-up fs-1 mb-3 text-secondary"></i>
                      <h5>Аналитика продаж</h5>
                      <p className="text-muted">
                        Статистика и аналитика продаж на Яндекс Маркете
                      </p>
                      <button className="btn btn-secondary mt-2" disabled>
                        В разработке
                      </button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default YandexMarket; 