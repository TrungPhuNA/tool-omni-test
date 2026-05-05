import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, Activity, Clock, Users, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';

const LoadTest = () => {
  const { collections, token } = useStore();
  const [selectedReq, setSelectedReq] = useState(null);
  const [config, setConfig] = useState({ vus: 10, duration: '30s' });
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [testId, setTestId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    socketRef.current = io(API_URL);

    socketRef.current.on('k6:progress', (data) => {
      // Parse data.output to get VUs and other info if possible
      // For now just add a data point to chart
      setMetrics(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        vus: parseInt(data.output.match(/vus=(\d+)/)?.[1] || 0) 
      }].slice(-20));
    });

    socketRef.current.on('k6:done', () => {
      setIsRunning(false);
      setTestId(null);
    });

    return () => socketRef.current.disconnect();
  }, []);

  const handleStart = async () => {
    if (!selectedReq) return;
    setIsRunning(true);
    setMetrics([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
    try {
      const res = await fetch(`${API_URL}/loadtest/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...selectedReq,
          vus: config.vus,
          duration: config.duration
        })
      });
      const data = await res.json();
      setTestId(data.data.testId);
    } catch (error) {
      console.error('Failed to start load test', error);
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    if (!testId) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
    await fetch(`${API_URL}/loadtest/stop`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ testId })
    });
    setIsRunning(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-950 p-6 space-y-6 overflow-hidden">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-400 font-sans">Load Testing</h2>
          <p className="text-xs text-dark-500 font-sans">Kiểm tra khả năng chịu tải của API với k6 engine.</p>
        </div>
        <button 
          onClick={isRunning ? handleStop : handleStart}
          className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isRunning ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/20' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-900/20 cursor-pointer'}`}
        >
          {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Stop Test' : 'Run Performance Test'}</span>
        </button>
      </header>

      <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Config Panel */}
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-dark-200 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-500" />
              Test Configuration
            </h3>
            
            <div className="space-y-3">
              <label className="label">Chọn Request</label>
              <select 
                className="input-field cursor-pointer"
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
                <label className="label flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Concurrent Users (VUs)
                </label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={config.vus}
                  onChange={(e) => setConfig({...config, vus: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="label flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Duration
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="30s, 1m..."
                  value={config.duration}
                  onChange={(e) => setConfig({...config, duration: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-dark-200 flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-500" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-dark-800/50 rounded-xl border border-dark-700">
                <p className="text-[10px] uppercase font-bold text-dark-500">Target URL</p>
                <p className="text-xs font-mono text-dark-200 truncate mt-1">{selectedReq?.url || 'N/A'}</p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-xl border border-dark-700">
                <p className="text-[10px] uppercase font-bold text-dark-500">Method</p>
                <p className="text-xs font-bold text-primary-400 mt-1">{selectedReq?.method || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="col-span-2 flex flex-col space-y-6">
          <div className="glass-card flex-1 p-6 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-dark-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                Real-time Performance Metrics
              </h3>
              {isRunning && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold uppercase animate-pulse">
                  Running
                </div>
              )}
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
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
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#0ea5e9' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vus" 
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    dot={false}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {!isRunning && metrics.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/40 backdrop-blur-[1px] text-dark-500 gap-3">
                 <Activity className="w-12 h-12 opacity-20" />
                 <p className="text-sm font-medium">No active test session. Click "Run" to start monitoring.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadTest;
