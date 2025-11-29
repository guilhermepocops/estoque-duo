import React, { useState, useEffect, useCallback } from 'react';
import { 
  getItems, 
  createItem, 
  updateItem, 
  deleteItem, 
  createActivityLog,
  getCategories,
  addCategory,
  removeCategory,
  getStores,
  addStore,
  getPurchaseHistory,
  addPurchaseRecord,
  getActivityLogs
} from '@/lib/supabaseQueries';


import { 
  Home, 
  ShoppingCart, 
  BarChart2, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle,
  Search,
  MinusCircle,
  PlusCircle,
  AlertCircle,
  ArrowUpDown,
  Bell,
  DollarSign,
  Moon,
  Sun
} from 'lucide-react';
import { PriceComparisonView } from './components/PriceComparisonView';
import { InventoryItem, PurchaseRecord, Tab, Category, UnitType, SortOption, ActivityLog, ActivityAction, ItemStatus } from './types';
import { INITIAL_INVENTORY, INITIAL_HISTORY, CATEGORY_COLORS, INITIAL_LOGS } from './constants';
import { AddItemModal } from './components/AddItemModal';
import { AnalysisView } from './components/AnalysisView';
import { ActivityFeed } from './components/ActivityFeed';


const App = () => {
  // --- Dark Mode State ---
  const [isDark, setIsDark] = useState(false);


  useEffect(() => {
    const saved = localStorage.getItem('estoqueduo-dark-mode');
    if (saved) {
      const isDarkMode = JSON.parse(saved);
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);


  const toggleDark = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('estoqueduo-dark-mode', JSON.stringify(newValue));
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);


  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);


  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);


  const [savedStores, setSavedStores] = useState<string[]>([]);
  const [storesLoaded, setStoresLoaded] = useState(false);


  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name');


  // --- Effects: Load all data from Supabase on mount ---


  useEffect(() => {
    loadAllData();
  }, []);


  const loadAllData = async () => {
    try {
      const itemsData = await getItems();
      if (itemsData) setInventory(itemsData);
      setInventoryLoaded(true);


      const categoriesData = await getCategories();
      if (categoriesData) {
        setCategories(categoriesData.length > 0 ? categoriesData : Object.values(Category));
      }
      setCategoriesLoaded(true);


      const historyData = await getPurchaseHistory();
      if (historyData) setHistory(historyData);
      setHistoryLoaded(true);


      const storesData = await getStores();
      if (storesData) setSavedStores(storesData.length > 0 ? storesData : []);
      setStoresLoaded(true);


      const logsData = await getActivityLogs();
      if (logsData) setLogs(logsData);
      setLogsLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };


  useEffect(() => {
    if (activeTab === 'activity') {
      const hasUnread = logs.some(l => !l.isRead);
      if (hasUnread) {
        setTimeout(() => {
          setLogs(prev => prev.map(l => ({ ...l, isRead: true })));
        }, 1000);
      }
    }
  }, [activeTab, logs]);


  const addLog = async (action: ActivityAction, message: string, details?: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      message,
      details,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setLogs(prev => [newLog, ...prev].slice(0, 50));
    await createActivityLog(action, message, details);
  };


  const handleSaveItem = async (
    itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>, 
    initialPrice?: number, 
    store?: string,
    date?: string,
    editId?: string
  ) => {
    let itemId: string;


    try {
      if (editId) {
        itemId = editId;
        const success = await updateItem(editId, itemData);
        
        if (success) {
          setInventory(prev => prev.map(item => 
            item.id === editId 
              ? { ...item, ...itemData, lastUpdated: new Date().toISOString() }
              : item
          ));
          await addLog('update', `Item atualizado: ${itemData.name}`, 'Detalhes alterados');
        }
      } else {
        const existingItem = inventory.find(
          i => i.name.toLowerCase() === itemData.name.toLowerCase() && i.unit === itemData.unit
        );


        if (existingItem) {
          itemId = existingItem.id;
          const newQuantity = existingItem.quantity + itemData.quantity;
          const success = await updateItem(itemId, { 
            ...existingItem,
            quantity: newQuantity 
          });
          
          if (success) {
            setInventory(prev => prev.map(item => 
              item.id === itemId 
                ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() }
                : item
            ));
            await addLog('restock', `Adicionou ao estoque: ${itemData.name}`, `+${itemData.quantity} ${itemData.unit}`);
          }
        } else {
          const newItem = await createItem(itemData);
          
          if (newItem) {
            itemId = newItem.id;
            setInventory(prev => [...prev, newItem]);
            await addLog('create', `Novo item cadastrado: ${itemData.name}`, `Estoque: ${itemData.quantity}`);
          }
        }
      }


      if (store && !savedStores.includes(store)) {
        const storeSuccess = await addStore(store);
        if (storeSuccess) {
          const updatedStores = await getStores();
          if (updatedStores) {
            setSavedStores(updatedStores);
          } else {
            setSavedStores(prev => [...prev, store]);
          }
          await addLog('create', `Nova loja salva: ${store}`);
        }
      }


      if (initialPrice && store) {
        const record: PurchaseRecord = {
          id: Math.random().toString(36).substr(2, 9),
          itemId,
          itemName: itemData.name,
          storeName: store,
          price: initialPrice,
          quantity: itemData.quantity,
          date: date || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };
        await addPurchaseRecord(record);
        setHistory(prev => [...prev, record]);
        await addLog('purchase', `Compra registrada: ${itemData.name}`, `R$ ${initialPrice.toFixed(2)} em ${store}`);
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      await addLog('error', 'Erro ao salvar item', String(error));
    }
  };


  const handleUpdateQuantity = async (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;


    try {
      if (delta > 0) {
        await addLog('restock', `Estoque adicionado: ${item.name}`, `+${delta} ${item.unit}`);
      } else {
        await addLog('consume', `Item consumido: ${item.name}`, `${delta} ${item.unit}`);
      }


      const newQty = Math.max(0, item.quantity + delta);
      const success = await updateItem(id, { ...item, quantity: newQty });


      if (success) {
        setInventory(prev => prev.map(it => {
          if (it.id === id) {
            return { ...it, quantity: newQty, lastUpdated: new Date().toISOString() };
          }
          return it;
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };


  const promptDeleteItem = (id: string) => {
    setItemToDelete(id);
  };


  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        const item = inventory.find(i => i.id === itemToDelete);
        if (item) {
          await addLog('delete', `Item removido: ${item.name}`, 'Excluído do estoque');
        }
        
        const success = await deleteItem(itemToDelete);
        if (success) {
          setInventory(prev => prev.filter(i => i.id !== itemToDelete));
        }
        setItemToDelete(null);
      } catch (error) {
        console.error('Erro ao deletar item:', error);
      }
    }
  };


  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };


  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };


  const handleAddCategory = async (cat: string) => {
    if (!categories.includes(cat)) {
      const success = await addCategory(cat);
      if (success) {
        setCategories(prev => [...prev, cat]);
        await addLog('create', `Nova categoria: ${cat}`);
      }
    }
  };


  const handleRemoveCategory = async (cat: string) => {
    const success = await removeCategory(cat);
    if (success) {
      setCategories(prev => prev.filter(c => c !== cat));
      await addLog('delete', `Categoria removida: ${cat}`);
    }
  };


  const handleClearLogs = async () => {
    setLogs([]);
  };


  const shoppingList = inventory.filter(i => i.quantity < i.minQuantity);
  const unreadLogsCount = logs.filter(l => !l.isRead).length;
  
  const filteredAndSortedInventory = inventory
    .filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'quantityAsc':
          return a.quantity - b.quantity;
        case 'quantityDesc':
          return b.quantity - a.quantity;
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });


  const getCategoryColor = (cat: string) => {
    const color = CATEGORY_COLORS[cat as Category];
    return color || 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
  };

  // ← ADD ESSAS FUNÇÕES HELPERS
  const getStatusBadge = (status?: ItemStatus) => {
    switch (status) {
      case 'full':
        return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200';
      case 'in_use':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'almost_empty':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status?: ItemStatus) => {
    switch (status) {
      case 'full':
        return 'Cheio';
      case 'in_use':
        return 'Em Excesso';
      case 'almost_empty':
        return 'Quase Acabando';
      default:
        return 'Normal';
    }
  };


  const renderInventoryList = () => (
    <div className="pb-24 space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar itens..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="absolute left-3 top-3 text-emerald-600 dark:text-emerald-400 pointer-events-none">
            <ArrowUpDown size={20} />
          </div>
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="h-full pl-10 pr-4 rounded-xl border-none shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer text-sm font-medium"
            aria-label="Ordenar por"
          >
            <option value="name">Nome (A-Z)</option>
            <option value="category">Categoria</option>
            <option value="quantityAsc">Menor Qtd</option>
            <option value="quantityDesc">Maior Qtd</option>
            <option value="lastUpdated">Recentes</option>
          </select>
        </div>
      </div>


      <div className="grid gap-3">
        {filteredAndSortedInventory.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
               {item.quantity < item.minQuantity && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-bold flex items-center gap-1">
                    <AlertCircle size={10} /> Baixo
                </span>
              )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditClick(item)}
                  className="text-gray-300 dark:text-gray-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1"
                  aria-label="Editar item"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => promptDeleteItem(item.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                  aria-label="Excluir item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>


            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{item.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">Min: {item.minQuantity} {item.unit}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleUpdateQuantity(item.id, -1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <MinusCircle size={18} />
                </button>
                <div className="text-center min-w-[3rem]">
                  <span className="block font-bold text-lg text-gray-800 dark:text-white">{item.quantity}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">{item.unit}</span>
                </div>
                <button 
                  onClick={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <PlusCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredAndSortedInventory.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            Nenhum item encontrado.
          </div>
        )}
      </div>
    </div>
  );


  const renderShoppingList = () => (
    <div className="pb-24 space-y-4">
      <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-xl border border-orange-100 dark:border-orange-700 mb-4">
        <h2 className="text-orange-800 dark:text-orange-200 font-bold text-lg">Precisa Comprar</h2>
        <p className="text-orange-600 dark:text-orange-300 text-sm">Itens abaixo do estoque mínimo.</p>
      </div>


      {shoppingList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
          <CheckCircle size={48} className="text-emerald-300 dark:text-emerald-600 mb-2" />
          <p>Tudo estocado!</p>
        </div>
      ) : (
        shoppingList.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-orange-400 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Estoque: <span className="text-red-500 dark:text-red-400 font-bold">{item.quantity}</span> / {item.minQuantity} {item.unit}
              </p>
            </div>
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="bg-emerald-600 dark:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
            >
              Comprar
            </button>
          </div>
        ))
      )}
    </div>
  );


  return (
    <div className={isDark ? "min-h-screen bg-gray-900 text-white max-w-xl mx-auto shadow-2xl overflow-hidden relative transition-colors" : "min-h-screen bg-gray-50 text-gray-900 max-w-xl mx-auto shadow-2xl overflow-hidden relative transition-colors"}>
      {/* Header */}
      <header className={isDark ? "bg-gray-800 px-6 py-5 shadow-sm sticky top-0 z-10 transition-colors" : "bg-white px-6 py-5 shadow-sm sticky top-0 z-10 transition-colors"}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Estoque<span className="text-emerald-600 dark:text-emerald-400">Duo</span></h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Controle Doméstico Inteligente</p>
          </div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={toggleDark}
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Alternar modo escuro"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="bg-emerald-600 dark:bg-emerald-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="p-4">
        {activeTab === 'inventory' && renderInventoryList()}
        {activeTab === 'shopping' && renderShoppingList()}
        {activeTab === 'analysis' && <AnalysisView history={history} />}
        {activeTab === 'prices' && <PriceComparisonView history={history} />}
        {activeTab === 'activity' && <ActivityFeed logs={logs} onClear={handleClearLogs} />}
      </main>


      {/* Bottom Navigation */}
      <nav className={isDark ? "fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-6 py-3 max-w-xl mx-auto z-20 transition-colors" : "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 max-w-xl mx-auto z-20 transition-colors"}>
        <ul className="flex justify-between items-center">
          <li>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'inventory' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <Home size={24} strokeWidth={activeTab === 'inventory' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Estoque</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('shopping')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'shopping' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className="relative">
                <ShoppingCart size={24} strokeWidth={activeTab === 'shopping' ? 2.5 : 2} />
                {shoppingList.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {shoppingList.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Compras</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('analysis')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'analysis' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <BarChart2 size={24} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Análise</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('prices')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'prices' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <DollarSign size={24} strokeWidth={activeTab === 'prices' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Preços</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'activity' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className="relative">
                <Bell size={24} strokeWidth={activeTab === 'activity' ? 2.5 : 2} />
                {unreadLogsCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadLogsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Atividades</span>
            </button>
          </li>
        </ul>
      </nav>


      {/* Modals */}
      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSave={handleSaveItem}
        categories={categories}
        onAddCategory={handleAddCategory}
        onRemoveCategory={handleRemoveCategory}
        initialData={editingItem}
        savedStores={savedStores}
      />


      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 scale-100 transform transition-all">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excluir Item?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja remover este item? O histórico de compras será mantido, mas o estoque será zerado.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-sm"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default App;
