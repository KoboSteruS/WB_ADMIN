import { ReportHandler } from 'web-vitals';

// Поскольку web-vitals не установлен, создадим заглушку, которая ничего не делает
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  // Заглушка, которая в обычном случае бы измеряла метрики
  console.log('Web Vitals reporting is disabled in development mode');
  
  // Пустые функции для метрик
  const noop = () => {};
  
  // Если onPerfEntry предоставлен и это функция
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Имитируем вызов метрик
    onPerfEntry({
      name: 'FCP',
      delta: 0,
      id: 'mock-id',
      value: 0
    });
  }
};

export default reportWebVitals;
