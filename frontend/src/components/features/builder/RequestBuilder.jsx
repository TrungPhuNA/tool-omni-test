import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Trash2, ShieldCheck } from 'lucide-react';
import useStore from '../../../store/useStore';

const BodyEditor = ({ body, onChange }) => {
  const [height, setHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const startResizing = (e) => {
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = height;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const delta = e.clientY - startY.current;
      const newHeight = startHeight.current + delta;
      if (newHeight > 100 && newHeight < 800) {
        setHeight(newHeight);
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
    <div id="body-editor-container" className="flex flex-col relative">
      <div className="flex items-center gap-4 mb-3">
         <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">JSON Body</span>
         <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 text-[10px] font-bold uppercase">JSON</span>
         </div>
      </div>
      <textarea 
        className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-mono transition-all resize-none text-dark-200 custom-scrollbar"
        style={{ height: `${height}px` }}
        placeholder='{ "key": "value" }'
        value={body}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>
      
      <div 
        className={`group h-2 cursor-row-resize flex items-center justify-center relative z-10 mt-2`}
        onMouseDown={startResizing}
      >
        <div className={`w-12 h-1 rounded-full transition-all ${isResizing ? 'bg-primary-500 w-24' : 'bg-dark-700 group-hover:bg-primary-500/50 group-hover:w-16'}`} />
        <div className="absolute inset-x-0 -top-2 -bottom-2 cursor-row-resize" />
      </div>
    </div>
  );
};

const RequestBuilder = ({ handleSend }) => {
  const { 
    activeRequest, 
    setActiveRequest, 
    isLoading,
    addHeader,
    updateHeader,
    removeHeader,
    addParam,
    updateParam,
    removeParam
  } = useStore();

  const [activeTab, setActiveTab] = useState('params');

  return (
    <div className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
      {/* Request Input Area */}
      <div className="flex gap-2 p-1 bg-dark-900 border border-dark-800 rounded-xl shadow-lg">
        <select 
          className="bg-dark-800 text-sm font-bold px-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-primary-500 transition-all min-w-[100px] text-dark-100"
          value={activeRequest.method}
          onChange={(e) => setActiveRequest({ method: e.target.value })}
        >
          <option value="GET" className="text-green-500">GET</option>
          <option value="POST" className="text-blue-500">POST</option>
          <option value="PUT" className="text-yellow-500">PUT</option>
          <option value="PATCH" className="text-orange-500">PATCH</option>
          <option value="DELETE" className="text-red-500">DELETE</option>
        </select>
        <input 
          type="text" 
          className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm font-medium tracking-wide placeholder:text-dark-600 text-dark-200"
          placeholder="Enter API URL or {{BASE_URL}}/path"
          value={activeRequest.url}
          onChange={(e) => setActiveRequest({ url: e.target.value })}
        />
        <button 
          className="btn-primary flex items-center gap-2 px-6 shadow-lg shadow-primary-900/20"
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>

      {/* Request Tabs */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden">
         <div className="flex border-b border-dark-800 p-1 gap-1">
            {['params', 'headers', 'body', 'auth', 'assertions'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-dark-800 text-primary-400' 
                    : 'text-dark-500 hover:text-dark-200 hover:bg-dark-800/50'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
         </div>
         
         <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            {activeTab === 'params' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Query Parameters</span>
                   <button onClick={addParam} className="text-primary-500 hover:text-primary-400 text-xs font-medium flex items-center gap-1 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Param
                   </button>
                </div>
                {activeRequest.params.map((p, index) => (
                  <div key={index} className="flex gap-2 animate-fade-in">
                    <input 
                      type="checkbox" 
                      checked={p.enabled} 
                      onChange={(e) => updateParam(index, 'enabled', e.target.checked)}
                      className="accent-primary-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Key" 
                      className="input-field" 
                      value={p.key}
                      onChange={(e) => updateParam(index, 'key', e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Value" 
                      className="input-field" 
                      value={p.value}
                      onChange={(e) => updateParam(index, 'value', e.target.value)}
                    />
                    <button onClick={() => removeParam(index)} className="p-2 text-dark-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {activeRequest.params.length === 0 && (
                  <div className="text-center py-8 text-dark-600 text-sm">No parameters added.</div>
                )}
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">HTTP Headers</span>
                   <button onClick={addHeader} className="text-primary-500 hover:text-primary-400 text-xs font-medium flex items-center gap-1 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Header
                   </button>
                </div>
                {activeRequest.headers.map((h, index) => (
                  <div key={index} className="flex gap-2 animate-fade-in">
                    <input 
                      type="checkbox" 
                      checked={h.enabled}
                      onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                      className="accent-primary-500" 
                    />
                    <input 
                      type="text" 
                      placeholder="Key" 
                      className="input-field" 
                      value={h.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Value" 
                      className="input-field" 
                      value={h.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    />
                    <button onClick={() => removeHeader(index)} className="p-2 text-dark-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'body' && <BodyEditor body={activeRequest.body} onChange={(val) => setActiveRequest({ body: val })} />}

            {activeTab === 'auth' && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-xl flex items-start gap-4">
                   <div className="p-2 bg-primary-500/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-primary-500" />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-primary-400">Auth Automator</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">{activeRequest.authConfig?.enabled ? 'Enabled' : 'Disabled'}</span>
                          <button 
                            onClick={() => setActiveRequest({ 
                              authConfig: { 
                                ...(activeRequest.authConfig || {}), 
                                enabled: !activeRequest.authConfig?.enabled 
                              } 
                            })}
                            className={`w-10 h-5 rounded-full relative transition-all ${activeRequest.authConfig?.enabled ? 'bg-primary-600' : 'bg-dark-800'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${activeRequest.authConfig?.enabled ? 'left-6' : 'left-1'}`}></div>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-dark-500 leading-relaxed">Tự động gọi API đăng nhập, trích xuất Token và đính kèm vào Header cho request này.</p>
                   </div>
                </div>

                <div className={`space-y-5 transition-all duration-300 ${activeRequest.authConfig?.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Login URL</label>
                      <input 
                        className="input-field" 
                        placeholder="VD: {{BASE_URL}}/auth/login"
                        value={activeRequest.authConfig?.loginUrl || ''}
                        onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, loginUrl: e.target.value }})}
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Token Path (JSONPath)</label>
                        <input 
                          className="input-field" 
                          placeholder="data.access_token"
                          value={activeRequest.authConfig?.tokenPath || ''}
                          onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, tokenPath: e.target.value }})}
                        />
                        <p className="text-[10px] text-dark-600 italic">Dùng lodash.get style để lấy token từ response login.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Auth Type</label>
                        <select className="input-field">
                          <option>Bearer Token</option>
                          <option>Basic Auth (Coming soon)</option>
                        </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Login Body (JSON)</label>
                      <textarea 
                        className="input-field h-24 font-mono text-xs resize-none" 
                        placeholder='{ "username": "admin", "password": "{{PASSWORD}}" }'
                        value={activeRequest.authConfig?.loginBody || ''}
                        onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, loginBody: e.target.value }})}
                      ></textarea>
                   </div>
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default RequestBuilder;
