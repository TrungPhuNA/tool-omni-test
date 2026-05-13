import React, { useState, useEffect, useRef } from 'react';
import { Clock, Cpu, Copy, Save } from 'lucide-react';
import Select from 'react-select';
import useStore from '../../../store/useStore';
import SaveSnapshotModal from '../../common/SaveSnapshotModal';

const customSelectStyles = {
  control: (base) => ({
    ...base,
    background: 'rgba(15, 23, 42, 0.5)', // bg-dark-950/50
    borderColor: 'rgba(30, 41, 59, 1)',   // border-dark-800
    minHeight: '32px',
    height: '32px',
    borderRadius: '0.75rem',             // rounded-xl
    boxShadow: 'none',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'rgba(56, 189, 248, 0.5)', 
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 12px',
    height: '32px',
  }),
  singleValue: (base, state) => {
    const activeTab = state.getValue()[0]?.value;
    let color = 'rgba(226, 232, 240, 1)';
    if (activeTab === 'body') color = '#38bdf8'; // text-primary-400
    else if (activeTab === 'headers') color = '#60a5fa'; // text-blue-400
    else if (activeTab === 'console') color = '#eab308'; // text-yellow-500
    
    return {
      ...base,
      color,
      margin: 0,
    };
  },
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: 'white',
  }),
  menu: (base) => ({
    ...base,
    background: '#0f172a',                // bg-dark-900
    border: '1px solid rgba(30, 41, 59, 1)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    zIndex: 100,
  }),
  option: (base, { isFocused, isSelected, data }) => {
    let color = '#94a3b8';
    if (isSelected) {
      if (data.value === 'body') color = '#38bdf8';
      else if (data.value === 'headers') color = '#60a5fa';
      else if (data.value === 'console') color = '#eab308';
    }

    return {
      ...base,
      background: isSelected ? 'rgba(56, 189, 248, 0.1)' : isFocused ? 'rgba(30, 41, 59, 0.5)' : 'transparent',
      color,
      fontSize: '10px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      padding: '8px 12px',
      cursor: 'pointer',
      '&:active': {
        background: 'rgba(56, 189, 248, 0.2)',
      }
    };
  },
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0 8px',
    color: '#64748b',
    '&:hover': { color: '#94a3b8' }
  })
};

