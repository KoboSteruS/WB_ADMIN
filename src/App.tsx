import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
// import SimpleHeader from './components/SimpleHeader';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MarketplaceSettings from './pages/MarketplaceSettings';
import Wildberries from './pages/marketplaces/Wildberries';
import Ozon from './pages/marketplaces/Ozon';
import YandexMarket from './pages/marketplaces/YandexMarket';
import YandexMarketSettings from './pages/marketplaces/YandexMarketSettings';
import WildberriesTokens from './pages/marketplaces/WildberriesTokens';
import WildberriesOrders from './pages/marketplaces/WildberriesOrders';
import OzonTokens from './pages/marketplaces/OzonTokens';
import OzonOrders from './pages/marketplaces/OzonOrders';
import YandexMarketOrders from './pages/marketplaces/YandexMarketOrders';
import TokensPage from './pages/marketplaces/TokensPage';
import AccountSettings from './pages/AccountSettings';
import LegalEntities from './pages/LegalEntities';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { authService } from './services/auth/auth-service';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверка авторизации при загрузке через authService или localStorage
    const isAuthAPI = authService.isAuthenticated();
    const isAuthLocal = localStorage.getItem('isAuthenticated') === 'true';
    const hasAuthToken = !!localStorage.getItem('auth_token');
    setIsAuthenticated(isAuthAPI || isAuthLocal || hasAuthToken);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Компонент для защищенных маршрутов
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // Проверяем авторизацию снова для защищенных маршрутов
    const isAuthAPI = authService.isAuthenticated();
    const isAuthLocal = localStorage.getItem('isAuthenticated') === 'true';
    const hasAuthToken = !!localStorage.getItem('auth_token');
    const isAuth = isAuthAPI || isAuthLocal || hasAuthToken;
    
    if (!isAuth) {
      // Вместо манипуляций с history, просто редиректим на страницу логина
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login />
          } />
          <Route path="/test-orders" element={<WildberriesOrders />} />
          <Route path="*" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header toggleSidebar={toggleSidebar} />
                <div className="content-container">
                  <Sidebar isOpen={sidebarOpen} />
                  <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/marketplace-settings" element={<MarketplaceSettings />} />
                      <Route path="/marketplace-settings/wildberries" element={<Wildberries />} />
                      <Route path="/marketplace-settings/wildberries/tokens" element={<WildberriesTokens />} />
                      <Route path="/marketplace-settings/wildberries/orders" element={<WildberriesOrders />} />
                      <Route path="/test-orders" element={<WildberriesOrders />} />
                      <Route path="/marketplace-settings/ozon" element={<Ozon />} />
                      <Route path="/marketplace-settings/ozon/tokens" element={<OzonTokens />} />
                      <Route path="/marketplace-settings/ozon/orders" element={<OzonOrders />} />
                      <Route path="/marketplace-settings/yandex-market" element={<YandexMarketSettings />} />
                      <Route path="/marketplace-settings/yandex-market/orders" element={<YandexMarketOrders />} />
                      <Route path="/account-settings" element={<AccountSettings />} />
                      <Route path="/legal-entities" element={<LegalEntities />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
