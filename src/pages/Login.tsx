import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth/auth-service';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Проверка тестовых учетных данных для локальной разработки
      if (username === 'testuser' && password === 'testpass123') {
        // Сохраняем тестовые данные в localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('auth_token', 'd65c2b3ed3a643341c8f2b7f380fb5a12dac826f');
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          username: 'testuser',
          name: 'Тестовый пользователь',
          role: 'admin'
        }));
        
        // Перенаправляем пользователя
        window.history.replaceState(null, '', '/');
        navigate('/');
        return;
      }
      
      // Если тестовые данные не подошли, пытаемся использовать обычный API
      await authService.login(username, password, '/');
      // После успешного входа нас автоматически перенаправит на главную
    } catch (err) {
      console.error('Ошибка авторизации:', err);
      setError('Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="justify-content-center w-100">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h3 className="mb-0">WB Admin</h3>
              <p className="mb-0">Система управления маркетплейсами</p>
            </Card.Header>
            <Card.Body className="px-4 py-5">
              <h4 className="mb-4 text-center">Вход в систему</h4>

              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleLoginSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    placeholder="Введите имя пользователя"
                    disabled={loading}
                  />
                  <div className="invalid-feedback">
                    Пожалуйста, введите имя пользователя.
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    disabled={loading}
                  />
                  <div className="invalid-feedback">
                    Пожалуйста, введите пароль.
                  </div>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                  </Button>
                </div>
                
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Для входа используйте:
                    <br />
                    Имя пользователя: testuser
                    <br />
                    Пароль: testpass123
                  </small>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="py-3 border-0 text-center bg-light">
              <div className="text-muted">
                Техническая поддержка: support@wb-admin.com
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 