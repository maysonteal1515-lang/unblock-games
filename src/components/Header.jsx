import React from 'react';
import { ShieldAlert, Plus, Code, Gamepad2 } from 'lucide-react';

export const Header = ({
  currentCategory,
  onSelectCategory,
  favoritesCount,
  onOpenAddModal,
  onOpenJsonModal,
  onTriggerCloak,
}) => {
  const categories = [
    { id: 'all', label: 'All Games' },
    { id: 'N64', label: 'Nintendo 64' },
    { id: 'Arcade', label: 'Arcade' },
    { id: 'Puzzle', label: 'Puzzle' },
    { id: 'Action', label: 'Action' },
    { id: 'Sports', label: 'Sports' },
    { id: 'favorites', label: `Favorites (${favoritesCount})` }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div 
          onClick={() => onSelectCategory('all')} 
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-900/20 group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            UnblockVault
          </span>
        </div>

        {/* Zone 2: Navigation links / filter tabs */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
          {categories.map(cat => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTriggerCloak}
            title="Emergency Panic Button (Disguises screen as study notes)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panic Cloak</span>
          </button>

          <button
            onClick={onOpenJsonModal}
            title="Inspect or edit games.json"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">JSON Catalog</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap font-semibold shadow-sm shadow-cyan-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Game</span>
          </button>
        </div>
      </div>
    </header>
  );
};
