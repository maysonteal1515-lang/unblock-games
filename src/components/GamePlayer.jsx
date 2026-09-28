import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ExternalLink, 
  Star, 
  Gamepad2, 
  Tv, 
  ShieldAlert
} from 'lucide-react';

export const GamePlayer = ({
  game,
  allGames,
  isFavorite,
  onBack,
  onToggleFavorite,
  onSwitchGame,
  onTriggerCloak
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const playerContainerRef = useRef(null);

  const toggleFullscreen = async () => {
    if (!playerContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await playerContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(game.iframeUrl, '_blank', 'noopener,noreferrer');
  };

  const getAspectRatioClass = () => {
    if (theaterMode) return 'w-full h-[85vh]';
    switch (game.aspectRatio) {
      case '16:9': return 'w-full max-w-4xl aspect-video';
      case '4:3': return 'w-full max-w-3xl aspect-[4/3]';
      case '1:1': return 'w-full max-w-xl aspect-square';
      default: return 'w-full max-w-4xl h-[620px]';
    }
  };

  const otherGames = allGames.filter(g => g.id !== game.id).slice(0, 6);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-6">
      {/* Top navigation & control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{game.title}</h2>
              <span className="text-xs text-slate-500 font-medium">· {game.category}</span>
            </div>
          </div>
        </div>

        {/* Player action tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleFavorite(game.id)}
            title={isFavorite ? "Remove favorite" : "Add to favorites"}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>

          <button
            onClick={() => setTheaterMode(!theaterMode)}
            title="Toggle Theater / Large View"
            className={`p-2 rounded-lg text-xs transition-colors ${
              theaterMode ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            onClick={handleReload}
            title="Reload game frame"
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenExternal}
            title="Open in new window"
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Full Screen Mode"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>

          <button
            onClick={onTriggerCloak}
            title="Emergency Cloak"
            className="p-2 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors ml-1"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Iframe Player Canvas */}
      <div 
        ref={playerContainerRef}
        className="flex flex-col items-center justify-center bg-black rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl"
      >
        <div className={`transition-all duration-200 ${getAspectRatioClass()} relative flex items-center justify-center bg-slate-950`}>
          <iframe
            key={reloadKey}
            src={game.iframeUrl}
            title={game.title}
            className="w-full h-full border-0 select-none"
            allow="autoplay; fullscreen; gamepad; focus-without-user-activation; clipboard-read; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
          />
        </div>
      </div>

      {/* Details & Controls cheat sheet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">About {game.title}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{game.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Controls & Guide</h4>
            <div className="space-y-1.5">
              {game.controls && game.controls.length > 0 ? (
                game.controls.map((ctrl, i) => (
                  <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80"></span>
                    <span>{ctrl}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">Standard mouse and arrow keys controls.</div>
              )}
            </div>
          </div>

          {game.tags && game.tags.length > 0 && (
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-slate-400 font-medium">Tags:</span>
              <span>{game.tags.join(' · ')}</span>
            </div>
          )}
        </div>

        {/* Quick Launch side column */}
        <div className="border-t md:border-t-0 md:border-l border-slate-800 md:pl-6 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>More Games</span>
          </h4>
          <div className="flex flex-col gap-1.5">
            {otherGames.map(og => (
              <button
                key={og.id}
                onClick={() => onSwitchGame(og)}
                className="w-full text-left px-3 py-2 text-xs rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="font-medium truncate">{og.title}</span>
                <span className="text-[10px] text-slate-500 shrink-0">{og.category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
