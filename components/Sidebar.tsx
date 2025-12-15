import React from 'react';
import { LayoutDashboard, Table2, Settings, PieChart, ShieldCheck } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 left-0">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="p-2 bg-blue-600 rounded-lg">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">AdminSum</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-4">
          Utama
        </div>
        <a href="#" className="flex items-center space-x-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-600/20">
          <LayoutDashboard size={20} />
          <span className="font-medium">Dasbor</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          <Table2 size={20} />
          <span>Manajemen Data</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          <PieChart size={20} />
          <span>Analitik</span>
        </a>
        
        <div className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
          Sistem
        </div>
        <a href="#" className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          <Settings size={20} />
          <span>Pengaturan</span>
        </a>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-slate-500">Pengguna Super</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;