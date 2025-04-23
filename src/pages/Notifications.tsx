import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab, Badge } from 'react-bootstrap';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'danger';
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Обновление системы',
      message: 'Мы выпустили новое обновление с улучшенной аналитикой и исправлением ошибок.',
      date: '15.04.2023',
      isRead: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Изменение статуса заказа',
      message: 'Статус вашего заказа №12345 изменился на "Доставлен".',
      date: '14.04.2023',
      isRead: false,
      type: 'success'
    },
    {
      id: 3,
      title: 'Проблема с подключением',
      message: 'Обнаружена проблема с подключением к Ozon API. Пожалуйста, проверьте настройки интеграции.',
      date: '13.04.2023',
      isRead: true,
      type: 'warning'
    },
    {
      id: 4,
      title: 'Ошибка обновления данных',
      message: 'Произошла ошибка при обновлении данных с Wildberries. Повторная попытка будет выполнена автоматически.',
      date: '12.04.2023',
      isRead: true,
      type: 'danger'
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  const getNotificationsByType = (type?: 'info' | 'success' | 'warning' | 'danger') => {
    return type 
      ? notifications.filter(notification => notification.type === type)
      : notifications;
  };

  const getTypeIcon = (type: 'info' | 'success' | 'warning' | 'danger') => {
    switch (type) {
      case 'info':
        return <i className="bi bi-info-circle text-info"></i>;
      case 'success':
        return <i className="bi bi-check-circle text-success"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle text-warning"></i>;
      case 'danger':
        return <i className="bi bi-x-circle text-danger"></i>;
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="page-title">Уведомления</h1>
              <p className="text-muted">Все ваши системные уведомления</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={markAllAsRead}
                disabled={getUnreadCount() === 0}
              >
                Отметить все как прочитанные
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={deleteAllNotifications}
                disabled={notifications.length === 0}
              >
                Удалить все
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="p-0">
              <Tab.Container defaultActiveKey="all">
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="all">
                      Все 
                      {notifications.length > 0 && (
                        <Badge bg="secondary" className="ms-2">{notifications.length}</Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="unread">
                      Непрочитанные
                      {getUnreadCount() > 0 && (
                        <Badge bg="primary" className="ms-2">{getUnreadCount()}</Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="info">Информация</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="success">Успешно</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="warning">Предупреждения</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="danger">Ошибки</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="all">
                    {renderNotifications(notifications)}
                  </Tab.Pane>
                  <Tab.Pane eventKey="unread">
                    {renderNotifications(notifications.filter(notification => !notification.isRead))}
                  </Tab.Pane>
                  <Tab.Pane eventKey="info">
                    {renderNotifications(getNotificationsByType('info'))}
                  </Tab.Pane>
                  <Tab.Pane eventKey="success">
                    {renderNotifications(getNotificationsByType('success'))}
                  </Tab.Pane>
                  <Tab.Pane eventKey="warning">
                    {renderNotifications(getNotificationsByType('warning'))}
                  </Tab.Pane>
                  <Tab.Pane eventKey="danger">
                    {renderNotifications(getNotificationsByType('danger'))}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Header>
          </Card>
        </Col>
      </Row>
    </Container>
  );

  function renderNotifications(notifications: Notification[]) {
    if (notifications.length === 0) {
      return (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-bell-slash fs-1 d-block mb-3"></i>
          <p>Нет уведомлений</p>
        </div>
      );
    }

    return (
      <div className="notification-list">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item p-3 ${!notification.isRead ? 'unread' : ''}`}
          >
            <div className="d-flex">
              <div className="notification-icon me-3">
                {getTypeIcon(notification.type)}
              </div>
              <div className="notification-content flex-grow-1">
                <div className="d-flex justify-content-between">
                  <h6 className="mb-1">{notification.title}</h6>
                  <small className="text-muted">{notification.date}</small>
                </div>
                <p className="mb-0">{notification.message}</p>
              </div>
              <div className="notification-actions ms-3 d-flex">
                {!notification.isRead && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 me-3 text-muted"
                    onClick={() => markAsRead(notification.id)}
                    title="Отметить как прочитанное"
                  >
                    <i className="bi bi-check-circle"></i>
                  </Button>
                )}
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 text-danger"
                  onClick={() => deleteNotification(notification.id)}
                  title="Удалить"
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default Notifications; 