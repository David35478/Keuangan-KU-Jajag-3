export interface DataItem {
  id: string;
  name: string;
  value: number;
  category?: string;
  createdAt: string;
}

export interface SummaryStats {
  totalSum: number;
  count: number;
  average: number;
  highest: number;
}

export enum DataCategory {
  GENERAL = 'Umum',
  FINANCE = 'Keuangan',
  INVENTORY = 'Inventaris',
  SALES = 'Penjualan',
}