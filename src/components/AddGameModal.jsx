import React, { useState } from 'react';
import { X, Eye, Check } from 'lucide-react';

export const AddGameModal = ({
  isOpen,
  onClose,
  onAddGame
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [urlOrEmbed, setUrlOrEmbed] = useState('');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Extract src from iframe string if user pasted <iframe src="...">
  const extractUrl = (raw) => {
    const trimmed = raw.trim();
    if (trimmed.startsWith('<iframe')) {
      const match = trimmed.match(/src=["'](.*?)["']/);
      if (match && match[1]) return match[1];
    }
    return trimmed;
  };

  const handleTestPreview = () => {
    setError('');
    const extracted = extractUrl(urlOrEmbed);
    if (!extracted) {
      setError('Please provide a valid URL or iframe embed code.');
      return;
    }
    setPreviewUrl(extracted);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const finalUrl = extractUrl(urlOrEmbed);

    if (!title.trim()) {
      setError('Game title is required.');
      return;
    }
    if (!finalUrl) {
      setError('A valid iframe URL or embed code is required.');
      return;
    }

    const newGame = {
      id: 'custom-' + Date.now(),
      title: title.trim(),
      category,
      description: description.trim() || 'Custom added iframe game.',
      iframeUrl: finalUrl,
      aspectRatio,
      controls: controls ? controls.split(',').map(s => s.trim()) : ['Mouse / Keyboard'],
      badge: 'Custom',
      accentColor: '#38bdf8',
      isCustom: true
    };

    onAddGame(newGame);
    onClose();
    // Reset fields
    setTitle('');
    setUrlOrEmbed('');
    setDescription('');
    setControls('');
    setPreviewUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Add Game to JSON</h3>
            <p className="text-xs text-slate-400 mt-0.5">Embed any web game via iframe source or HTML code</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Game Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Super Hexagon, Slope, Minecraft 2D"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Arcade">Arcade</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Action">Action</option>
                <option value="Sports">Sports</option>
                <option value="Classic">Classic</option>
                <option value="Casual">Casual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="auto">Responsive Fluid</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Iframe URL or &lt;iframe&gt; code *
              </label>
              <button
                type="button"
                onClick={handleTestPreview}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <Eye className="w-3 h-3" />
                <span>Test Preview</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="https://... or <iframe src='...'></iframe>"
              value={urlOrEmbed}
              onChange={e => setUrlOrEmbed(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Live Preview Box */}
          {previewUrl && (
            <div className="border border-slate-800 rounded-lg p-2 bg-slate-950">
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Live Iframe Test:
              </span>
              <div className="w-full h-44 bg-black rounded overflow-hidden">
                <iframe
                  src={previewUrl}
                  title="Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Description
            </label>
            <input
              type="text"
              placeholder="Quick 1-sentence summary of the game"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Controls (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. WASD to drive, Space to drift"
              value={controls}
              onChange={e => setControls(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add to Games Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
