/**
 * Декларации типов для модулей, у которых нет встроенных типов TypeScript
 */

// Декларация для file-saver
declare module 'file-saver'; 

/**
 * Объявление типов для модуля pdf-lib
 */
declare module 'pdf-lib' {
  export class PDFDocument {
    static create(): Promise<PDFDocument>;
    static load(bytes: ArrayBuffer): Promise<PDFDocument>;
    getPageCount(): number;
    copyPages(pdf: PDFDocument, pageIndices: number[]): Promise<PDFPage[]>;
    addPage(page: PDFPage): void;
    save(): Promise<Uint8Array>;
  }
  
  export class PDFPage {
    // Базовая типизация для страницы PDF
  }
} 