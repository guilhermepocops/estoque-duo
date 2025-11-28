import React from 'react';
import { ActivityLog, ActivityAction } from '../types';
import { Bell, ShoppingBag, PlusCircle, MinusCircle, Trash2, Edit, CheckCircle } from 'lucide-react';

interface ActivityFeedProps {
  logs: ActivityLog[];
  onClear: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs, onClear }) => {
  
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getIcon = (action: ActivityAction) => {
    switch (action) {
      case 'create': return <PlusCircle size={18} className="text-emerald-500" />;
      case 'purchase': return <ShoppingBag size={18} className="text-purple-500" />;
      case 'restock': return <PlusCircle size={18} className="text-blue-500" />;
      case 'consume': return <MinusCircle size={18} className="text-orange-500" />;
      case 'delete': return <Trash2 size={18} className="text-red-500" />;
      case 'update': return <Edit size={18} className="text-gray-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    
    if (isToday) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pb-20 space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Bell size={20} className="text-emerald-600" />
            Atividades Recentes
            </h2>
            <p className="text-xs text-gray-500">Acompanhe as movimentações da casa</p>
        </div>
        {logs.length > 0 && (
            <button 
                onClick={onClear}
                className="text-xs text-emerald-600 font-medium hover:text-emerald-800"
            >
                Limpar tudo
            </button>
        )}
      </div>

      <div className="space-y-3">
        {sortedLogs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CheckCircle size={40} className="mx-auto mb-2 opacity-20" />
            <p>Nenhuma atividade recente.</p>
          </div>
        ) : (
          sortedLogs.map((log) => (
            <div key={log.id} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start relative overflow-hidden ${!log.isRead ? 'border-l-4 border-l-emerald-500' : ''}`}>
              <div className="mt-1 p-2 bg-gray-50 rounded-full shrink-0">
                {getIcon(log.action)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{log.message}</p>
                <div className="flex justify-between items-center mt-1">
                    {log.details && (
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                            {log.details}
                        </span>
                    )}
                    <span className="text-[10px] text-gray-400 ml-auto">
                        {formatDate(log.timestamp)}
                    </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};