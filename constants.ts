import { Category, InventoryItem, PurchaseRecord, UnitType, ActivityLog } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Arroz Branco', category: Category.PANTRY, quantity: 2, minQuantity: 2, unit: UnitType.PACK, lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Feijão Preto', category: Category.PANTRY, quantity: 1, minQuantity: 2, unit: UnitType.PACK, lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Leite Integral', category: Category.FRIDGE, quantity: 2, minQuantity: 4, unit: UnitType.LITER, lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Detergente', category: Category.CLEANING, quantity: 3, minQuantity: 2, unit: UnitType.UNIT, lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Café', category: Category.PANTRY, quantity: 0, minQuantity: 1, unit: UnitType.PACK, lastUpdated: new Date().toISOString() },
];

export const INITIAL_HISTORY: PurchaseRecord[] = [
  { id: '101', itemId: '1', itemName: 'Arroz Branco', storeName: 'Mercado A', price: 24.90, quantity: 1, date: '2023-10-01' },
  { id: '102', itemId: '1', itemName: 'Arroz Branco', storeName: 'Atacado B', price: 22.50, quantity: 2, date: '2023-10-15' },
  { id: '103', itemId: '3', itemName: 'Leite Integral', storeName: 'Mercado A', price: 4.59, quantity: 4, date: '2023-10-05' },
  { id: '104', itemId: '3', itemName: 'Leite Integral', storeName: 'Padaria C', price: 6.00, quantity: 1, date: '2023-10-20' },
  { id: '105', itemId: '5', itemName: 'Café', storeName: 'Mercado A', price: 18.00, quantity: 1, date: '2023-10-10' },
  { id: '106', itemId: '5', itemName: 'Café', storeName: 'Atacado B', price: 16.50, quantity: 2, date: '2023-10-25' },
];

export const INITIAL_LOGS: ActivityLog[] = [
  { id: '1', action: 'create', message: 'Bem-vindo ao EstoqueDuo!', timestamp: new Date().toISOString(), isRead: false },
  { id: '2', action: 'restock', message: 'Estoque inicial configurado', details: '5 itens', timestamp: new Date(Date.now() - 100000).toISOString(), isRead: true }
];

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.PANTRY]: 'bg-orange-100 text-orange-800',
  [Category.FRIDGE]: 'bg-blue-100 text-blue-800',
  [Category.FREEZER]: 'bg-cyan-100 text-cyan-800',
  [Category.CLEANING]: 'bg-purple-100 text-purple-800',
  [Category.HYGIENE]: 'bg-pink-100 text-pink-800',
  [Category.OTHER]: 'bg-gray-100 text-gray-800',
};