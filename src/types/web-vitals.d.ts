/**
 * Временный файл объявления типов для web-vitals
 * Позволяет избежать ошибок импорта при отсутствии установленного npm-пакета
 */

declare module 'web-vitals' {
  export type ReportHandler = (metric: {
    name: string;
    delta: number;
    id: string;
    value: number;
  }) => void;

  export const getCLS: (onReport: ReportHandler, reportAllChanges?: boolean) => void;
  export const getFCP: (onReport: ReportHandler) => void;
  export const getFID: (onReport: ReportHandler) => void;
  export const getLCP: (onReport: ReportHandler, reportAllChanges?: boolean) => void;
  export const getTTFB: (onReport: ReportHandler) => void;
} 