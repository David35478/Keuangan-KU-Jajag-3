import React from 'react';
import { Calculator, Hash, TrendingUp, DollarSign } from 'lucide-react';
import { SummaryStats } from '../types';

interface StatsCardsProps {
  stats: SummaryStats;
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Net Balance */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${stats.totalSum < 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <Calculator size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Saldo Bersih</p>
          <h3 className={`text-xl font-bold ${stats.totalSum < 0 ? 'text-red-700' : 'text-slate-800'}`}>
            {formatRupiah(stats.totalSum)}
          </h3>
        </div>
      </div>

      {/* Item Count */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
          <Hash size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Item</p>
          <h3 className="text-2xl font-bold text-slate-800">{stats.count}</h3>
        </div>
      </div>

      {/* Average */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Rata-rata</p>
          <h3 className="text-xl font-bold text-slate-800">
            {formatRupiah(stats.average)}
          </h3>
        </div>
      </div>

      {/* Highest Value */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Nilai Tertinggi</p>
          <h3 className="text-xl font-bold text-slate-800">
            {formatRupiah(stats.highest)}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;