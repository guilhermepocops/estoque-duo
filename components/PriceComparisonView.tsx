import React, { useMemo, useState } from 'react';
import { PurchaseRecord } from '../types';
import { TrendingDown, TrendingUp, AlertCircle, Search } from 'lucide-react';

interface PriceComparisonViewProps {
  history: PurchaseRecord[];
}

interface PriceComparison {
  itemName: string;
  lowestPrice: number;
  lowestStore: string;
  highestPrice: number;
  highestStore: string;
  averagePrice: number;
  pricesByStore: { [storeName: string]: number[] };
  latestPrices: { [storeName: string]: number };
  priceChange: number;
}

export const PriceComparisonView: React.FC<PriceComparisonViewProps> = ({ history }) => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'lowest' | 'highest' | 'savings'>('lowest');
  const [searchQuery, setSearchQuery] = useState('');

  // Processar dados para comparação
  const priceComparisons = useMemo(() => {
    const groupedByItem: { [itemName: string]: { [storeName: string]: number[] } } = {};

    // Agrupar preços por item e loja
    history.forEach(record => {
      if (!groupedByItem[record.itemName]) {
        groupedByItem[record.itemName] = {};
      }
      if (!groupedByItem[record.itemName][record.storeName]) {
        groupedByItem[record.itemName][record.storeName] = [];
      }
      groupedByItem[record.itemName][record.storeName].push(record.price);
    });

    // Calcular comparações
    let comparisons: PriceComparison[] = Object.entries(groupedByItem).map(([itemName, pricesByStore]) => {
      const allPrices = Object.values(pricesByStore).flat();
      const lowestPrice = Math.min(...allPrices);
      const highestPrice = Math.max(...allPrices);
      const averagePrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;

      // Pegar último preço de cada loja
      const latestPrices: { [storeName: string]: number } = {};
      Object.entries(pricesByStore).forEach(([storeName, prices]) => {
        latestPrices[storeName] = prices[prices.length - 1];
      });

      // Calcular mudança de preço
      const firstPrice = allPrices[0];
      const lastPrice = allPrices[allPrices.length - 1];
      const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

      // Encontrar lojas com preços mínimo e máximo
      const lowestStore = Object.entries(latestPrices).sort((a, b) => a[1] - b[1])[0]?.[0] || '';
      const highestStore = Object.entries(latestPrices).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      return {
        itemName,
        lowestPrice,
        lowestStore,
        highestPrice,
        highestStore,
        averagePrice,
        pricesByStore,
        latestPrices,
        priceChange,
      };
    });

    // Ordenar
    comparisons = comparisons.sort((a, b) => {
      if (sortBy === 'lowest') {
        return a.lowestPrice - b.lowestPrice;
      } else if (sortBy === 'highest') {
        return b.highestPrice - a.highestPrice;
      } else {
        const savingsA = a.highestPrice - a.lowestPrice;
        const savingsB = b.highestPrice - b.lowestPrice;
        return savingsB - savingsA;
      }
    });

    return comparisons;
  }, [history, sortBy]);

  const selectedComparison = priceComparisons.find(p => p.itemName === selectedItem);

  const getPriceChangeColor = (change: number) => {
    if (change > 5) return 'text-red-500';
    if (change < -5) return 'text-green-500';
    return 'text-gray-500';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 5) return <TrendingUp size={16} className="text-red-500" />;
    if (change < -5) return <TrendingDown size={16} className="text-green-500" />;
    return null;
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Filtros */}
      <div className="space-y-3">
        {/* Ordenar Por */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ordenar por</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('lowest')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'lowest'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mais Barato
            </button>
            <button
              onClick={() => setSortBy('highest')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'highest'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mais Caro
            </button>
            <button
              onClick={() => setSortBy('savings')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'savings'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Maior Economia
            </button>
          </div>
        </div>

        {/* Buscar por Item */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar Item</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Digite o nome do item..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de Items */}
      <div className="space-y-3">
        {priceComparisons.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Nenhum histórico de preço para comparar.
          </div>
        ) : (
          priceComparisons
            .filter(c => c.itemName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(comparison => (
              <button
                key={comparison.itemName}
                onClick={() => setSelectedItem(selectedItem === comparison.itemName ? null : comparison.itemName)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedItem === comparison.itemName
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{comparison.itemName}</h3>
                    <p className="text-xs text-gray-500">
                      {Object.keys(comparison.latestPrices).length} loja(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      R$ {comparison.lowestPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{comparison.lowestStore}</p>
                  </div>
                </div>

                {/* Preço Médio e Variação */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">
                    Média: R$ {comparison.averagePrice.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    {getPriceChangeIcon(comparison.priceChange)}
                    <span className={getPriceChangeColor(comparison.priceChange)}>
                      {comparison.priceChange > 0 ? '+' : ''}
                      {comparison.priceChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </button>
            ))
        )}
      </div>

      {/* Detalhes do Item Selecionado */}
      {selectedComparison && (
        <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-500 space-y-4">
          <div>
            <h4 className="font-bold text-gray-800 mb-3">Preços por Loja</h4>
            <div className="space-y-2">
              {Object.entries(selectedComparison.latestPrices)
                .sort((a, b) => a[1] - b[1])
                .map(([storeName, price]) => {
                  const savings = selectedComparison.lowestPrice === price;
                  const diff = price - selectedComparison.lowestPrice;

                  return (
                    <div key={storeName} className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="font-medium text-gray-800">{storeName}</span>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">R$ {price.toFixed(2)}</p>
                        {savings && (
                          <p className="text-xs text-green-600 font-semibold">✓ Mais barato</p>
                        )}
                        {diff > 0 && (
                          <p className="text-xs text-red-600">
                            +R$ {diff.toFixed(2)} mais caro
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Economia */}
          <div className="bg-white p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-yellow-600" />
              <span className="font-semibold text-gray-800">Economia Potencial</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              R$ {(selectedComparison.highestPrice - selectedComparison.lowestPrice).toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Comprando no {selectedComparison.lowestStore} ao invés de {selectedComparison.highestStore}
            </p>
          </div>

          {/* Preços Históricos */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Histórico de Preços</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(selectedComparison.pricesByStore).map(([storeName, prices]) => (
                <div key={storeName} className="bg-white p-2 rounded-lg text-xs">
                  <p className="font-semibold text-gray-700 mb-1">{storeName}</p>
                  <p className="text-gray-600">
                    {prices.map(p => `R$ ${p.toFixed(2)}`).join(' → ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
