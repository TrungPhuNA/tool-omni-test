import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Download, X, FileJson, CheckCircle2 } from 'lucide-react';
import { generateMarkdown, downloadMarkdown, exportToWord } from '../../../utils/docGenerator';

const ExportDocModal = ({ isOpen, onClose, folder, requests }) => {
  const [format, setFormat] = useState('md');
  const [includeSnapshots, setIncludeSnapshots] = useState(true);
  const [customFileName, setCustomFileName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const folderRequests = requests.map(req => ({
        ...req,
        type: 'request'
      }));
      const data = folderRequests;
      const markdown = generateMarkdown(folder.name, data);

      const finalFileName = customFileName.trim() || folder.name;

      if (format === 'md') {
        downloadMarkdown(finalFileName, markdown);
      } else {
        await exportToWord(finalFileName, markdown);
      }
      
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export failed', error);
      setIsExporting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-dark-800 flex items-center justify-between bg-dark-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-xl">
              <FileText className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark-100">Xuất tài liệu API</h3>
              <p className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">Thư mục: {folder.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-full text-dark-500 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Format Selection */}
          <div className="space-y-4">
            <label className="text-xs font-black text-dark-500 uppercase tracking-widest ml-1">Định dạng tệp tin</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFormat('md')}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${format === 'md' ? 'border-primary-500 bg-primary-500/5' : 'border-dark-800 hover:border-dark-700 bg-dark-800/30'}`}
              >
                <div className={`p-3 rounded-xl ${format === 'md' ? 'bg-primary-500 text-white shadow-lg shadow-primary-900/40' : 'bg-dark-700 text-dark-400'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className={`block font-bold ${format === 'md' ? 'text-dark-100' : 'text-dark-400'}`}>Markdown</span>
                  <span className="text-[10px] text-dark-600 font-medium">(.md) - Mặc định</span>
                </div>
              </button>

              <button 
                onClick={() => setFormat('word')}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${format === 'word' ? 'border-blue-500 bg-blue-500/5' : 'border-dark-800 hover:border-dark-700 bg-dark-800/30'}`}
              >
                <div className={`p-3 rounded-xl ${format === 'word' ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/40' : 'bg-dark-700 text-dark-400'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className={`block font-bold ${format === 'word' ? 'text-dark-100' : 'text-dark-400'}`}>MS Word</span>
                  <span className="text-[10px] text-dark-600 font-medium">(.docx) - Chuyên nghiệp</span>
                </div>
              </button>
            </div>
          </div>

          {/* Filename Input */}
          <div className="space-y-4">
            <label className="text-xs font-black text-dark-500 uppercase tracking-widest ml-1">Tên tệp tin (Tùy chọn)</label>
            <div className="relative group">
              <input 
                type="text" 
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder={folder.name}
                className="w-full bg-dark-800/50 border border-dark-700 rounded-xl px-4 py-3 text-sm text-dark-100 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all shadow-inner"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-dark-600 uppercase tracking-widest pointer-events-none">
                .{format}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-dark-800/30 rounded-2xl border border-dark-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FileJson className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <span className="text-sm font-bold text-dark-200 block">Bao gồm Snapshots</span>
                  <span className="text-[10px] text-dark-500 font-medium">Kèm theo các mẫu Response đã lưu</span>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={includeSnapshots}
                onChange={(e) => setIncludeSnapshots(e.target.checked)}
                className="w-5 h-5 accent-primary-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-dark-900/50 border-t border-dark-800 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3.5 rounded-xl border border-dark-700 text-dark-300 font-bold hover:bg-dark-800 transition-all active:scale-95 text-sm"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex-2 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all active:scale-95 shadow-xl shadow-primary-900/20 disabled:opacity-50 text-sm"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Tải tài liệu ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExportDocModal;
