import React, { useState } from 'react';
import { X, Copy, Download, Check, RotateCcw } from 'lucide-react';

export const JsonModal = ({
  isOpen,
  onClose,
  games,
  onUpdateGamesFromJson,
  onResetDefaults
}) => {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(games, null, 2));
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [hasError, setHasError] = useState(false);

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(games, null, 2));
      setStatusMsg('');
      setHasError(false);
    }
  }, [isOpen, games]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setStatusMsg('Copied games.json to clipboard!');
    setHasError(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'games.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg('Downloaded games.json successfully.');
    setHasError(false);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON root must be an array of game objects [ { ... } ].');
      }
      for (const item of parsed) {
        if (!item.id || !item.title || !item.iframeUrl) {
          throw new Error('Each game object must have at least "id", "title", and "iframeUrl".');
        }
      }
      onUpdateGamesFromJson(parsed);
      setStatusMsg('Catalog updated successfully from JSON!');
      setHasError(false);
    } catch (err) {
      setHasError(true);
      setStatusMsg(err.message || 'Invalid JSON syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">games.json Storage Manager</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All games and their iframes are stored as JSON. You can edit, copy, or download it.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        {statusMsg && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
            hasError ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Code Editor */}
        <div className="mt-3 flex-1 min-h-[320px] flex flex-col">
          <label className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Raw JSON Data:</span>
            <span>{games.length} games configured</span>
          </label>
          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-xs text-cyan-300 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
          />
        </div>

        {/* Action bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset catalog back to original 9 bundled games"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Close
            </button>
            <button
              onClick={handleApplyJson}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
