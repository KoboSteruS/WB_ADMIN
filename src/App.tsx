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
import WildberriesTokens from './pages/marketplaces/WildberriesTokens';
import WildberriesOrders from './pages/marketplaces/WildberriesOrders';
import OzonTokens from './pages/marketplaces/OzonTokens';
import TokensPage from './pages/marketplaces/TokensPage';
import AccountSettings from './pages/AccountSettings';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { authService } from './services/auth/auth-service';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Определяем базовый путь для GitHub Pages
  const basename = process.env.NODE_ENV === 'production' ? '/WB_ADMIN' : '/';

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
      // Используем window.history.replaceState для предотвращения возврата
      window.history.replaceState(null, '', '/login');
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <ThemeProvider>
      <Router basename={basename}>
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
                      {/* Маршруты для Ozon и Yandex Market временно отключены */}
                      {/* <Route path="/marketplace-settings/ozon" element={<Ozon />} /> */}
                      {/* <Route path="/marketplace-settings/ozon/tokens" element={<OzonTokens />} /> */}
                      {/* <Route path="/marketplace-settings/yandex-market" element={<YandexMarket />} /> */}
                      <Route path="/account-settings" element={<AccountSettings />} />
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
