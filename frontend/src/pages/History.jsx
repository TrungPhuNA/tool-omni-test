import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle, Search, Trash2, ExternalLink, Activity, BarChart3, Terminal, X, Users, AlertCircle, HelpCircle, Zap } from 'lucide-react';
import useStore from '../store/useStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '../components/common/Skeleton';

const History = () => {
  const { history, fetchHistory, deleteHistory, isLoading } = useStore();
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Lưu ID cần xóa

  useEffect(() => {
    fetchHistory();
  }, []);

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteHistory(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const filteredHistory = history.filter(item => {
    const name = item.Request?.name || item.load_summary?.scenarioName || item.load_summary?.steps?.[0]?.name || '';
    const url = item.Request?.url || item.load_summary?.steps?.[0]?.url || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           url.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col bg-dark-950 p-6 space-y-6 overflow-hidden">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-400 font-sans">Lịch sử Kiểm thử</h2>
          <p className="text-xs text-dark-500 font-sans">Xem lại kết quả các lần thực thi API gần đây.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input 
              type="text" 
              placeholder="Tìm kiếm API..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-900 border border-dark-800 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary-500 transition-all font-sans text-dark-100"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 glass-card overflow-hidden flex flex-col border border-dark-800/50">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-dark-900/90 backdrop-blur-sm z-10">
              <tr className="border-b border-dark-800">
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest">Request & Cấu hình</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest">Hiệu năng</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-dark-500 tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-0">
                    <TableSkeleton rows={10} cols={5} />
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
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
                          item.load_summary?.isScenario ? 'bg-purple-500/10 text-purple-400' :
                          (item.Request?.method || item.request?.method || item.load_summary?.steps?.[0]?.method) === 'GET' ? 'bg-green-500/10 text-green-500' : 
                          (item.Request?.method || item.request?.method || item.load_summary?.steps?.[0]?.method) === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {item.load_summary?.isScenario ? 'FLOW' : (item.Request?.method || item.request?.method || item.load_summary?.steps?.[0]?.method || 'N/A')}
                        </span>
                        <span className="text-sm font-semibold text-dark-100 truncate max-w-[200px] font-sans">
                          {item.load_summary?.scenarioName || item.Request?.name || item.request?.name || item.load_summary?.steps?.[0]?.name || 'Chưa đặt tên'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                         <span className="text-[10px] text-dark-500 truncate max-w-[200px] font-mono">
                           {item.Request?.url || (item.load_summary?.isScenario ? 'Kịch bản luồng' : 'N/A')}
                         </span>
                         {item.load_summary?.isScenario && (
                           <div className="flex items-center gap-2 px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[9px] font-bold">
                              <Activity className="w-2.5 h-2.5" />
                              {item.load_summary?.steps?.length || 0} bước
                           </div>
                         )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'pass' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
                      <span className={`text-xs font-bold font-sans ${item.status === 'pass' ? 'text-green-500' : 'text-red-500'}`}>
                        {item.type === 'load' ? 'LOAD TEST' : item.status_code} {item.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-dark-400 font-sans font-medium">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        Avg: {item.duration} ms
                      </div>
                      {item.load_summary && (
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-2 py-0.5 bg-dark-900 border border-dark-800 rounded-full text-[10px] text-dark-400 flex items-center gap-1 shadow-sm">
                            <Users className="w-3 h-3 text-primary-500" /> 
                            <span className="font-bold text-dark-200">{item.load_summary?.vus || 0}</span> 
                            <span className="opacity-60">VUs</span>
                          </span>
                          <span className="px-2 py-0.5 bg-dark-900 border border-dark-800 rounded-full text-[10px] text-dark-400 flex items-center gap-1 shadow-sm">
                            <Zap className="w-3 h-3 text-yellow-500" /> 
                            <span className="font-bold text-dark-200">{item.load_summary?.http_reqs || 0}</span> 
                            <span className="opacity-60">tổng request</span>
                          </span>
                          {item.load_summary?.iterations && (
                            <span className="text-[10px] text-dark-500 italic">
                              (~{Math.round(item.load_summary.iterations / (item.load_summary.vus || 1))} lượt/VU)
                            </span>
                          )}
                        </div>
                      )}
                      {item.load_summary && (
                        <div className="text-[10px] text-dark-500 flex items-center gap-1">
                          <AlertCircle className={`w-3 h-3 ${item.load_summary.errorRate > 0 ? 'text-red-500' : 'text-green-500'}`} />
                          {item.load_summary.errorRate}% Lỗi
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="p-2 hover:bg-primary-500/10 hover:text-primary-400 rounded-lg transition-all text-dark-400 cursor-pointer" 
                        title="Xem chi tiết"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(item.id);
                        }}
                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-dark-400 cursor-pointer" 
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-dark-600 italic font-sans">
                    Chưa có lịch sử thực thi nào. Hãy thử chạy test ngay!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dark-900 border border-dark-800 rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <header className="p-6 border-b border-dark-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${selectedItem.type === 'load' ? 'bg-primary-500/10 text-primary-500' : 'bg-green-500/10 text-green-500'}`}>
                    {selectedItem.type === 'load' ? <BarChart3 className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-50">
                      {selectedItem.load_summary?.scenarioName || selectedItem.Request?.name || 'Kết quả Kiểm thử'}
                    </h3>
                    <p className="text-xs text-dark-500 mt-0.5">{selectedItem.Request?.url || 'Scenario Workflow'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-dark-800 rounded-xl text-dark-400 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Stats Grid */}
                {selectedItem.load_summary && (
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'P95 Response Time', value: `${selectedItem.load_summary.p95} ms`, icon: Clock, color: 'text-primary-500' },
                      { label: 'Lưu lượng (RPS)', value: selectedItem.load_summary.rps, icon: Activity, color: 'text-green-500' },
                      { label: 'Tổng Request', value: selectedItem.load_summary.http_reqs || 0, icon: Zap, color: 'text-yellow-500' },
                      { label: 'Tỉ lệ lỗi', value: `${selectedItem.load_summary.errorRate}%`, icon: AlertCircle, color: selectedItem.load_summary.errorRate > 0 ? 'text-red-500' : 'text-green-500' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                          <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-xl font-bold text-dark-50">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scenario Steps Breakdown */}
                {selectedItem.load_summary?.isScenario && selectedItem.load_summary.steps && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-dark-200 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      Chi tiết các bước trong luồng
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedItem.load_summary.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-dark-800/40 p-3 rounded-xl border border-dark-700/50">
                          <span className="text-[10px] font-bold text-dark-500 w-6">#{idx + 1}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            step.method === 'GET' ? 'bg-green-500/10 text-green-500' : 
                            step.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {step.method}
                          </span>
                          <span className="text-sm text-dark-100 font-medium">{step.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Log View */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-dark-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary-500" />
                    Nhật ký chi tiết (K6 Output)
                  </h4>
                  <div className="bg-black/40 rounded-2xl p-4 font-mono text-[11px] text-dark-400 overflow-x-auto max-h-96 border border-dark-800/50">
                    <pre className="whitespace-pre-wrap">
                      {selectedItem.response?.full_log || 'Không có dữ liệu log.'}
                    </pre>
                  </div>
                </div>
              </div>
              
              <footer className="p-4 bg-dark-800/30 border-t border-dark-800 flex justify-end">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </footer>
            </motion.div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-900 border border-dark-800 rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-dark-50 mb-2">Xác nhận xóa?</h3>
              <p className="text-sm text-dark-400 mb-8">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bản ghi này không?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
