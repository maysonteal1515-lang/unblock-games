import React, { useState, useEffect, useMemo } from 'react';
import { Search, Shuffle, Gamepad2 } from 'lucide-react';
import { INITIAL_GAMES } from './data/defaultGames.js';
import { Header } from './components/Header.jsx';
import { GameCard } from './components/GameCard.jsx';
import { GamePlayer } from './components/GamePlayer.jsx';
import { AddGameModal } from './components/AddGameModal.jsx';
import { JsonModal } from './components/JsonModal.jsx';
import { PanicCloak } from './components/PanicCloak.jsx';

export default function App() {
  const [games, setGames] = useState(() => {
    try {
      const saved = localStorage.getItem('unblock_games_catalog');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(g => g.id));
          const missingDefaults = INITIAL_GAMES.filter(g => !existingIds.has(g.id));
          if (missingDefaults.length > 0) {
            return [...INITIAL_GAMES, ...parsed.filter(g => g.isCustom)];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load local games catalog, falling back to default', e);
    }
    return INITIAL_GAMES;
  });

  const [activeGame, setActiveGame] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('unblock_favorites');
      return saved ? JSON.parse(saved) : ['2048', 'snake'];
    } catch (e) {
      return ['2048', 'snake'];
    }
  });

  const [isCloaked, setIsCloaked] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  // Sync games catalog to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('unblock_games_catalog', JSON.stringify(games));
    } catch (e) {
      console.error('Failed to sync games to localStorage', e);
    }
  }, [games]);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('unblock_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to sync favorites to localStorage', e);
    }
  }, [favorites]);

  // Listen for 'Escape' key globally to toggle panic cloak
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCloaked(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddGame = (newGame) => {
    setGames(prev => [newGame, ...prev]);
    setActiveGame(newGame);
  };

  const handleDeleteCustomGame = (id, e) => {
    e.stopPropagation();
    setGames(prev => prev.filter(g => g.id !== id));
    if (activeGame && activeGame.id === id) {
      setActiveGame(null);
    }
  };

  const handleUpdateGamesFromJson = (newGames) => {
    setGames(newGames);
  };

  const handleResetDefaults = () => {
    setGames(INITIAL_GAMES);
    localStorage.removeItem('unblock_games_catalog');
  };

  const handleRandomPlay = () => {
    if (games.length === 0) return;
    const randomIndex = Math.floor(Math.random() * games.length);
    setActiveGame(games[randomIndex]);
  };

  // Filtered and sorted games
  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        // Category filter
        if (currentCategory === 'favorites') {
          if (!favorites.includes(game.id)) return false;
        } else if (currentCategory !== 'all') {
          if (game.category.toLowerCase() !== currentCategory.toLowerCase()) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = game.title.toLowerCase().includes(q);
          const matchCat = game.category.toLowerCase().includes(q);
          const matchDesc = game.description.toLowerCase().includes(q);
          const matchTags = game.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchCat && !matchDesc && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'az') return a.title.localeCompare(b.title);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return 0; // featured default
      });
  }, [games, currentCategory, searchQuery, sortBy, favorites]);

  // If Panic Cloak is active, render disguised school document
  if (isCloaked) {
    return <PanicCloak onExit={() => setIsCloaked(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Bar Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={cat => {
          setCurrentCategory(cat);
          if (activeGame) setActiveGame(null);
        }}
        favoritesCount={favorites.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onTriggerCloak={() => setIsCloaked(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeGame ? (
          // Active Game Player View
          <GamePlayer
            game={activeGame}
            allGames={games}
            isFavorite={favorites.includes(activeGame.id)}
            onBack={() => setActiveGame(null)}
            onToggleFavorite={handleToggleFavorite}
            onSwitchGame={g => setActiveGame(g)}
            onTriggerCloak={() => setIsCloaked(true)}
          />
        ) : (
          // Games Catalog & Library View
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Hero Banner Section */}
            <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>UNBLOCKED BROWSER ARCADE</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">Stored via JSON</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
                  High-speed, unblocked games running anywhere.
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Every game runs seamlessly inside a responsive sandbox iframe. Store, add, or download the full games catalog through the built-in <code className="text-cyan-300 font-mono text-xs">games.json</code> manager.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleRandomPlay}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all shadow-sm"
                >
                  <Shuffle className="w-4 h-4 text-cyan-400" />
                  <span>Random Game</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20"
                >
                  <span>+ Custom Iframe</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search games, tags, or categories..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Sort and Count */}
              <div className="flex items-center gap-3 justify-between sm:justify-end text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="az">Alphabetical (A-Z)</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                <div className="font-mono text-xs text-slate-500 tabular-nums">
                  {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
                </div>
              </div>
            </div>

            {/* Games Grid */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onPlay={g => setActiveGame(g)}
                    onToggleFavorite={handleToggleFavorite}
                    onDeleteCustom={handleDeleteCustomGame}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center">
                <Gamepad2 className="w-10 h-10 text-slate-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-300">No games found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {searchQuery ? `No results matching "${searchQuery}". Try a different keyword.` : "There are currently no games in this category."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">UnblockVault</span>
            <span>·</span>
            <span>Client-side iframe runner & JSON catalog</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Export games.json
            </button>
            <span>·</span>
            <button
              onClick={() => setIsCloaked(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Panic Mode (Esc)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />

      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        onResetDefaults={handleResetDefaults}
        games={games}
        onUpdateGamesFromJson={handleUpdateGamesFromJson}
      />
    </div>
  );
}
