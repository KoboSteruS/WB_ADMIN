/**
 * Модуль логирования приложения
 * Предоставляет единый интерфейс для логирования событий
 */

import winston from 'winston';

/**
 * Форматирование логов для консоли
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    // Форматирование в стиле loguru
    const metaStr = Object.keys(meta).length 
      ? ` | ${JSON.stringify(meta)}`
      : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  })
);

/**
 * Форматирование для файлов логов
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.json()
);

/**
 * Уровни логирования
 */
const logLevels = {
  error: 0,
  warn: 1, 
  info: 2,
  http: 3,
  debug: 4,
  trace: 5,
};

/**
 * Получение уровня логирования на основе окружения
 */
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' ? 'info' : 'debug';
};

/**
 * Создание экземпляра логгера
 */
const logger = winston.createLogger({
  levels: logLevels,
  level: getLogLevel(),
  transports: [
    // Вывод в консоль
    new winston.transports.Console({
      format: consoleFormat
    }),
    // Запись в файл ошибок
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    // Запись в общий файл логов
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    }),
  ],
});

/**
 * Добавляем кастомный метод trace для совместимости с loguru
 */
interface ExtendedLogger extends winston.Logger {
  trace: (message: string, meta?: object) => void;
}

(logger as ExtendedLogger).trace = (message: string, meta?: object) => {
  logger.log('trace', message, meta);
};

/**
 * Вспомогательные функции для удобства использования
 */

/**
 * Логирование с контекстом
 * @param module - Название модуля/компонента
 */
export const getContextLogger = (module: string) => {
  return {
    error: (message: string, meta?: object) => logger.error(`[${module}] ${message}`, meta),
    warn: (message: string, meta?: object) => logger.warn(`[${module}] ${message}`, meta),
    info: (message: string, meta?: object) => logger.info(`[${module}] ${message}`, meta),
    http: (message: string, meta?: object) => logger.http(`[${module}] ${message}`, meta),
    debug: (message: string, meta?: object) => logger.debug(`[${module}] ${message}`, meta),
    trace: (message: string, meta?: object) => (logger as ExtendedLogger).trace(`[${module}] ${message}`, meta),
  };
};

/**
 * Экспорт в стиле loguru
 */
export const error = logger.error.bind(logger);
export const warn = logger.warn.bind(logger);
export const info = logger.info.bind(logger);
export const http = logger.http.bind(logger);
export const debug = logger.debug.bind(logger);
export const trace = (logger as ExtendedLogger).trace.bind(logger);

/**
 * Экспорт по умолчанию
 */
export default {
  error,
  warn,
  info,
  http,
  debug,
  trace,
  getContextLogger,
  logger,
}; 