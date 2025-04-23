import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Ozon: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Здесь будет логика сохранения настроек API
      console.log('Сохранение настроек Ozon:', { apiKey });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }

    setValidated(true);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Настройки Ozon</h1>
          <p className="text-muted">Управление интеграцией с маркетплейсом Ozon</p>
        </Col>
      </Row>

      {showSuccess && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
              Настройки успешно сохранены
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">API Ozon</h5>
            </Card.Header>
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>API Key</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    value={apiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                    placeholder="Введите API Key"
                  />
                  <div className="invalid-feedback">
                    Пожалуйста, введите API Key.
                  </div>
                  <Form.Text className="text-muted">
                    API ключ можно найти в личном кабинете Ozon в разделе API интеграции.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button variant="primary" type="submit">
                    Сохранить настройки
                  </Button>
                  <Button variant="outline-secondary">
                    Проверить соединение
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Документация</h5>
            </Card.Header>
            <Card.Body>
              <h6>Как получить API ключ Ozon?</h6>
              <ol>
                <li>Войдите в личный кабинет Ozon Seller</li>
                <li>Перейдите в раздел "API интеграция"</li>
                <li>Создайте новый API-ключ</li>
                <li>Скопируйте API Key в соответствующее поле</li>
              </ol>
              <p>Подробнее об интеграции с Ozon API вы можете прочитать в <a href="https://docs.ozon.ru/api/seller" target="_blank" rel="noopener noreferrer">официальной документации</a>.</p>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Управление токенами</h5>
            </Card.Header>
            <Card.Body>
              <p>Здесь вы можете управлять несколькими токенами Ozon для разных магазинов или разных типов доступа.</p>
              <Link to="/marketplace-settings/ozon/tokens" className="btn btn-primary">
                Управление токенами Ozon
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Статус подключения</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <i className="bi bi-x-circle-fill text-danger fs-1 mb-3"></i>
              <h6>Нет подключения</h6>
              <p className="text-muted">API ключ не настроен или не валиден.</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Возможности интеграции</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Получение заказов</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Обновление остатков</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Управление ценами</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Статистика продаж</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Отчеты по комиссиям</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Ozon; 