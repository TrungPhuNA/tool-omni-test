import React, { useState } from 'react';
import { Play, Plus, Trash2, ArrowDown, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ScenarioRunner = ({ scenario, collections, activeEnvironment, token, showToast }) => {
  const [steps, setSteps] = useState(scenario.steps || []);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
      const res = await axios.post(`${API_URL}/scenarios/${scenario.id}/run`, {
        variables: activeEnvironment?.variables || {}
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setResults(res.data.data);
      showToast('Kịch bản đã chạy xong!', 'success');
    } catch (err) {
      showToast('Chạy kịch bản thất bại!', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-950 p-6 space-y-6 overflow-hidden">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-400">{scenario.name}</h2>
          <p className="text-xs text-dark-500">Chạy chuỗi {steps.length} API tuần tự với truyền biến động.</p>
        </div>
        <button 
          onClick={handleRun}
          disabled={isRunning}
          className="btn-primary px-8 py-2.5 flex items-center gap-2 shadow-lg shadow-primary-900/20"
        >
          {isRunning ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Chạy Kịch Bản</span>
            </>
          )}
        </button>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Steps List */}
        <div className="flex-1 glass-card p-4 overflow-y-auto custom-scrollbar">
          <h3 className="label mb-4">Các bước thực thi (Steps)</h3>
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const collection = collections.find(c => c.id === scenario.collection_id);
              const request = collection?.requests?.find(r => r.id === step.requestId);
              const result = results?.results?.find(r => r.step.requestId === step.requestId);

              return (
                <div key={idx} className="relative">
                  <div className={`p-4 rounded-xl border transition-all ${result ? (result.response.statusCode < 400 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20') : 'bg-dark-800/30 border-dark-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-[10px] font-bold text-dark-400">
                          {idx + 1}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          request?.method === 'GET' ? 'bg-green-500/10 text-green-500' : 
                          request?.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>{request?.method}</span>
                        <span className="text-sm font-semibold">{request?.name || 'Unknown Request'}</span>
                      </div>
                      {result && (
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${result.response.statusCode < 400 ? 'text-green-500' : 'text-red-500'}`}>
                            {result.response.statusCode}
                          </span>
                          {result.response.statusCode < 400 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-[10px] text-dark-500 truncate mb-2">
                      {request?.url}
                    </div>

                    {step.extractors?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dark-800/50">
                        <span className="text-[9px] uppercase font-bold text-dark-600 block mb-2">Biến trích xuất</span>
                        <div className="flex flex-wrap gap-2">
                          {step.extractors.map((ext, eidx) => (
                            <div key={eidx} className="px-2 py-1 bg-primary-500/10 border border-primary-500/20 rounded text-[10px] text-primary-400">
                              {ext.key} <span className="text-dark-600 mx-1">←</span> {ext.path}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowDown className="w-4 h-4 text-dark-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Console / Output */}
        <div className="w-[400px] glass-card flex flex-col">
          <div className="p-4 border-b border-dark-800 flex items-center justify-between">
            <span className="label">Kết quả chi tiết</span>
            {results && (
              <div className="flex items-center gap-2 text-[10px] text-dark-500">
                <Clock className="w-3 h-3" />
                <span>{results.results.reduce((acc, r) => acc + r.response.responseTime, 0)} ms</span>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px] custom-scrollbar">
            {results ? (
              results.results.map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-dark-500 border-b border-dark-800 pb-1 mb-1">Step {i+1}: {r.name}</div>
                  <pre className="text-dark-300 whitespace-pre-wrap">{JSON.stringify(r.response.body, null, 2)}</pre>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-dark-600 italic opacity-50">
                Chưa có dữ liệu. Nhấn "Chạy" để xem kết quả.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioRunner;
