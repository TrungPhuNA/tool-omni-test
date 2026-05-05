import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Clock, Users, Globe, Zap, BarChart3, AlertCircle, Terminal, X, HelpCircle, ChevronRight, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const LoadTest = () => {
  const { 
    activeRequest, 
    activeEnvironment, 
    environments, 
    collections,
    fetchEnvironments, 
    setActiveEnvironment,
    setActiveRequest,
    token 
  } = useStore();
  
  const [targetVus, setTargetVus] = useState(10);
  const [duration, setDuration] = useState('30s');
  const [isRunning, setIsRunning] = useState(false);
  const [testId, setTestId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

  const socketRef = useRef(null);
  const logEndRef = useRef(null);
  const progressInterval = useRef(null);
  const currentTestIdRef = useRef(null);

  useEffect(() => {
    fetchEnvironments();
    const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    const socketUrl = rawUrl.replace(/\/api\/v1\/?$/, '');
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => console.log('Socket Connected'));

    // Lắng nghe k6:progress (Log và Metrics từ Terminal)
    socketRef.current.on('k6:progress', (data) => {
      if (data.testId === currentTestIdRef.current) {
        setLogs(prev => [...prev, data.output].slice(-200));

        // Phân tích VUs từ dòng output (Regex)
        const vusMatch = data.output.match(/(\d+)\/\d+ VUs/) || data.output.match(/(\d+)\s+looping VUs/);
        if (vusMatch) {
          const vusCount = parseInt(vusMatch[1]);
          setMetrics(prev => [...prev, {
            time: new Date().toLocaleTimeString(),
            vus: vusCount
          }].slice(-60));
        }
      }
    });

    socketRef.current.on('k6:error', (data) => {
      if (data.testId === currentTestIdRef.current) {
        setLogs(prev => [...prev, `[LỖI] ${data.message}`]);
        setIsRunning(false);
        clearInterval(progressInterval.current);
        showNotify(data.message, 'error');
      }
    });

    socketRef.current.on('k6:done', (data) => {
      if (data.testId === currentTestIdRef.current) {
        setIsRunning(false);
        setProgress(100);
        clearInterval(progressInterval.current);
        setLogs(prev => [...prev, '--- KIỂM THỬ HOÀN TẤT ---']);
        showNotify('Kiểm thử hoàn tất!', 'success');
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const showNotify = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const startTest = async () => {
    if (!activeRequest?.id) {
      showNotify('Vui lòng chọn một Request trước!', 'warning');
      return;
    }

    setIsRunning(true);
    setLogs(['[HỆ THỐNG] Đang chuẩn bị kịch bản test...']);
    setMetrics([]);
    setProgress(0);
    
    const durSec = parseInt(duration) || 10;
    const totalDuration = (durSec + 4) * 1000;
    let startTime = Date.now();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1'}/loadtest/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: activeRequest.id,
          method: activeRequest.method,
          url: getResolvedUrl(),
          headers: activeRequest.headers,
          body: activeRequest.body,
          vus: parseInt(targetVus),
          duration: `${durSec}s`
        })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        const newTestId = data.data.testId;
        setTestId(newTestId);
        currentTestIdRef.current = newTestId;
        
        if (progressInterval.current) clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const p = Math.min(Math.round((elapsed / totalDuration) * 100), 99);
          setProgress(p);
        }, 300);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setIsRunning(false);
      setLogs(prev => [...prev, `[LỖI] ${error.message}`]);
      showNotify(error.message, 'error');
    }
  };

  const stopTest = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1'}/loadtest/stop`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ testId: currentTestIdRef.current })
      });
      setIsRunning(false);
      setShowStopConfirm(false);
      clearInterval(progressInterval.current);
      setLogs(prev => [...prev, '--- ĐÃ DỪNG KIỂM THỬ ---']);
      showNotify('Đã dừng k6.', 'info');
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const getResolvedUrl = () => {
    if (!activeRequest?.url) return 'Chưa có URL';
    let url = activeRequest.url;
    if (activeEnvironment?.variables) {
      Object.entries(activeEnvironment.variables).forEach(([key, value]) => {
        url = url.replace(`{{${key}}}`, value);
      });
    }
    return url;
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-950 p-6 space-y-6 overflow-hidden relative">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-500' :
              notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
              'bg-primary-500/20 border-primary-500 text-primary-400'
            }`}
          >
            {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            <span className="text-sm font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-400 font-sans">Kiểm thử Hiệu năng (Load Testing)</h2>
          <p className="text-xs text-dark-500 font-sans">Kiểm tra khả năng chịu tải của API với engine k6 chuyên nghiệp.</p>
        </div>
        <button
          onClick={() => isRunning ? setShowStopConfirm(true) : startTest()}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
            isRunning 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
              : 'bg-primary-500 hover:bg-primary-600 text-dark-950 shadow-primary-500/20'
          }`}
        >
          {isRunning ? (
            <><Square className="w-4 h-4 fill-current" /> Dừng Test</>
          ) : (
            <><Play className="w-4 h-4 fill-current" /> Bắt đầu Kiểm thử</>
          )}
        </button>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          <section className="bg-dark-900/50 p-6 rounded-2xl border border-dark-800/50 space-y-6">
            <div className="flex items-center gap-2 text-primary-400 border-b border-dark-800 pb-4">
              <Zap className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Cấu hình Test</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-1">Môi trường</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
                  <select 
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-100 outline-none focus:border-primary-500 appearance-none cursor-pointer"
                    value={activeEnvironment?.id || ''}
                    onChange={(e) => {
                      const env = environments.find(ev => ev.id == e.target.value);
                      setActiveEnvironment(env || null);
                    }}
                  >
                    <option value="">Mặc định (Local)</option>
                    {environments.map(env => (
                      <option key={env.id} value={env.id}>{env.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-1">Request đang chọn</label>
                <div className="relative">
                   <select 
                      className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-dark-100 outline-none focus:border-primary-500 appearance-none cursor-pointer"
                      value={activeRequest?.id || ''}
                      onChange={(e) => {
                        for (const col of collections) {
                          const req = col.requests?.find(r => r.id == e.target.value);
                          if (req) { setActiveRequest(req); break; }
                        }
                      }}
                   >
                      <option value="">-- Chọn API --</option>
                      {collections.map(col => (
                        <optgroup key={col.id} label={col.name} className="bg-dark-900">
                          {col.requests?.map(req => (
                            <option key={req.id} value={req.id}>{req.method} - {req.name}</option>
                          ))}
                        </optgroup>
                      ))}
                   </select>
                   <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-600 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-1">Số VUs</label>
                  <input type="number" value={targetVus} onChange={(e) => setTargetVus(e.target.value)} disabled={isRunning} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-dark-100 outline-none focus:border-primary-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-1">Thời gian (s)</label>
                  <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} disabled={isRunning} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-dark-100 outline-none focus:border-primary-500" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-dark-900/50 p-6 rounded-2xl border border-dark-800/50 space-y-4">
            <div className="flex items-center gap-2 text-primary-400">
              <BarChart3 className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Thông số</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-dark-950 p-3 rounded-xl border border-dark-800">
                <p className="text-[9px] font-bold text-dark-500 uppercase mb-1">Target URL</p>
                <p className="text-[10px] font-mono text-dark-300 break-all">{getResolvedUrl()}</p>
              </div>
              <div className="bg-dark-950 p-3 rounded-xl border border-dark-800">
                <p className="text-[9px] font-bold text-dark-500 uppercase mb-1">Phương thức</p>
                <span className="text-xs font-bold text-primary-400">{activeRequest?.method || 'GET'}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <section className="bg-dark-900/50 p-6 rounded-2xl border border-dark-800 flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-primary-400 uppercase flex items-center gap-2">
                <Activity className="w-5 h-5" /> Biểu đồ thời gian thực
              </h3>
              {isRunning && <div className="text-[10px] font-bold text-green-500 animate-pulse">ĐANG CHẠY</div>}
            </div>

            {(isRunning || progress > 0) && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-dark-500 uppercase">
                  <span>Tiến độ tổng thể</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
            )}

            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorVus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="vus" name="Người dùng (VUs)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVus)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-dark-900/50 rounded-2xl border border-dark-800 flex flex-col flex-1 min-h-[200px] overflow-hidden">
            <header className="px-6 py-3 border-b border-dark-800 flex items-center justify-between bg-dark-950/50">
              <div className="flex items-center gap-2 text-dark-400">
                <Terminal className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">K6 Output Stream</h3>
              </div>
              <button onClick={() => setLogs([])} className="text-[10px] font-bold text-dark-500 hover:text-dark-300 transition-all uppercase">Xóa Log</button>
            </header>
            <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto bg-black/20 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`py-0.5 border-l border-dark-800 pl-3 ml-1 ${log.includes('[LỖI]') ? 'text-red-400' : log.includes('[HỆ THỐNG]') ? 'text-primary-400' : 'text-dark-400'}`}>
                  <span className="text-dark-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
              {logs.length === 0 && <div className="h-full flex items-center justify-center text-dark-600 italic text-[10px]">Đang đợi dữ liệu từ k6...</div>}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showStopConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-dark-900 border border-dark-800 rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><HelpCircle className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-dark-50 mb-2">Dừng Kiểm thử?</h3>
              <p className="text-sm text-dark-400 mb-8">Bạn có chắc muốn dừng k6 ngay lập tức?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowStopConfirm(false)} className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-xl font-bold">Tiếp tục</button>
                <button onClick={stopTest} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold">Dừng ngay</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadTest;
