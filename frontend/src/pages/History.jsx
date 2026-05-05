import React, { useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Search, Trash2, ExternalLink } from 'lucide-react';
import useStore from '../store/useStore';
import { format } from 'date-fns';

const History = () => {
  const { history, fetchHistory } = useStore();

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-dark-950 p-6 space-y-6 overflow-hidden">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-400 font-sans">Test History</h2>
          <p className="text-xs text-dark-500 font-sans">Xem lại kết quả các lần thực thi API gần đây.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input 
              type="text" 
              placeholder="Tìm kiếm API..." 
              className="bg-dark-900 border border-dark-800 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary-500 transition-all font-sans"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-dark-900/90 backdrop-blur-sm z-10">
              <tr className="border-b border-dark-800">
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest">Request</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest">Duration</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-dark-800/30 transition-all group animate-fade-in">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark-200 font-medium font-sans">
                      {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.request?.method === 'GET' ? 'bg-green-500/10 text-green-500' : 
                          item.request?.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {item.request?.method || 'N/A'}
                        </span>
                        <span className="text-sm font-semibold text-dark-100 truncate max-w-[200px] font-sans">
                          {item.request?.name || 'Untitled Request'}
                        </span>
                      </div>
                      <span className="text-[10px] text-dark-500 truncate max-w-[300px] mt-1 font-mono">
                        {item.request?.url}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'pass' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
                      <span className={`text-xs font-bold font-sans ${item.status === 'pass' ? 'text-green-500' : 'text-red-500'}`}>
                        {item.status_code} {item.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-dark-400 font-sans font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {item.duration} ms
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 hover:bg-primary-500/10 hover:text-primary-400 rounded-lg transition-all text-dark-400 cursor-pointer" title="Xem chi tiết">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-dark-400 cursor-pointer" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-dark-600 italic font-sans">
                    Chưa có lịch sử thực thi nào. Hãy thử gửi một request!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
