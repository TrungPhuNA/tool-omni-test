import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, Activity, Clock, Users, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';

const LoadTest = () => {
  const { 
    collections, 
    token, 
    environments, 
    activeEnvironment, 
    setActiveEnvironment 
  } = useStore();
  
  const [selectedReq, setSelectedReq] = useState(null);
  const [config, setConfig] = useState({ vus: 10, duration: '30s' });
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [testId, setTestId] = useState(null);
  const [resolvedUrl, setResolvedUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const socketRef = useRef(null);
  const logEndRef = useRef(null);
  const progressInterval = useRef(null);

  // Auto scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Helper function to resolve variables and handle relative URLs
  const resolveVariables = (str, isUrl = false) => {
    if (!str || typeof str !== 'string') return str;
    
    let resolved = str;
    const vars = activeEnvironment?.variables || {};
    
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      resolved = resolved.replace(regex, value);
    });

    if (isUrl && !resolved.startsWith('http')) {
      const baseUrlVar = vars['url'] || vars['base_url'] || Object.values(vars).find(v => typeof v === 'string' && v.startsWith('http'));
      
      if (baseUrlVar) {
        const baseUrl = baseUrlVar.endsWith('/') ? baseUrlVar.slice(0, -1) : baseUrlVar;
        const path = resolved.startsWith('/') ? resolved : `/${resolved}`;
        resolved = `${baseUrl}${path}`;
      }
    }
    
    return resolved;
  };

  useEffect(() => {
    if (selectedReq) {
      setResolvedUrl(resolveVariables(selectedReq.url, true));
    } else {
      setResolvedUrl('');
    }
  }, [selectedReq, activeEnvironment]);

  useEffect(() => {
    const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    const socketUrl = rawUrl.replace(/\/api\/v1\/?$/, '');
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected to:', socketUrl);
    });

    socketRef.current.on('k6:progress', (data) => {
      setLogs(prev => [...prev, data.output]);

      const vusMatch = data.output.match(/(\d+)\/\d+ VUs/) || data.output.match(/(\d+)\s+looping VUs/);
      const currentVUs = vusMatch ? parseInt(vusMatch[1]) : 0;
      
      if (vusMatch) {
        setMetrics(prev => {
          const newPoint = { 
            time: new Date().toLocaleTimeString(), 
            vus: currentVUs 
          };
          return [...prev, newPoint].slice(-50);
        });
      }
    });

    socketRef.current.on('k6:error', (data) => {
      setLogs(prev => [...prev, `[ERROR] ${data.message}`]);
      clearInterval(progressInterval.current);
      setIsRunning(false);
    });

    socketRef.current.on('k6:done', () => {
      setLogs(prev => [...prev, '[SYSTEM] Test completed. Check History for full report.']);
      setProgress(100);
      clearInterval(progressInterval.current);
      setIsRunning(false);
      setTestId(null);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearInterval(progressInterval.current);
    };
  }, []);

  const handleStart = async () => {
    if (!selectedReq) return;
    setIsRunning(true);
    setMetrics([]);
    setLogs(['[SYSTEM] Initializing k6 engine with Stages & Thresholds...']);
    setProgress(0);

    const finalUrl = resolveVariables(selectedReq.url, true);
    const rawHeaders = typeof selectedReq.headers === 'string' ? JSON.parse(selectedReq.headers) : selectedReq.headers;
    const resolvedHeaders = Array.isArray(rawHeaders) ? rawHeaders.reduce((acc, h) => {
      if (h.enabled && h.key) {
        acc[h.key] = resolveVariables(h.value);
      }
      return acc;
    }, {}) : {};

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
    
    // Calculate total duration for progress bar
    const durSec = parseInt(config.duration) || 10;
    const totalDuration = durSec + 4; // Including ramp up/down
    let elapsed = 0;

    try {
      const res = await fetch(`${API_URL}/loadtest/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          method: selectedReq.method,
          url: finalUrl,
          headers: resolvedHeaders,
          body: resolveVariables(selectedReq.body),
          vus: parseInt(config.vus),
          duration: `${durSec}s`,
          requestId: selectedReq.id
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTestId(data.data.testId);
        
        // Start progress simulation
        progressInterval.current = setInterval(() => {
          elapsed += 0.5;
          const p = Math.min((elapsed / totalDuration) * 100, 99);
          setProgress(p);
        }, 500);

      } else {
        setIsRunning(false);
        setLogs(prev => [...prev, `[ERROR] ${data.message || 'Failed to start test'}`]);
      }
    } catch (error) {
      console.error('Failed to start load test', error);
      setIsRunning(false);
      setLogs(prev => [...prev, `[ERROR] ${error.message}`]);
    }
  };

  const handleStop = async () => {
    if (!testId) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
    try {
      await fetch(`${API_URL}/loadtest/stop`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ testId })
      });
      setIsRunning(false);
      clearInterval(progressInterval.current);
      setLogs(prev => [...prev, '[SYSTEM] Stop signal sent.']);
    } catch (error) {
      console.error('Failed to stop load test', error);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-dark-950 p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-50 font-sans">Load Testing</h2>
          <p className="text-sm text-dark-400 font-sans mt-1">Kiểm tra khả năng chịu tải của API với k6 engine.</p>
        </div>
        <button 
          onClick={isRunning ? handleStop : handleStart}
          className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isRunning ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/20 cursor-pointer'}`}
        >
          {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Stop Test' : 'Run Performance Test'}</span>
        </button>
      </header>

      <div className="grid grid-cols-12 gap-6 pb-12">
        {/* Config Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-dark-200 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-500" />
              Test Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-dark-500 font-bold mb-2">Môi trường (Environment)</label>
                <select 
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50 transition-colors cursor-pointer"
                  onChange={(e) => {
                    const env = environments.find(env => env.id == e.target.value);
                    setActiveEnvironment(env || null);
                  }}
                  value={activeEnvironment?.id || ''}
                >
                  <option value="">-- No Environment --</option>
                  {environments.map(env => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-dark-500 font-bold mb-2">Chọn Request</label>
                <select 
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50 transition-colors cursor-pointer"
                  onChange={(e) => {
                    const [colId, reqId] = e.target.value.split(':');
                    const col = collections.find(c => c.id == colId);
                    const req = col?.requests?.find(r => r.id == reqId);
                    setSelectedReq(req);
                  }}
                >
                  <option value="">-- Chọn một API --</option>
                  {collections.map(col => (
                    <optgroup key={col.id} label={col.name}>
                      {col.requests?.map(req => (
                        <option key={req.id} value={`${col.id}:${req.id}`}>{req.method} {req.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-dark-500 font-bold mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Target VUs
                  </label>
                  <input 
                    type="number" 
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50 transition-colors" 
                    value={config.vus}
                    onChange={(e) => setConfig({...config, vus: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-dark-500 font-bold mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Duration
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50 transition-colors" 
                    placeholder="30s, 1m..."
                    value={config.duration}
                    onChange={(e) => setConfig({...config, duration: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-dark-200 flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-500" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-dark-800/50 rounded-xl border border-dark-700">
                <p className="text-[10px] uppercase font-bold text-dark-500">Target URL (Resolved)</p>
                <p className="text-xs font-mono text-dark-200 truncate mt-1" title={resolvedUrl}>{resolvedUrl || 'N/A'}</p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-xl border border-dark-700">
                <p className="text-[10px] uppercase font-bold text-dark-500">Method</p>
                <p className="text-xs font-bold text-primary-400 mt-1">{selectedReq?.method || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Logs Panel */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-dark-900/50 border border-dark-800 rounded-3xl p-8 flex flex-col relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-dark-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                Real-time Performance Metrics
              </h3>
              {isRunning && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold uppercase animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Running
                </div>
              )}
            </div>
            
            {/* Progress Bar UI */}
            {isRunning && (
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-dark-400 uppercase tracking-widest">
                  <span>Overall Test Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div style={{ height: '350px', width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorVus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'VUs', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10 } }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#0ea5e9' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vus" 
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorVus)"
                    animationDuration={300}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {!isRunning && metrics.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/40 backdrop-blur-[1px] text-dark-500 gap-3">
                   <Activity className="w-12 h-12 opacity-20" />
                   <p className="text-sm font-medium">No active test session. Click "Run" to start monitoring.</p>
                </div>
              )}
            </div>
          </div>

          {/* Terminal Logs */}
          <div className="bg-black/80 border border-dark-800 rounded-2xl p-4 font-mono text-[11px] h-64 flex flex-col">
            <div className="flex items-center justify-between mb-2 text-dark-500 pb-2 border-b border-dark-800">
              <span className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                k6 Output Stream
              </span>
              <button onClick={() => setLogs([])} className="hover:text-dark-300 transition-colors">Clear</button>
            </div>
            <div className="flex-1 overflow-auto space-y-1 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`whitespace-pre-wrap ${log.includes('[ERROR]') ? 'text-red-400' : log.includes('[SYSTEM]') ? 'text-primary-400' : 'text-dark-300'}`}>
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadTest;
