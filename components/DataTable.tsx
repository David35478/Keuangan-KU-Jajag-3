import React, { useState } from 'react';
import { Trash2, ArrowUpDown, Download, Filter, Search, X, Calendar } from 'lucide-react';
import { DataItem } from '../types';

interface DataTableProps {
  data: DataItem[];
  originalDataCount: number;
  categories: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  originalDataCount,
  categories,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onDelete, 
  onClearAll 
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  
  const performExport = () => {
    if (data.length === 0) return;

    let itemsToExport = [...data];

    // Filter by date range if provided
    if (exportStartDate) {
        // Construct local time start of day
        const start = new Date(`${exportStartDate}T00:00:00`);
        itemsToExport = itemsToExport.filter(item => new Date(item.createdAt) >= start);
    }

    if (exportEndDate) {
        // Construct local time end of day
        const end = new Date(`${exportEndDate}T23:59:59.999`);
        itemsToExport = itemsToExport.filter(item => new Date(item.createdAt) <= end);
    }

    if (itemsToExport.length === 0) {
        alert("Tidak ada data yang ditemukan dalam rentang tanggal yang dipilih.");
        return;
    }

    const headers = ['ID', 'Nama', 'Nilai', 'Kategori', 'Dibuat Pada'];
    const rows = itemsToExport.map(item => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      item.value,
      item.category ? `"${item.category.replace(/"/g, '""')}"` : '',
      item.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const filenameCategory = selectedCategory === 'all' ? 'semua' : selectedCategory.replace(/[^a-z0-9]/gi, '_');
      const dateSuffix = exportStartDate || exportEndDate 
        ? `_${exportStartDate || 'awal'}_sampai_${exportEndDate || 'sekarang'}` 
        : `_${new Date().toISOString().split('T')[0]}`;
        
      link.setAttribute('download', `ekspor_data_${filenameCategory}${dateSuffix}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setIsExportModalOpen(false);
    setExportStartDate('');
    setExportEndDate('');
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  // If there is absolutely no data in the system (not just because of filtering)
  if (originalDataCount === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center h-full">
        <div className="p-4 bg-slate-100 rounded-full mb-4">
          <ArrowUpDown className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Data Tidak Tersedia</h3>
        <p className="text-slate-500 mt-1">Tambahkan item secara manual atau gunakan generator AI untuk memulai.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative z-0">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800 self-start lg:self-center">Rekaman Data</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nama..."
                className="pl-9 pr-4 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-colors w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Filter Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Filter size={14} className="text-slate-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="pl-9 pr-8 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:border-slate-300 transition-colors w-full sm:w-auto min-w-[140px] appearance-none"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button 
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={data.length === 0}
                  className="text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                  <Download size={14} className="mr-1.5" />
                  CSV
              </button>
              <button 
                  onClick={onClearAll}
                  disabled={originalDataCount === 0}
                  className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  Hapus Semua
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Nilai</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center justify-center">
                          <Search className="mb-2 text-slate-300" size={24} />
                          <p>Tidak ada rekaman yang cocok dengan filter Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString('id-ID')} 
                          {item.category ? ` • ${item.category}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`text-sm font-bold font-mono ${item.value < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {item.value < 0 ? '-' : '+'} {formatRupiah(item.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Hapus Entri"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center">
          Menampilkan {data.length} dari {originalDataCount} rekaman
        </div>
      </div>

      {/* Export Date Range Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Download size={18} className="text-blue-500" />
                Opsi Ekspor
              </h3>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Pilih rentang tanggal untuk memfilter CSV yang diekspor. Biarkan kosong untuk mengekspor semua data yang terlihat saat ini.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Calendar size={12} /> Tanggal Mulai
                  </label>
                  <input 
                    type="date" 
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Calendar size={12} /> Tanggal Akhir
                  </label>
                  <input 
                    type="date" 
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={performExport}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Unduh CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;