import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const YandexMarket: React.FC = () => {
  const [token, setToken] = useState('');
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Здесь будет логика сохранения настроек API
      console.log('Сохранение настроек Яндекс.Маркет:', { token });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }

    setValidated(true);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Настройки Яндекс.Маркет</h1>
          <p className="text-muted">Управление интеграцией с маркетплейсом Яндекс.Маркет</p>
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
              <h5 className="mb-0">API Яндекс.Маркет</h5>
            </Card.Header>
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>OAuth Token</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    value={token}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                    placeholder="Введите OAuth Token"
                  />
                  <div className="invalid-feedback">
                    Пожалуйста, введите OAuth Token.
                  </div>
                  <Form.Text className="text-muted">
                    OAuth Token можно получить в Developer кабинете Яндекса.
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
              <h6>Как получить доступ к API Яндекс.Маркет?</h6>
              <ol>
                <li>Зарегистрируйте приложение в <a href="https://oauth.yandex.ru/" target="_blank" rel="noopener noreferrer">Яндекс OAuth</a></li>
                <li>Получите OAuth-токен с нужными правами</li>
                <li>Введите полученный токен в соответствующее поле</li>
              </ol>
              <p>Подробнее об API Яндекс.Маркет вы можете прочитать в <a href="https://yandex.ru/dev/market/partner/doc/dg/concepts/about.html" target="_blank" rel="noopener noreferrer">официальной документации</a>.</p>
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
              <p className="text-muted">Токен не настроен или не валиден.</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Возможности интеграции</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Управление товарами</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Обработка заказов</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Контроль остатков</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Аналитика продаж</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Управление скидками</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default YandexMarket; 