import React from 'react';
import { Play, Star, Trash2 } from 'lucide-react';

export const GameCard = ({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onDeleteCustom
}) => {
  return (
    <div 
      onClick={() => onPlay(game)}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-cyan-950/20"
    >
      {/* Top row: category metadata & actions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Zero-Pill unboxed metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span 
              className="w-2 h-2 rounded-full inline-block shrink-0" 
              style={{ backgroundColor: game.accentColor || '#38bdf8' }} 
            />
            <span className="font-medium text-slate-300">{game.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{game.aspectRatio || 'Responsive'}</span>
          </div>

          <div className="flex items-center gap-1">
            {game.isCustom && onDeleteCustom && (
              <button
                onClick={(e) => onDeleteCustom(game.id, e)}
                title="Remove custom game"
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => onToggleFavorite(game.id, e)}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`p-1 rounded transition-colors ${
                isFavorite 
                  ? 'text-amber-400 hover:text-amber-300' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
          {game.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {game.description}
        </p>
      </div>

      {/* Bottom row: controls hint and play affordance */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate max-w-[180px]">
          {game.controls && game.controls[0] ? game.controls[0] : 'Click or keyboard'}
        </span>

        <span className="flex items-center gap-1 font-medium text-cyan-400 group-hover:translate-x-0.5 transition-transform">
          <span>Play</span>
          <Play className="w-3 h-3 fill-current" />
        </span>
      </div>
    </div>
  );
};
