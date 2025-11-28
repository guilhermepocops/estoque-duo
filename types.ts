export enum UnitType {
  UNIT = 'un',
  KG = 'kg',
  LITER = 'l',
  PACK = 'pct'
}

export enum Category {
  PANTRY = 'Despensa',
  FRIDGE = 'Geladeira',
  FREEZER = 'Congelador',
  CLEANING = 'Limpeza',
  HYGIENE = 'Higiene',
  OTHER = 'Outros'
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string; // Changed from Category enum to string to support custom categories
  quantity: number;
  minQuantity: number; // Reorder point
  unit: UnitType;
  lastUpdated: string;
}

export interface PurchaseRecord {
  id: string;
  itemId: string;
  itemName: string;
  storeName: string;
  price: number;
  quantity: number;
  date: string;
  createdAt: string;
}

export type ActivityAction = 'create' | 'update' | 'delete' | 'consume' | 'restock' | 'purchase';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  message: string;
  timestamp: string;
  details?: string; // ex: "-1 un" or "Mercado A"
  isRead: boolean;
}

export type Tab = 'inventory' | 'shopping' | 'analysis' | 'activity';

export type SortOption = 'name' | 'category' | 'quantityAsc' | 'quantityDesc' | 'lastUpdated';