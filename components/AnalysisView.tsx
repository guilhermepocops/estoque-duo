import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PurchaseRecord } from '../types';
import { TrendingDown } from 'lucide-react';




interface AnalysisViewProps {
  history: PurchaseRecord[];
}




export const AnalysisView: React.FC<AnalysisViewProps> = ({ history }) => {
  
  const data = useMemo(() => {
    // Calculate average price per store per item, but simplified to Store Avg for demo
    const storeMap = new Map<string, { total: number; count: number }>();
    
    history.forEach(h => {
      const current = storeMap.get(h.storeName) || { total: 0, count: 0 };
      storeMap.set(h.storeName, { 
        total: current.total + (h.price / h.quantity), // Price per unit
        count: current.count + 1 
      });
    });




    return Array.from(storeMap.entries()).map(([name, stats]) => ({
      name,
      avgPrice: parseFloat((stats.total / stats.count).toFixed(2))
    }));
  }, [history]);




const recentItems = useMemo(() => {
  const itemMap = new Map<string, { price: number; store: string; date: string }>();
  
  // Sort by date + createdAt desc
  const sorted = [...history].sort((a, b) => {
    const keyA = (a.date || '') + ' ' + (a.createdAt || '');
    const keyB = (b.date || '') + ' ' + (b.createdAt || '');
    return keyB.localeCompare(keyA);
  });
  
  sorted.forEach(h => {
      if (!itemMap.has(h.itemName)) {
          let dateStr = 'Data não disponível';
          
          if (h.date && h.date.trim() !== '') {
              const parts = h.date.split('-');
              if (parts.length === 3) {
                  dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
              }
          }
          
          itemMap.set(h.itemName, { price: h.price, store: h.storeName, date: dateStr });
      }
  });
  return Array.from(itemMap.entries()).slice(0, 5);
}, [history]);





  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingDown className="text-emerald-600" />
          Média de Preço por Unidade (Global)
        </h2>
        
        {data.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis unit="R$" width={40} tick={{fontSize: 12}} />
                <Tooltip 
                    formatter={(value) => [`R$ ${value}`, 'Preço Médio']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="avgPrice" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400">
            Sem dados suficientes para gráfico.
          </div>
        )}
      </div>




      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Últimas Referências de Preço</h3>
        </div>
        <ul>
            {recentItems.map(([name, details], idx) => (
                <li key={idx} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0">
                    <div>
                        <p className="font-medium text-gray-800">{name}</p>
                        <p className="text-xs text-gray-500">{details.store} • {details.date}</p>
                    </div>
                    <div className="font-bold text-emerald-600">
                        R$ {details.price.toFixed(2)}
                    </div>
                </li>
            ))}
            {recentItems.length === 0 && (
                <li className="p-4 text-center text-gray-400 text-sm">Nenhuma compra registrada.</li>
            )}
        </ul>
      </div>
    </div>
  );
};
