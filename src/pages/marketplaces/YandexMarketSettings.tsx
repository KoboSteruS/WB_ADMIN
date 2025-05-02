import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import YandexMarketTokens from './YandexMarketTokens';

/**
 * Компонент настроек Яндекс Маркета
 */
const YandexMarketSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tokens');

  // Рендер содержимого вкладки
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tokens':
        return <YandexMarketTokens />;
      case 'orders':
      case 'products':
      case 'analytics':
      default:
        return (
          <div className="p-4 text-center text-muted">
            <p>Функционал находится в разработке...</p>
          </div>
        );
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Токены Яндекс Маркета</h1>
          <p className="text-muted">Управление токенами для интеграции с Яндекс Маркетом</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {renderTabContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default YandexMarketSettings; 