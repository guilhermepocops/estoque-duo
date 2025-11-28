import React, { useState, useEffect } from 'react';
import { UnitType, InventoryItem } from '../types';
import { X, Settings, Plus, Trash2, CheckCircle, Calendar, Store } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any, initialPrice?: number, store?: string, date?: string, editId?: string) => void;
  categories: string[];
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (cat: string) => void;
  initialData?: InventoryItem | null;
  savedStores: string[];
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  categories, 
  onAddCategory, 
  onRemoveCategory,
  initialData,
  savedStores
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(categories[0] || 'Outros');
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(1);
  const [unit, setUnit] = useState<UnitType>(UnitType.UNIT);
  const [price, setPrice] = useState<string>('');
  const [store, setStore] = useState('');
  const [date, setDate] = useState('');

  // Category Management State
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Load initial data if editing
  useEffect(() => {
    if (isOpen && initialData) {
        setName(initialData.name);
        setCategory(initialData.category);
        setQuantity(initialData.quantity);
        setMinQuantity(initialData.minQuantity);
        setUnit(initialData.unit);
        setPrice('');
        setStore('');
        setDate(new Date().toISOString().split('T')[0]);
    } else if (isOpen && !initialData) {
        // Reset defaults for new item
        setName('');
        setCategory(categories[0] || 'Outros');
        setQuantity(1);
        setMinQuantity(1);
        setUnit(UnitType.UNIT);
        setPrice('');
        setStore('');
        setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialData, categories]);

  if (!isOpen) return null;

  const triggerFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      { name, category, quantity, minQuantity, unit },
      price ? parseFloat(price) : undefined,
      store,
      date,
      initialData?.id // Pass ID if editing
    );

    triggerFeedback(initialData ? 'Item atualizado!' : 'Item salvo com sucesso!');

    // Delay closing slightly to show success message
    setTimeout(() => {
        setIsManagingCats(false);
        setFeedbackMessage(null);
        onClose();
        // Form reset happens in useEffect when reopening
    }, 1500);
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
        onAddCategory(newCatName.trim());
        setCategory(newCatName.trim()); // Auto select new one
        setNewCatName('');
        triggerFeedback('Categoria adicionada!');
    }
  };

  const handleManualClose = () => {
    setFeedbackMessage(null);
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">
            {isManagingCats ? 'Gerenciar Categorias' : (isEditing ? 'Editar Item' : 'Novo Item / Compra')}
          </h3>
          <button onClick={handleManualClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {/* Feedback Alert */}
        {feedbackMessage && (
            <div className="mx-4 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">{feedbackMessage}</span>
            </div>
        )}

        <div className="overflow-y-auto p-4">
            {isManagingCats ? (
                <div className="space-y-4">
                    <form onSubmit={handleAddNewCategory} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Nova categoria..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <button 
                            type="submit"
                            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700"
                        >
                            <Plus size={20} />
                        </button>
                    </form>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Categorias Existentes</h4>
                        <ul className="space-y-2">
                            {categories.map(cat => (
                                <li key={cat} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-gray-800">{cat}</span>
                                    <button 
                                        onClick={() => {
                                            onRemoveCategory(cat);
                                            triggerFeedback('Categoria removida');
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Remover"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button 
                        onClick={() => setIsManagingCats(false)}
                        className="w-full mt-4 text-emerald-600 font-medium hover:text-emerald-700 py-2"
                    >
                        Voltar para o item
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                    <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Ex: Arroz Tipo 1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Categoria</label>
                            <button 
                                type="button" 
                                onClick={() => setIsManagingCats(true)}
                                className="text-emerald-600 hover:text-emerald-800"
                                title="Gerenciar categorias"
                            >
                                <Settings size={14} />
                            </button>
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value as UnitType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                        {Object.values(UnitType).map((u) => (
                        <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Atual</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo Ideal</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 bg-gray-50 -mx-4 px-4 pb-2">
                    <h4 className="text-sm font-semibold text-emerald-700 mb-3 mt-2 flex items-center gap-1">
                        <Store size={16} />
                        {isEditing ? 'Atualizar Dados de Compra (Opcional)' : 'Detalhes da Compra (Opcional)'}
                    </h4>
                    
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                                <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <div className="relative">
                                    <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loja / Mercado</label>
                            <input
                            type="text"
                            list="saved-stores"
                            value={store}
                            onChange={(e) => setStore(e.target.value)}
                            placeholder="Digite ou selecione..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                            <datalist id="saved-stores">
                                {savedStores.map((s, idx) => (
                                    <option key={idx} value={s} />
                                ))}
                            </datalist>
                            <p className="text-xs text-gray-500 mt-1">
                                {store && !savedStores.includes(store) ? 'Esta loja será salva automaticamente.' : 'Selecione uma loja salva ou digite uma nova.'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-2 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    {isEditing ? 'Salvar Alterações' : 'Salvar Item'}
                </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};
