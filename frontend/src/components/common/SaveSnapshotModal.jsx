import React, { useState, useEffect } from 'react';
import { X, Save, Bookmark } from 'lucide-react';

const SaveSnapshotModal = ({ isOpen, onClose, onSave, defaultName }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(defaultName || '');
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-900 border border-dark-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
        <div className="p-6 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Bookmark className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-dark-100">Lưu Snapshot (Log)</h3>
          </div>
          <button onClick={onClose} className="text-dark-500 hover:text-dark-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-dark-500 uppercase tracking-widest">Tên Log gợi nhớ</label>
            <input
              autoFocus
              type="text"
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-dark-100"
              placeholder="Ví dụ: Case đăng nhập thành công"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSave(name)}
            />
            <p className="text-[10px] text-dark-500 italic">Gợi ý: {defaultName}</p>
          </div>
        </div>

        <div className="p-6 bg-dark-950/50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-dark-400 hover:text-dark-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(name)}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-900/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Lưu Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSnapshotModal;
