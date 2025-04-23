import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Tab } from 'react-bootstrap';

const AccountSettings: React.FC = () => {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Обработка отправки формы
      console.log('Форма отправлена');
    }

    setValidated(true);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Настройки аккаунта</h1>
          <p className="text-muted">Управление вашими персональными данными и настройками</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Tab.Container defaultActiveKey="profile">
                <Row>
                  <Col md={3} lg={2}>
                    <Nav variant="pills" className="flex-column mb-4">
                      <Nav.Item>
                        <Nav.Link eventKey="profile">Профиль</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="security">Безопасность</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="notifications">Уведомления</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="api">API Ключи</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col md={9} lg={10}>
                    <Tab.Content>
                      <Tab.Pane eventKey="profile">
                        <h4 className="mb-4">Информация профиля</h4>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="firstName">
                                <Form.Label>Имя</Form.Label>
                                <Form.Control
                                  required
                                  type="text"
                                  placeholder="Введите имя"
                                  defaultValue="Иван"
                                />
                                <div className="invalid-feedback">
                                  Пожалуйста, введите имя.
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="lastName">
                                <Form.Label>Фамилия</Form.Label>
                                <Form.Control
                                  required
                                  type="text"
                                  placeholder="Введите фамилию"
                                  defaultValue="Иванов"
                                />
                                <div className="invalid-feedback">
                                  Пожалуйста, введите фамилию.
                                </div>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  required
                                  type="email"
                                  placeholder="Введите email"
                                  defaultValue="ivan@example.com"
                                />
                                <div className="invalid-feedback">
                                  Пожалуйста, введите корректный email.
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="phone">
                                <Form.Label>Телефон</Form.Label>
                                <Form.Control
                                  type="tel"
                                  placeholder="Введите номер телефона"
                                  defaultValue="+7 (900) 123-45-67"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12} className="mb-3">
                              <Form.Group controlId="company">
                                <Form.Label>Компания</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Введите название компании"
                                  defaultValue="ООО Пример"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Button type="submit" variant="primary">
                            Сохранить изменения
                          </Button>
                        </Form>
                      </Tab.Pane>
                      <Tab.Pane eventKey="security">
                        <h4 className="mb-4">Безопасность</h4>
                        <Form>
                          <h5 className="mb-3">Изменение пароля</h5>
                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="currentPassword">
                                <Form.Label>Текущий пароль</Form.Label>
                                <Form.Control
                                  type="password"
                                  placeholder="Введите текущий пароль"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="newPassword">
                                <Form.Label>Новый пароль</Form.Label>
                                <Form.Control
                                  type="password"
                                  placeholder="Введите новый пароль"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="confirmPassword">
                                <Form.Label>Подтверждение пароля</Form.Label>
                                <Form.Control
                                  type="password"
                                  placeholder="Подтвердите новый пароль"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Button type="submit" variant="primary">
                            Обновить пароль
                          </Button>
                          
                          <hr className="my-4" />
                          
                          <h5 className="mb-3">Двухфакторная аутентификация</h5>
                          <Form.Check 
                            type="switch"
                            id="2fa-switch"
                            label="Включить двухфакторную аутентификацию"
                            className="mb-3"
                          />
                          <p className="text-muted">
                            Повысьте безопасность вашего аккаунта с помощью двухфакторной аутентификации.
                            После включения, вам потребуется ввести код из приложения аутентификации при входе.
                          </p>
                          <Button variant="outline-primary">
                            Настроить 2FA
                          </Button>
                        </Form>
                      </Tab.Pane>
                      <Tab.Pane eventKey="notifications">
                        <h4 className="mb-4">Настройки уведомлений</h4>
                        <Form>
                          <h5 className="mb-3">Email уведомления</h5>
                          <Form.Check 
                            type="switch"
                            id="email-orders"
                            label="Уведомления о заказах"
                            defaultChecked
                            className="mb-2"
                          />
                          <Form.Check 
                            type="switch"
                            id="email-stock"
                            label="Оповещения о запасах"
                            defaultChecked
                            className="mb-2"
                          />
                          <Form.Check 
                            type="switch"
                            id="email-reports"
                            label="Еженедельные отчеты"
                            defaultChecked
                            className="mb-2"
                          />
                          <Form.Check 
                            type="switch"
                            id="email-marketing"
                            label="Маркетинговые рассылки"
                            className="mb-4"
                          />
                          
                          <h5 className="mb-3">Уведомления в приложении</h5>
                          <Form.Check 
                            type="switch"
                            id="app-orders"
                            label="Уведомления о заказах"
                            defaultChecked
                            className="mb-2"
                          />
                          <Form.Check 
                            type="switch"
                            id="app-stock"
                            label="Оповещения о запасах"
                            defaultChecked
                            className="mb-2"
                          />
                          <Form.Check 
                            type="switch"
                            id="app-updates"
                            label="Обновления системы"
                            defaultChecked
                            className="mb-4"
                          />
                          
                          <Button type="submit" variant="primary">
                            Сохранить настройки
                          </Button>
                        </Form>
                      </Tab.Pane>
                      <Tab.Pane eventKey="api">
                        <h4 className="mb-4">API Ключи</h4>
                        <p>
                          Создавайте и управляйте API ключами для интеграции с нашей системой.
                        </p>
                        <div className="mb-4">
                          <Button variant="primary" className="mb-3">
                            <i className="bi bi-plus me-2"></i>
                            Создать новый API ключ
                          </Button>
                        </div>
                        <Card className="border mb-4">
                          <Card.Body className="text-center py-5">
                            <i className="bi bi-key-fill fs-1 mb-3 text-muted"></i>
                            <p className="mb-0">У вас пока нет API ключей</p>
                          </Card.Body>
                        </Card>
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountSettings; 