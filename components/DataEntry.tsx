import React, { useState } from 'react';
import { Plus, Sparkles, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { generateMockData } from '../services/geminiService';
import { DataItem, DataCategory } from '../types';

interface DataEntryProps {
  onAdd: (item: Omit<DataItem, 'id' | 'createdAt'>) => void;
  onBulkAdd: (items: Omit<DataItem, 'id' | 'createdAt'>[]) => void;
}

const DataEntry: React.FC<DataEntryProps> = ({ onAdd, onBulkAdd }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<string>('');
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [aiTopic, setAiTopic] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;
    
    const numValue = parseFloat(value);
    const finalValue = entryType === 'expense' ? -Math.abs(numValue) : Math.abs(numValue);

    onAdd({
      name,
      value: finalValue,
      category: category || undefined
    });

    setName('');
    setValue('');
    setCategory('');
    // Keep the entry type selection for faster data entry of same type
  };

  const handleAiGenerate = async () => {
    if (!aiTopic) return;
    setIsAiLoading(true);
    try {
      const data = await generateMockData(aiTopic);
      // AI data is usually positive; we assume it follows the user's intent or is generic.
      onBulkAdd(data);
      setAiTopic('');
      setShowAiInput(false);
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Tambah Entri Baru</h2>
        <button
          onClick={() => setShowAiInput(!showAiInput)}
          className="text-sm text-purple-600 flex items-center hover:text-purple-700 transition-colors"
        >
          <Sparkles size={16} className="mr-1" />
          {showAiInput ? 'Tutup AI' : 'Isi Otomatis AI'}
        </button>
      </div>

      {showAiInput && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <label className="block text-sm font-medium text-purple-900 mb-2">
            Minta AI untuk membuat data
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="cth. 'Pengeluaran Belanja Bulanan', 'Gaji Karyawan'..."
              className="flex-1 px-4 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
              disabled={isAiLoading}
            />
            <button
              onClick={handleAiGenerate}
              disabled={!aiTopic || isAiLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : 'Buat'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Entry Type Toggle */}
        <div className="grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => setEntryType('income')}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                    entryType === 'income'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
                <TrendingUp size={16} />
                Pemasukan
            </button>
            <button
                type="button"
                onClick={() => setEntryType('expense')}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                    entryType === 'expense'
                    ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
                <TrendingDown size={16} />
                Pengeluaran
            </button>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Nama Item
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan deskripsi..."
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            Kategori
          </label>
          <input
            id="category"
            list="category-options"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Pilih atau ketik kategori..."
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
          />
          <datalist id="category-options">
            {Object.values(DataCategory).map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-1">
            Jumlah (Rp) {entryType === 'income' ? '+' : '-'}
          </label>
          <input
            id="value"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            className={`w-full px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 bg-white ${
                entryType === 'expense' 
                ? 'border-red-200 focus:ring-red-500/20 focus:border-red-500 text-red-700 placeholder:text-red-300' 
                : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={!name || !value}
          className={`w-full py-2.5 text-white rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
              entryType === 'expense'
              ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
          }`}
        >
          {entryType === 'expense' ? <TrendingDown size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {entryType === 'expense' ? 'Tambah Pengeluaran' : 'Tambah Pemasukan'}
        </button>
      </form>
    </div>
  );
};

export default DataEntry;