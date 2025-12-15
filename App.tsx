import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Menu, X, Loader2, Cloud, CloudOff } from 'lucide-react';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import DataEntry from './components/DataEntry';
import DataTable from './components/DataTable';
import { DataItem, SummaryStats } from './types';
import { 
  subscribeToData, 
  addItem, 
  deleteItem, 
  addBulkItems, 
  clearAllItems 
} from './services/supabase';

export function App() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Real-time Database Subscription
  useEffect(() => {
    setIsSyncing(true);
    let unsubscribe: () => void;

    // We pass two callbacks: one for data success, one for errors
    unsubscribe = subscribeToData(
      (newItems) => {
        setItems(newItems);
        setIsSyncing(false);
        setConnectionError(false);
      },
      (error) => {
        console.error("Database connection error:", error);
        setConnectionError(true);
        setIsSyncing(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filter Items based on search and category
  const filteredItems = useMemo(() => {
    let result = items;

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => (item.category || 'Tak Berkategori') === selectedCategory);
    }

    // Search Filter
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(lowerTerm));
    }

    return result;
  }, [items, selectedCategory, searchTerm]);

  // Derive unique categories from ALL items (so dropdown options persist during search)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(item => {
      cats.add(item.category || 'Tak Berkategori');
    });
    return Array.from(cats).sort();
  }, [items]);

  // Derived state for summary statistics based on FILTERED items
  const stats: SummaryStats = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSum: 0, count: 0, average: 0, highest: 0 };
    }
    const totalSum = filteredItems.reduce((acc, curr) => acc + curr.value, 0);
    const highest = Math.max(...filteredItems.map(i => i.value));
    
    return {
      totalSum,
      count: filteredItems.length,
      average: totalSum / filteredItems.length,
      highest: highest === -Infinity ? 0 : highest
    };
  }, [filteredItems]);

  const handleAddItem = async (newItem: Omit<DataItem, 'id' | 'createdAt'>) => {
    setIsSyncing(true);
    try {
      await addItem(newItem);
    } catch (error) {
      console.error("Failed to add item", error);
      setConnectionError(true);
      setIsSyncing(false);
    }
  };

  const handleBulkAdd = async (newItems: Omit<DataItem, 'id' | 'createdAt'>[]) => {
    setIsSyncing(true);
    try {
      await addBulkItems(newItems);
    } catch (error) {
      console.error("Failed to bulk add", error);
      setIsSyncing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    // Optimistic UI update could be added here, but relying on realtime for truth
    try {
      await deleteItem(id);
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  const handleClearAll = async () => {
      if (items.length === 0) return;

      if(window.confirm("Apakah Anda yakin ingin menghapus SEMUA data secara PERMANEN dari database?")) {
          setIsSyncing(true);
          try {
            // Pass all IDs to ensure clean deletion of known items
            const allIds = items.map(i => i.id);
            await clearAllItems(allIds);
            
            setSearchTerm('');
            setSelectedCategory('all');
          } catch (error) {
            console.error("Failed to clear items", error);
            alert("Gagal menghapus data. Silakan coba lagi.");
          } finally {
            // Ensure syncing state is cleared if realtime doesn't pick it up immediately
            // or if it was an error
            setTimeout(() => setIsSyncing(false), 1000);
          }
      }
  }

  // Prepare chart data (take top 15 recent from filtered list or full list?)
  // Usually charts reflect the filter too
  const chartData = filteredItems.slice(0, 15).map(i => ({
    name: i.name.length > 10 ? i.name.substring(0, 10) + '...' : i.name,
    value: i.value
  })).reverse();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="h-full relative">
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
                <X size={24} />
            </button>
             <div className="p-6 flex items-center space-x-3 border-b border-slate-800 text-slate-300">
                <span className="text-xl font-bold text-white tracking-tight">AdminSum</span>
            </div>
             <nav className="p-4 space-y-2 text-slate-300">
                <a href="#" className="flex items-center space-x-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-600/20">
                    <span className="font-medium">Dasbor</span>
                </a>
             </nav>
         </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden mr-4 text-slate-500 hover:text-slate-800"
            >
                <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Ringkasan Keuangan</h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
             {/* Cloud Status Indicator */}
             <div className={`hidden md:flex items-center px-3 py-1 rounded-full border transition-colors ${connectionError ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100'}`}>
               {connectionError ? (
                  <div className="flex items-center text-xs font-medium">
                    <CloudOff size={12} className="mr-2" />
                    Luring
                  </div>
               ) : isSyncing ? (
                 <div className="flex items-center text-xs text-blue-600 font-medium">
                   <Loader2 size={12} className="animate-spin mr-2" />
                   Menyinkronkan...
                 </div>
               ) : (
                 <div className="flex items-center text-xs text-slate-500 font-medium">
                   <Cloud size={12} className="text-emerald-500 mr-2" />
                   Awan Aktif
                 </div>
               )}
             </div>

             <div className="hidden sm:block h-8 w-px bg-slate-200"></div>

             <div className="hidden sm:block text-right">
                <p className="text-xs text-slate-400">Tanggal Saat Ini</p>
                <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('id-ID')}</p>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form & Chart */}
              <div className="space-y-6 lg:col-span-1">
                <DataEntry onAdd={handleAddItem} onBulkAdd={handleBulkAdd} />
                
                {/* Visual Chart Card */}
                {items.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribusi {filteredItems.length !== items.length && '(Difilter)'}</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="name" 
                                tick={{fontSize: 10, fill: '#64748b'}} 
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                            <YAxis 
                                hide 
                            />
                            <RechartsTooltip 
                                contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                                itemStyle={{color: '#fff'}}
                                cursor={{fill: '#f1f5f9'}}
                                formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                    </div>
                )}
              </div>

              {/* Right Column: Data Table */}
              <div className="lg:col-span-2 h-[600px] lg:h-auto">
                <DataTable 
                  data={filteredItems} 
                  originalDataCount={items.length}
                  categories={categories}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onDelete={handleDeleteItem} 
                  onClearAll={handleClearAll} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}