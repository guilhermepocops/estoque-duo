import { supabase } from './supabaseClient';
import { InventoryItem, PurchaseRecord, ActivityLog } from '../types';

// ===== ITEMS (ESTOQUE) =====

export async function getItems(): Promise<InventoryItem[] | null> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) {
    console.error('Erro ao listar itens:', error);
    return null;
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    minQuantity: item.min_quantity,
    unit: item.unit,
    category: item.category,
    lastUpdated: item.last_updated,
  })) as InventoryItem[];
}

export async function createItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from('items')
    .insert({
      name: item.name,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      unit: item.unit,
      category: item.category,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar item:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    quantity: data.quantity,
    minQuantity: data.min_quantity,
    unit: data.unit,
    category: data.category,
    lastUpdated: data.last_updated,
  } as InventoryItem;
}

export async function updateItem(id: string, updates: Partial<Omit<InventoryItem, 'id'>>): Promise<boolean> {
  const updateData: any = {};

  if (updates.name) updateData.name = updates.name;
  if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
  if (updates.minQuantity !== undefined) updateData.min_quantity = updates.minQuantity;
  if (updates.unit) updateData.unit = updates.unit;
  if (updates.category) updateData.category = updates.category;
  updateData.last_updated = new Date().toISOString();

  const { error } = await supabase
    .from('items')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar item:', error);
    return false;
  }

  return true;
}

export async function deleteItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar item:', error);
    return false;
  }

  return true;
}

// ===== CATEGORIES =====

export async function getCategories(): Promise<string[] | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao listar categorias:', error);
    return null;
  }

  return data.map(cat => cat.name);
}

export async function addCategory(name: string): Promise<boolean> {
  const { error } = await supabase
    .from('categories')
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar categoria:', error);
    return false;
  }

  return true;
}

export async function removeCategory(name: string): Promise<boolean> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('name', name);

  if (error) {
    console.error('Erro ao remover categoria:', error);
    return false;
  }

  return true;
}

// ===== PURCHASE HISTORY =====

export async function getPurchaseHistory(): Promise<PurchaseRecord[] | null> {
  const { data, error } = await supabase
    .from('purchase_history')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Erro ao listar histórico de compras:', error);
    return null;
  }

  return data.map(record => ({
    id: record.id,
    itemId: record.item_id,
    itemName: record.item_name,
    storeName: record.store_name,
    price: record.price,
    quantity: record.quantity,
    date: record.date,
  })) as PurchaseRecord[];
}

export async function addPurchaseRecord(record: Omit<PurchaseRecord, 'id'>): Promise<boolean> {
  const { error } = await supabase
    .from('purchase_history')
    .insert({
      item_id: record.itemId,
      item_name: record.itemName,
      store_name: record.storeName,
      price: record.price,
      quantity: record.quantity,
      date: record.date,
    });

  if (error) {
    console.error('Erro ao adicionar compra:', error);
    return false;
  }

  return true;
}

// ===== STORES =====

export async function getStores(): Promise<string[] | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao listar lojas:', error);
    return null;
  }

  return data.map(store => store.name);
}

export async function addStore(name: string): Promise<boolean> {
  const { error } = await supabase
    .from('stores')
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar loja:', error);
    return false;
  }

  return true;
}

// ===== ACTIVITY LOGS =====

export async function createActivityLog(action: string, message: string, details?: string): Promise<boolean> {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      action,
      message,
      details: details || null,
    });

  if (error) {
    console.error('Erro ao criar log:', error);
    return false;
  }

  return true;
}

export async function getActivityLogs(): Promise<ActivityLog[] | null> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erro ao listar logs:', error);
    return null;
  }

  return data.map(log => ({
    id: log.id,
    action: log.action,
    message: log.message,
    details: log.details,
    timestamp: log.created_at,
    isRead: false,
  })) as ActivityLog[];
}
