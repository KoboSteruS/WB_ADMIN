import { jsPDF } from 'jspdf';

declare module 'jspdf-autotable' {
  interface RowInput {
    [key: string]: any;
  }

  interface CellInput {
    [key: string]: any;
  }

  interface ColumnInput {
    [key: string]: any;
  }

  interface StylesProps {
    font?: string;
    fontStyle?: string;
    fontSize?: number;
    cellPadding?: number;
    lineColor?: number[];
    lineWidth?: number;
    fontWeight?: string;
    fillColor?: number[];
    textColor?: number[];
    valign?: string;
    halign?: string;
    fillStyle?: string;
    rowHeight?: number;
    minCellWidth?: number;
    minCellHeight?: number;
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    cellWidth?: 'auto' | 'wrap' | number;
  }

  interface UserOptions {
    columns?: ColumnInput[];
    head?: RowInput[];
    body?: RowInput[];
    foot?: RowInput[];
    theme?: 'striped' | 'grid' | 'plain' | string;
    startY?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineWidth?: number;
    tableLineColor?: number[];
    tableId?: string;
    styles?: StylesProps;
    bodyStyles?: StylesProps;
    headStyles?: StylesProps;
    footStyles?: StylesProps;
    alternateRowStyles?: StylesProps;
    columnStyles?: { [key: string]: StylesProps };
    didParseCell?: (data: CellHookData) => void;
    willDrawCell?: (data: CellHookData) => void;
    didDrawCell?: (data: CellHookData) => void;
    didDrawPage?: (data: HookData) => void;
    [key: string]: any;
  }

  interface CellHookData {
    cell: CellInput;
    row: RowInput;
    column: ColumnInput;
    section: 'head' | 'body' | 'foot';
    pageNumber: number;
    pageCount: number;
    settings: any;
    doc: jsPDF;
    cursor: { x: number; y: number };
    [key: string]: any;
  }

  interface HookData {
    table: any;
    pageNumber: number;
    pageCount: number;
    settings: any;
    doc: jsPDF;
    cursor: { x: number; y: number };
    [key: string]: any;
  }

  function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
  export = autoTable;
} 