import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Clock, Users, Globe, Zap, BarChart3, AlertCircle, Terminal, X, HelpCircle, ChevronRight, Info, Plus, Trash2, ArrowDown, GripVertical, Key } from 'lucide-react';
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
  
  // Chế độ: single (1 API) hoặc scenario (Luồng)
  const [testMode, setTestMode] = useState('single');
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioSteps, setScenarioSteps] = useState([]);
  
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

    socketRef.current.on('k6:progress', (data) => {
      if (data.testId === currentTestIdRef.current) {
        setLogs(prev => [...prev, data.output].slice(-200));
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

  const addStep = () => {
    setScenarioSteps([...scenarioSteps, { id: Date.now(), requestId: '', isLogin: false, tokenPath: 'data.token' }]);
  };

  const removeStep = (id) => {
    setScenarioSteps(scenarioSteps.filter(s => s.id !== id));
  };

  const updateStep = (id, field, value) => {
    setScenarioSteps(scenarioSteps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const startTest = async () => {
    let payload = {
      vus: parseInt(targetVus),
      duration: duration.includes('s') ? duration : `${duration}s`,
    };

    if (testMode === 'single') {
      if (!activeRequest?.id) {
        showNotify('Vui lòng chọn một Request trước!', 'warning');
        return;
      }
      payload = {
        ...payload,
        requestId: activeRequest.id,
        name: activeRequest.name,
        method: activeRequest.method,
        url: getResolvedUrl(activeRequest),
        headers: activeRequest.headers,
        body: activeRequest.body
      };
    } else {
      if (scenarioSteps.length === 0) {
        showNotify('Vui lòng thêm ít nhất một bước vào kịch bản!', 'warning');
        return;
      }
      
      const requests = scenarioSteps.map(step => {
        let reqData = null;
        for (const col of collections) {
          const found = col.requests?.find(r => r.id == step.requestId);
          if (found) { reqData = found; break; }
        }
        if (!reqData) return null;
        return {
          ...reqData,
          url: getResolvedUrl(reqData),
          isLogin: step.isLogin,
          tokenPath: step.tokenPath
        };
      }).filter(r => r !== null);

      if (requests.length === 0) {
        showNotify('Vui lòng chọn API cho các bước!', 'warning');
        return;
      }
      payload.requests = requests;
      payload.scenarioName = scenarioName || 'Kịch bản không tên';
    }

    setIsRunning(true);
    setLogs([`[HỆ THỐNG] Đang chuẩn bị chạy chế độ: ${testMode === 'single' ? 'Đơn lẻ' : 'Kịch bản luồng'}...`]);
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
        body: JSON.stringify(payload)
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

  const getResolvedUrl = (req) => {
    if (!req?.url) return 'Chưa có URL';
    let url = req.url;
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
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary-400 font-sans">Kiểm thử Hiệu năng</h2>
            <p className="text-xs text-dark-500 font-sans">Giả lập tải lớn bằng engine k6 chuyên nghiệp.</p>
          </div>
          
          <div className="flex bg-dark-900 p-1 rounded-xl border border-dark-800 ml-4">
            <button 
              onClick={() => setTestMode('single')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${testMode === 'single' ? 'bg-primary-500 text-dark-950 shadow-lg shadow-primary-500/20' : 'text-dark-500 hover:text-dark-300'}`}
            >
              API Đơn lẻ
            </button>
            <button 
              onClick={() => setTestMode('scenario')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${testMode === 'scenario' ? 'bg-primary-500 text-dark-950 shadow-lg shadow-primary-500/20' : 'text-dark-500 hover:text-dark-300'}`}
            >
              Kịch bản luồng
            </button>
          </div>
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
            <><Play className="w-4 h-4 fill-current" /> Bắt đầu {testMode === 'single' ? 'Kiểm thử' : 'Chạy Luồng'}</>
          )}
        </button>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Cấu hình bên trái */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          
          {/* Cài đặt CCU & Time */}
          <section className="bg-dark-900/50 p-6 rounded-2xl border border-dark-800/50 space-y-6">
            <div className="flex items-center justify-between border-b border-dark-800 pb-4">
              <div className="flex items-center gap-2 text-primary-400">
                <Users className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Cấu hình Tải</h3>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-dark-500 uppercase">VUs:</span>
                    <input type="number" value={targetVus} onChange={(e) => setTargetVus(e.target.value)} disabled={isRunning} className="w-16 bg-dark-950 border border-dark-800 rounded-lg px-2 py-1 text-xs text-primary-400 outline-none focus:border-primary-500" />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-dark-500 uppercase">Time:</span>
                    <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} disabled={isRunning} className="w-16 bg-dark-950 border border-dark-800 rounded-lg px-2 py-1 text-xs text-primary-400 outline-none focus:border-primary-500" />
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-1">Môi trường thực thi</label>
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
            </div>
          </section>

          {/* Builder area */}
          <section className="bg-dark-900/50 p-6 rounded-2xl border border-dark-800/50 flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-dark-800 pb-4">
              <div className="flex items-center gap-2 text-primary-400">
                {testMode === 'single' ? <Zap className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {testMode === 'single' ? 'Chọn API để test' : 'Xây dựng kịch bản luồng'}
                </h3>
              </div>
              {testMode === 'scenario' && (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Tên kịch bản..." 
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-1 text-[10px] text-primary-400 outline-none focus:border-primary-500 w-40"
                  />
                  <button 
                    onClick={addStep}
                    className="p-1.5 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
              {testMode === 'single' ? (
                <div className="relative">
                  <select 
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 outline-none focus:border-primary-500 appearance-none cursor-pointer"
                    value={activeRequest?.id || ''}
                    onChange={(e) => {
                      for (const col of collections) {
                        const req = col.requests?.find(r => r.id == e.target.value);
                        if (req) { setActiveRequest(req); break; }
                      }
                    }}
                  >
                    <option value="">-- Chọn API từ bộ sưu tập --</option>
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
              ) : (
                <div className="space-y-3">
                  {scenarioSteps.map((step, index) => (
                    <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-dark-950 border border-dark-800 rounded-2xl p-4 relative group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-2 text-dark-600 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold">#{index + 1}</span>
                          <GripVertical className="w-4 h-4 opacity-30" />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="relative">
                            <select 
                              className="w-full bg-dark-900 border border-dark-800 rounded-xl px-3 py-2 text-xs text-dark-100 outline-none focus:border-primary-500 appearance-none cursor-pointer"
                              value={step.requestId}
                              onChange={(e) => updateStep(step.id, 'requestId', e.target.value)}
                            >
                              <option value="">-- Chọn API --</option>
                              {collections.map(col => (
                                <optgroup key={col.id} label={col.name}>
                                  {col.requests?.map(req => (
                                    <option key={req.id} value={req.id}>{req.method} - {req.name}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-600 pointer-events-none" />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group/login">
                              <input 
                                type="checkbox" 
                                checked={step.isLogin} 
                                onChange={(e) => updateStep(step.id, 'isLogin', e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                              />
                              <span className="text-[10px] font-bold text-dark-500 group-hover/login:text-primary-400 transition-all uppercase flex items-center gap-1">
                                <Key className="w-3 h-3" /> Là API Login
                              </span>
                            </label>

                            {step.isLogin && (
                              <div className="flex items-center gap-2 bg-dark-900 px-2 py-1 rounded-lg border border-dark-800">
                                <span className="text-[9px] font-bold text-dark-600">TOKEN PATH:</span>
                                <input 
                                  type="text" 
                                  value={step.tokenPath} 
                                  onChange={(e) => updateStep(step.id, 'tokenPath', e.target.value)}
                                  className="bg-transparent border-none outline-none text-[10px] text-primary-400 w-24"
                                  placeholder="data.token"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => removeStep(step.id)}
                          className="text-dark-700 hover:text-red-500 transition-all p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {scenarioSteps.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-dark-800 rounded-3xl flex flex-col items-center justify-center text-dark-600">
                       <Plus className="w-8 h-8 mb-2 opacity-20" />
                       <p className="text-xs italic">Bấm "+" để thêm bước vào luồng kịch bản</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Biểu đồ & Log bên phải */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 overflow-hidden">
          <section className="bg-dark-900/50 p-6 rounded-2xl border border-dark-800 flex flex-col min-h-[300px]">
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
