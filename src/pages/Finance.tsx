import React from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup } from 'react-bootstrap';

const Finance: React.FC = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Финансы</h1>
          <p className="text-muted">Управление финансами и платежами</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Баланс</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className="mb-3">0 ₽</h2>
              <div className="d-grid gap-2">
                <Button variant="primary">
                  Пополнить баланс
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Пополнить баланс</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Сумма пополнения</Form.Label>
                  <InputGroup>
                    <Form.Control type="number" placeholder="Введите сумму" min="100" />
                    <InputGroup.Text>₽</InputGroup.Text>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Минимальная сумма пополнения — 100 ₽
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Способ оплаты</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-secondary" className="payment-method-btn">
                      <i className="bi bi-credit-card me-2"></i>
                      Банковская карта
                    </Button>
                    <Button variant="outline-secondary" className="payment-method-btn">
                      <i className="bi bi-wallet me-2"></i>
                      ЮMoney
                    </Button>
                    <Button variant="outline-secondary" className="payment-method-btn">
                      <i className="bi bi-bank me-2"></i>
                      СБП
                    </Button>
                  </div>
                </Form.Group>
                <Button variant="primary">
                  Перейти к оплате
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">История операций</h5>
              <Form.Select style={{ width: 'auto' }}>
                <option>За все время</option>
                <option>За последний месяц</option>
                <option>За последнюю неделю</option>
              </Form.Select>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Операция</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="text-center py-5 text-muted">
                        <i className="bi bi-wallet2 fs-1 d-block mb-3"></i>
                        У вас пока нет операций
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Finance; 