import React, { useState, useEffect, useRef } from 'react';
import { Clock, Cpu, Copy, Save } from 'lucide-react';
import useStore from '../../../store/useStore';
import SaveSnapshotModal from '../../common/SaveSnapshotModal';

const ResponsePanel = ({ response, isLoading }) => {
  const { activeRequest, saveExample } = useStore();
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

  return (
    <section className="flex-1 border-l border-dark-800 bg-dark-900/30 backdrop-blur-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b border-dark-800 flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Response</span>
        {response && (
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${response.statusCode < 400 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
                <span className="font-bold text-dark-200">{response.statusCode} {response.statusText}</span>
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
                SAVE LOG
              </button>
            )}
          </div>
        )}
      </div>

      <div id="response-content-container" className="flex-1 overflow-hidden flex flex-col p-4">
        {!response ? (
          <div className="flex-1 flex flex-col items-center justify-center text-dark-600 gap-4 opacity-50">
            <div className="p-6 bg-dark-800 rounded-full">
              <Cpu className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium">Click "Send" to execute request</p>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-0 overflow-hidden">
            <div 
                className="flex-shrink-0 flex flex-col glass-card p-4 overflow-hidden animate-fade-in mb-0"
                style={{ height: `${bodyHeight}px` }}
            >
              <div className="flex items-center justify-between mb-3">
                 <span className="text-xs font-semibold text-dark-400">Body</span>
                 <button className="p-1 hover:bg-dark-800 rounded text-dark-500 transition-colors">
                    <Copy className="w-4 h-4" />
                 </button>
              </div>
              <pre className="flex-1 overflow-auto text-[13px] font-mono leading-relaxed text-dark-200 custom-scrollbar">
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </div>
            
            <div 
                className={`group h-2 cursor-row-resize flex items-center justify-center flex-shrink-0 relative z-10 my-1`}
                onMouseDown={startResizing}
            >
                <div className={`w-12 h-1 rounded-full transition-all ${isResizing ? 'bg-primary-500 w-24' : 'bg-dark-700 group-hover:bg-primary-500/50 group-hover:w-16'}`} />
                <div className="absolute inset-x-0 -top-2 -bottom-2 cursor-row-resize" />
            </div>

            <div className="flex-1 glass-card p-4 overflow-hidden animate-fade-in min-h-0">
              <span className="text-xs font-semibold text-dark-400 block mb-3">Headers</span>
              <div className="space-y-1.5 overflow-y-auto h-[calc(100%-24px)] text-[11px] font-mono custom-scrollbar">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex border-b border-dark-800/50 pb-1 last:border-0">
                    <span className="text-primary-400 w-24 shrink-0">{k}:</span>
                    <span className="text-dark-400 truncate">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResponsePanel;