const ResponsePanel = ({ response, isLoading }) => {
  const { activeRequest, saveExample, showToast } = useStore();
  const [bodyHeight, setBodyHeight] = useState(400); // Default body height
  const [isResizing, setIsResizing] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleSaveExample = async (name) => {
    if (!response || !activeRequest || !name) return;
    
    await saveExample({
      request_id: activeRequest.id,
      name,
      method: activeRequest.method,
      url: activeRequest.url,
      headers: activeRequest.headers,
      params: activeRequest.params,
      body: activeRequest.body,
      response_status: response.statusCode,
      response_body: response.body,
      response_headers: response.headers,
      response_time: response.responseTime
    });
    
    setIsSaveModalOpen(false);
  };

  const startResizing = (e) => {
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = bodyHeight;
    e.preventDefault();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Đã copy vào bộ nhớ tạm!', 'success');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const delta = e.clientY - startY.current;
      const newHeight = startHeight.current + delta;
      
      // Giới hạn chiều cao body
      if (newHeight > 150 && newHeight < 800) {
        setBodyHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing]);

  const [activeTab, setActiveTab] = useState('body');

  return (
    <section className="flex-1 border-l border-dark-800 bg-dark-900/30 backdrop-blur-sm flex flex-col overflow-hidden min-h-0">
      <div className="p-4 border-b border-dark-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[10px] uppercase font-black text-dark-500 tracking-[0.2em]">Response</span>
          {response && (
            <div className="relative flex items-center min-w-[120px]">
              <Select
                value={{ 
                  value: activeTab, 
                  label: activeTab === 'console' 
                    ? `Console ${response.scriptLogs?.length > 0 ? `(${response.scriptLogs.length})` : ''}`
                    : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                }}
                onChange={(option) => setActiveTab(option.value)}
                options={[
                  { value: 'body', label: 'Body' },
                  { value: 'headers', label: 'Headers' },
                  { 
                    value: 'console', 
                    label: `Console ${response.scriptLogs?.length > 0 ? `(${response.scriptLogs.length})` : ''}` 
                  },
                ]}
                styles={customSelectStyles}
                isSearchable={false}
              />
              {response.scriptLogs?.length > 0 && activeTab !== 'console' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-dark-900 animate-pulse shadow-lg shadow-red-500/50 z-10"></span>
              )}
            </div>
          )}
        </div>
        {response && (
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${response.statusCode < 400 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
                <span className="font-bold text-dark-200">{response.statusCode}</span>
              </div>
              <div className="flex items-center gap-1.5 text-dark-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{response.responseTime} ms</span>
              </div>
            </div>
            {activeRequest?.id && (
              <button 
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-primary-600/10 hover:bg-primary-600 text-primary-400 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-primary-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                SAVE
              </button>
            )}
          </div>
        )}
      </div>

      <div id="response-content-container" className="flex-1 flex flex-col p-4 bg-dark-950/20 min-h-0 overflow-hidden">
        {!response ? (
          <div className="flex-1 flex flex-col items-center justify-center text-dark-600 gap-4 opacity-50">
            <div className="p-6 bg-dark-800 rounded-full animate-pulse">
              <Cpu className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium tracking-wide uppercase opacity-50">Click "Send" to execute request</p>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {activeTab === 'body' && (
              <div className="flex-1 flex flex-col glass-card p-5 animate-fade-in border border-dark-800/50 bg-dark-900/20 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-primary-500 rounded-full"></div>
                     <span className="text-[10px] uppercase font-black text-dark-400 tracking-widest">Response Body</span>
                   </div>
                   <button 
                    onClick={() => handleCopy(JSON.stringify(response.body, null, 2))}
                    className="p-2 hover:bg-dark-800 rounded-xl text-dark-500 transition-all hover:text-primary-400"
                   >
                      <Copy className="w-4 h-4" />
                   </button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar min-h-0">
                  <pre className="text-[13px] font-mono leading-relaxed text-primary-50/90 selection:bg-primary-500/30 whitespace-pre-wrap break-all">
                    {JSON.stringify(response.body, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="flex-1 flex flex-col glass-card p-5 overflow-hidden animate-fade-in border border-dark-800/50 bg-dark-900/20 min-h-0">
                <div className="flex items-center gap-2 mb-6 flex-shrink-0">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] uppercase font-black text-dark-400 tracking-widest">Response Headers</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="flex border-b border-dark-800/30 pb-2 last:border-0 group">
                      <span className="text-primary-500/80 w-40 shrink-0 text-[11px] font-black uppercase tracking-wider">{k}</span>
                      <span className="text-dark-300 text-[12px] font-mono break-all group-hover:text-dark-100 transition-colors">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'console' && (
              <div className="flex-1 flex flex-col glass-card p-5 overflow-hidden animate-fade-in border border-dark-800/50 bg-dark-900/20 min-h-0">
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-[10px] uppercase font-black text-dark-400 tracking-widest">Script Console</span>
                  </div>
                  <span className="text-[9px] text-dark-500 font-bold uppercase">{response.scriptLogs?.length || 0} logs</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {response.scriptLogs && response.scriptLogs.length > 0 ? (
                    response.scriptLogs.map((log, i) => (
                      <div key={i} className="font-mono text-[12px] p-3 rounded-xl bg-dark-950/50 border border-dark-800/50 text-yellow-500/90 leading-relaxed shadow-inner">
                        <span className="text-dark-600 mr-3 text-[10px] font-bold">[{i+1}]</span>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
                      <Cpu className="w-12 h-12 mb-3" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">No logs generated</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <SaveSnapshotModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveExample}
      />
    </section>
  );
};

export default ResponsePanel;
