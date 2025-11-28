import { supabase } from './supabaseClient';
import { InventoryItem } from '../types';

// ===== ITEMS (ESTOQUE) =====

// Listar todos os itens
export async function getItems(): Promise<InventoryItem[] | null> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) {
    console.error('Erro ao listar itens:', error);
    return null;
  }

  // Converter snake_case do Supabase para camelCase do TypeScript
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

// Criar novo item
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

// Atualizar item
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

// Deletar item
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

export async function getActivityLogs() {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erro ao listar logs:', error);
    return null;
  }

  return data;
}
