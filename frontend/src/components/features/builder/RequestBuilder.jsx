import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Trash2, ShieldCheck, Save, Settings2, Check, Edit3, Info } from 'lucide-react';
import useStore from '../../../store/useStore';
import SaveSnapshotModal from '../../common/SaveSnapshotModal';

const BodyEditor = ({ body, onChange }) => {
    const [height, setHeight] = useState(300);
    const [isResizing, setIsResizing] = useState(false);
    const startY = useRef(0);
    const startHeight = useRef(0);
    const [lastJson, setLastJson] = useState(null);
    const [isSchemaView, setIsSchemaView] = useState(false);
    const preRef = useRef(null);

    // Đồng bộ scroll giữa textarea và lớp highlight phía dưới
    const handleScroll = (e) => {
        if (preRef.current) {
            preRef.current.scrollTop = e.target.scrollTop;
            preRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

    // Hàm highlight JSON bằng Regex để đổ màu giống Postman
    const highlightJson = (code) => {
        if (!code) return '';
        const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return code.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'text-emerald-400'; // Mặc định cho String value
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'text-sky-400 font-medium'; // Key
                } else {
                    cls = 'text-emerald-400'; // String value
                }
            } else if (/true|false/.test(match)) {
                cls = 'text-violet-400 font-bold'; // Boolean
            } else if (/null/.test(match)) {
                cls = 'text-rose-400 font-bold'; // Null
            } else {
                cls = 'text-orange-400'; // Number
            }
            return `<span class="${cls}">${escape(match)}</span>`;
        });
    };

    // Hàm Beautify: Định dạng lại nội dung JSON cho đẹp
    const handleBeautify = () => {
        try {
            const currentBody = typeof body === 'string' ? JSON.parse(body) : body;
            if (currentBody && typeof currentBody === 'object') {
                onChange(JSON.stringify(currentBody, null, 2));
            }
        } catch (e) {
            console.warn("Nội dung không phải JSON hợp lệ để Beautify");
        }
    };

    // Hàm Schema: Tự động tạo JSON Schema từ body hiện có
    const handleSchema = () => {
        try {
            const currentBodyStr = typeof body === 'string' ? body : JSON.stringify(body, null, 2);

            // Nếu đang hiện Schema và có dữ liệu cũ thì quay lại bản cũ
            if (isSchemaView && lastJson) {
                onChange(lastJson);
                setIsSchemaView(false);
                setLastJson(null);
                return;
            }

            const currentBody = JSON.parse(currentBodyStr);
            
            // Lưu lại bản gốc trước khi tạo schema
            setLastJson(currentBodyStr);

            const generateSchema = (obj) => {
                const type = typeof obj;
                if (Array.isArray(obj)) {
                    return { 
                        type: 'array', 
                        items: obj.length > 0 ? generateSchema(obj[0]) : {} 
                    };
                } else if (obj === null) {
                    return { type: 'null' };
                } else if (type === 'object') {
                    const properties = {};
                    for (const key in obj) {
                        properties[key] = generateSchema(obj[key]);
                    }
                    return { type: 'object', properties };
                } else {
                    return { type };
                }
            };

            const schema = generateSchema(currentBody);
            onChange(JSON.stringify(schema, null, 2));
            setIsSchemaView(true);
        } catch (e) {
            console.warn("Nội dung không phải JSON hợp lệ để tạo Schema");
        }
    };


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

    const displayValue = typeof body === 'object' ? JSON.stringify(body, null, 2) : (body || '');

    return (
        <div id="body-editor-container" className="flex flex-col relative">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">JSON Body</span>
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 text-[10px] font-bold uppercase">JSON</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSchema}
                        className={`flex items-center gap-1.5 text-[11px] font-bold transition-all group px-2 py-1 rounded ${isSchemaView ? 'bg-primary-500/10 text-primary-500' : 'text-dark-400 hover:text-dark-200'}`}
                    >
                        <Settings2 className={`w-3.5 h-3.5 ${isSchemaView ? 'text-primary-500' : 'text-dark-500 group-hover:text-dark-300'}`} />
                        Schema
                    </button>
                    <button 
                        onClick={handleBeautify}
                        className="text-[11px] font-bold text-primary-500 hover:text-primary-400 transition-colors"
                    >
                        Beautify
                    </button>
                </div>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden border border-dark-700 bg-dark-800/50 group focus-within:ring-2 focus-within:ring-primary-500/30 transition-all">
                {/* Lớp hiển thị màu sắc (Highlight Layer) */}
                <pre
                    ref={preRef}
                    className="absolute inset-0 w-full p-4 m-0 text-sm font-mono pointer-events-none whitespace-pre overflow-hidden break-words text-dark-300"
                    style={{ height: `${height}px` }}
                    dangerouslySetInnerHTML={{ __html: highlightJson(displayValue) + '\n' }}
                />
                
                {/* Lớp nhận input (Input Layer - Trong suốt) */}
                <textarea
                    className="relative w-full bg-transparent p-4 outline-none text-sm font-mono resize-none text-transparent caret-white custom-scrollbar z-10 whitespace-pre overflow-auto"
                    style={{ height: `${height}px` }}
                    placeholder='{ "key": "value" }'
                    value={displayValue}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    spellCheck="false"
                ></textarea>
            </div>

            <div
                className={`group h-2 cursor-row-resize flex items-center justify-center relative z-10 mt-2`}
                onMouseDown={startResizing}
            >
                <div className={`w-12 h-1 rounded-full transition-all ${isResizing ? 'bg-primary-500 w-24' : 'bg-dark-700 group-hover:bg-primary-500/50 group-hover:w-16'}`} />
            </div>
        </div>
    );
};

const DocsTab = ({ request, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const enabledParams = request.params?.filter(p => p.key && p.enabled) || [];
    const enabledHeaders = request.headers?.filter(h => h.key && h.enabled) || [];

    const renderMarkdown = (text) => {
        if (!text) return '';
        let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return html
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-dark-100 mt-6 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-dark-100 mt-8 mb-4 border-b border-dark-800 pb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-dark-100 mt-10 mb-6">$1</h1>')
            .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-dark-300 mb-1">$1</li>')
            .replace(/\*\*(.*)\*\*/gim, '<strong class="text-primary-400">$1</strong>')
            .replace(/\*(.*)\*/gim, '<em class="text-dark-500">$1</em>')
            .replace(/`([^`]+)`/gim, '<code class="bg-dark-800 px-1.5 py-0.5 rounded text-primary-300 font-mono text-xs">$1</code>')
            .replace(/\n/gim, '<div class="h-1"></div>');
    };

    const handleUpdateHeaderDesc = (index, desc) => {
        const newHeaders = [...request.headers];
        newHeaders[index].description = desc;
        onChange({ headers: newHeaders });
    };

    const handleUpdateHeaderRequired = (index, required) => {
        const newHeaders = [...request.headers];
        newHeaders[index].required = required;
        onChange({ headers: newHeaders });
    };

    const handleUpdateParamDesc = (index, desc) => {
        const newParams = [...request.params];
        newParams[index].description = desc;
        onChange({ params: newParams });
    };

    const handleUpdateParamRequired = (index, required) => {
        const newParams = [...request.params];
        newParams[index].required = required;
        onChange({ params: newParams });
    };
    
    return (
        <div className="flex flex-col h-full animate-fade-in pr-2">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
                        {request.name || 'API Documentation'}
                        {!isEditing && <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black tracking-widest uppercase border border-green-500/20">Published</span>}
                    </h2>
                    <p className="text-[10px] text-dark-500 font-medium uppercase tracking-wider italic">Trình chỉnh sửa tài liệu tích hợp toàn diện</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight px-4 py-2 rounded-xl transition-all shadow-lg ${
                            isEditing ? 'bg-green-600 text-white shadow-green-900/20' : 'bg-dark-800 text-dark-200 hover:bg-dark-700'
                        }`}
                    >
                        {isEditing ? (
                            <><Check className="w-3.5 h-3.5" /> Finish & Save All</>
                        ) : (
                            <><Edit3 className="w-3.5 h-3.5" /> Edit Documentation</>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 space-y-10 pb-10">
                {/* 1. Main Documentation (Markdown) */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                        Introduction & Usage
                    </h3>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-4 px-3 py-2 bg-dark-900/50 rounded-t-xl border-x border-t border-dark-700">
                                <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">Markdown Editor</span>
                                <div className="h-4 w-px bg-dark-800"></div>
                                <div className="flex gap-4">
                                    <button onClick={() => onChange({ documentation: (request.documentation || '') + '\n# ' })} className="text-[10px] text-dark-400 hover:text-primary-500 font-bold">H1</button>
                                    <button onClick={() => onChange({ documentation: (request.documentation || '') + '\n## ' })} className="text-[10px] text-dark-400 hover:text-primary-500 font-bold">H2</button>
                                    <button onClick={() => onChange({ documentation: (request.documentation || '') + '\n**text**' })} className="text-[10px] text-dark-400 hover:text-primary-500 font-bold underline">B</button>
                                    <button onClick={() => onChange({ documentation: (request.documentation || '') + '\n- ' })} className="text-[10px] text-dark-400 hover:text-primary-500 font-bold">List</button>
                                </div>
                            </div>
                            <textarea
                                className="w-full bg-dark-900/30 border border-dark-700 rounded-b-xl p-6 outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-sans leading-relaxed transition-all text-dark-200 min-h-[250px] custom-scrollbar shadow-inner"
                                placeholder="Viết hướng dẫn chi tiết tại đây..."
                                value={request.documentation || ''}
                                onChange={(e) => onChange({ documentation: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="relative bg-dark-900/40 p-8 rounded-2xl border border-dark-800/50 shadow-inner">
                            {request.documentation ? (
                                <div 
                                    className="prose prose-invert prose-sm max-w-none text-dark-300 leading-7"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(request.documentation) }}
                                />
                            ) : (
                                <p className="text-sm text-dark-500 italic text-center py-4">Chưa có nội dung giới thiệu.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-px bg-dark-800/30" />

                {/* 2. Endpoint Information */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                        Endpoint Detail
                    </h3>
                    <div className="flex items-center gap-4 p-5 bg-dark-950/50 border border-dark-800 rounded-2xl font-mono text-sm shadow-inner group">
                        <span className={`px-3 py-1 rounded-lg text-[11px] font-black tracking-widest ${
                            request.method === 'GET' ? 'bg-green-500/10 text-green-500' :
                            request.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>{request.method}</span>
                        <span className="text-dark-200 break-all">{request.url || 'No URL'}</span>
                    </div>
                </div>

                {/* 3. Headers Table */}
                {enabledHeaders.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                            Headers Documentation
                        </h3>
                        <div className="overflow-hidden border border-dark-800 rounded-2xl bg-dark-900/30">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-dark-800/50 text-dark-500 text-[9px] uppercase font-black tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3">Key</th>
                                        <th className="px-5 py-3">Value</th>
                                        <th className="px-5 py-3 text-center">Required</th>
                                        <th className="px-5 py-3">Description / Note</th>
                                    </tr>
                                </thead>
                                <tbody className="text-dark-200">
                                    {request.headers.map((h, i) => h.enabled && h.key && (
                                        <tr key={i} className="hover:bg-dark-800/40 transition-colors border-t border-dark-800/50">
                                            <td className="px-5 py-4 font-mono text-[11px] text-primary-400 font-bold">{h.key}</td>
                                            <td className="px-5 py-4 font-mono text-[11px] text-dark-400">{h.value}</td>
                                            <td className="px-5 py-4 text-center">
                                                {isEditing ? (
                                                    <input 
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-red-500 cursor-pointer"
                                                        checked={h.required}
                                                        onChange={(e) => handleUpdateHeaderRequired(i, e.target.checked)}
                                                    />
                                                ) : (
                                                    h.required ? 
                                                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-tighter border border-red-500/20">Required</span> : 
                                                        <span className="px-2 py-0.5 rounded bg-dark-800 text-dark-600 text-[9px] font-black uppercase tracking-tighter border border-dark-700">Optional</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {isEditing ? (
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-dark-100 outline-none focus:ring-1 focus:ring-primary-500/50"
                                                        placeholder="Giải thích header này..."
                                                        value={h.description || ''}
                                                        onChange={(e) => handleUpdateHeaderDesc(i, e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-dark-500 italic">{h.description || '-'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. Params Table */}
                {enabledParams.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                            Parameters Documentation
                        </h3>
                        <div className="overflow-hidden border border-dark-800 rounded-2xl bg-dark-900/30">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-dark-800/50 text-dark-500 text-[9px] uppercase font-black tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3">Parameter</th>
                                        <th className="px-5 py-3">Value</th>
                                        <th className="px-5 py-3 text-center">Required</th>
                                        <th className="px-5 py-3">Description / Note</th>
                                    </tr>
                                </thead>
                                <tbody className="text-dark-200">
                                    {request.params.map((p, i) => p.enabled && p.key && (
                                        <tr key={i} className="hover:bg-dark-800/40 transition-colors border-t border-dark-800/50">
                                            <td className="px-5 py-4 font-mono text-[11px] text-primary-400 font-bold">{p.key}</td>
                                            <td className="px-5 py-4 font-mono text-[11px] text-dark-400">{p.value}</td>
                                            <td className="px-5 py-4 text-center">
                                                {isEditing ? (
                                                    <input 
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-red-500 cursor-pointer"
                                                        checked={p.required}
                                                        onChange={(e) => handleUpdateParamRequired(i, e.target.checked)}
                                                    />
                                                ) : (
                                                    p.required ? 
                                                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-tighter border border-red-500/20">Required</span> : 
                                                        <span className="px-2 py-0.5 rounded bg-dark-800 text-dark-600 text-[9px] font-black uppercase tracking-tighter border border-dark-700">Optional</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {isEditing ? (
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-dark-100 outline-none focus:ring-1 focus:ring-primary-500/50"
                                                        placeholder="Giải thích tham số này..."
                                                        value={p.description || ''}
                                                        onChange={(e) => handleUpdateParamDesc(i, e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-dark-500 italic">{p.description || '-'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* 5. Request Body */}
                {request.body && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                            Request Body JSON
                        </h3>
                        <div className="relative group">
                            {isEditing ? (
                                <textarea
                                    className="w-full bg-dark-950/50 border border-dark-800 rounded-2xl p-6 font-mono text-[12px] text-emerald-400 outline-none focus:ring-2 focus:ring-primary-500/30 min-h-[200px] custom-scrollbar shadow-inner"
                                    value={typeof request.body === 'string' ? request.body : JSON.stringify(request.body, null, 2)}
                                    onChange={(e) => onChange({ body: e.target.value })}
                                />
                            ) : (
                                <pre className="p-6 bg-dark-950/50 border border-dark-800 rounded-2xl font-mono text-[12px] text-emerald-400 overflow-auto shadow-inner custom-scrollbar max-h-[400px]">
                                    {typeof request.body === 'string' ? request.body : JSON.stringify(request.body, null, 2)}
                                </pre>
                            )}
                            <div className="absolute top-4 right-4 text-[9px] text-dark-600 font-bold uppercase tracking-widest bg-dark-900 px-2 py-0.5 rounded border border-dark-800">JSON</div>
                        </div>
                    </div>
                )}
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
        removeParam,
        examples,
        fetchExamples,
        updateExample,
        deleteExample,
        setResponse,
        loadExample
    } = useStore();

    const [activeTab, setActiveTab] = useState('params');
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [editingExample, setEditingExample] = useState(null);
    const [bulkMode, setBulkMode] = useState({ params: false, headers: false });
    const [bulkText, setBulkText] = useState({ params: '', headers: '' });

    useEffect(() => {
        if (activeRequest?.id && activeTab === 'examples') {
            fetchExamples(activeRequest.id);
        }
    }, [activeRequest?.id, activeTab]);

    const handleOpenRename = (ex) => {
        setEditingExample(ex);
        setIsRenameModalOpen(true);
    };

    const handleUpdateName = async (newName) => {
        if (editingExample && newName) {
            await updateExample(editingExample.id, { name: newName });
            setIsRenameModalOpen(false);
            setEditingExample(null);
        }
    };

    const toggleBulkMode = (type) => {
        const isNowBulk = !bulkMode[type];
        if (isNowBulk) {
            const data = type === 'params' ? activeRequest.params : activeRequest.headers;
            const text = data
                .filter(item => item.key || item.value)
                .map(item => `${item.key}:${item.value}`)
                .join('\n');
            setBulkText(prev => ({ ...prev, [type]: text }));
        } else {
            if (type === 'params') {
                useStore.getState().bulkUpdateParams(bulkText.params);
            } else {
                useStore.getState().bulkUpdateHeaders(bulkText.headers);
            }
        }
        setBulkMode(prev => ({ ...prev, [type]: isNowBulk }));
    };

    const handleRowChange = (type, index, field, value) => {
        const data = type === 'params' ? activeRequest.params : activeRequest.headers;
        const updateFn = type === 'params' ? updateParam : updateHeader;
        const addFn = type === 'params' ? addParam : addHeader;

        updateFn(index, field, value);

        // If typing in the last row and it's not empty, add a new row
        if (index === data.length - 1 && value && (field === 'key' || field === 'value')) {
            addFn();
        }
    };

    return (
        <div className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
            {/* Request Input Area */}
            <div className="flex gap-0 p-1 bg-dark-900 border border-dark-800 rounded-xl shadow-lg items-stretch">
                <select
                    className="bg-dark-800 text-sm font-bold px-4 py-2.5 rounded-l-lg outline-none border-r border-dark-700 focus:border-primary-500 transition-all min-w-[100px] text-dark-100 cursor-pointer"
                    value={activeRequest.method}
                    onChange={(e) => setActiveRequest({ method: e.target.value })}
                >
                    <option value="GET" className="text-green-500">GET</option>
                    <option value="POST" className="text-blue-500">POST</option>
                    <option value="PUT" className="text-yellow-500">PUT</option>
                    <option value="PATCH" className="text-orange-500">PATCH</option>
                    <option value="DELETE" className="text-red-500">DELETE</option>
                </select>

                <div className="flex-1 relative flex items-center min-w-0 bg-dark-800/30">
                    <input
                        type="text"
                        className="w-full bg-transparent px-4 py-2.5 outline-none text-sm font-medium tracking-wide text-dark-100 placeholder-dark-600 relative z-10"
                        placeholder="Enter API URL or {{BASE_URL}}/path"
                        value={activeRequest?.url || ''}
                        onChange={(e) => setActiveRequest({ url: e.target.value })}
                    />
                </div>

                <button
                    className="btn-primary flex items-center gap-2 px-6 rounded-r-lg shadow-lg shadow-primary-900/20"
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

            {/* API Description Area */}
            <div className="px-1">
                <input
                    type="text"
                    className="w-full bg-transparent border-b border-dark-800 focus:border-primary-500/50 py-1 px-2 text-[11px] text-dark-400 outline-none transition-all placeholder:italic"
                    placeholder="Thêm mô tả ngắn cho API này (ví dụ: API lấy danh sách người dùng)..."
                    value={activeRequest.description || ''}
                    onChange={(e) => setActiveRequest({ description: e.target.value })}
                />
            </div>

            {/* Request Tabs */}
            <div className="glass-card flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex border-b border-dark-800 p-1 gap-1">
                    {['docs', 'params', 'headers', 'body', 'auth', 'scripts', 'assertions', 'examples'].map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                ? 'bg-dark-800 text-primary-400'
                                : 'text-dark-500 hover:text-dark-200 hover:bg-dark-800/50'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">
                    {activeTab === 'docs' && <DocsTab request={activeRequest} onChange={(val) => setActiveRequest(val)} />}
                    {activeTab === 'params' && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Query Parameters</span>
                                    <button
                                        onClick={() => toggleBulkMode('params')}
                                        className="text-[10px] font-bold text-primary-500 hover:text-primary-400 uppercase tracking-tight px-2 py-0.5 rounded bg-primary-500/10 transition-all"
                                    >
                                        {bulkMode.params ? 'Key-Value Edit' : 'Bulk Edit'}
                                    </button>
                                </div>
                                {!bulkMode.params && (
                                    <button onClick={addParam} className="text-primary-500 hover:text-primary-400 text-xs font-medium flex items-center gap-1 transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Param
                                    </button>
                                )}
                            </div>

                            {bulkMode.params ? (
                                <textarea
                                    className="w-full h-64 bg-dark-800/30 border border-dark-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-mono transition-all text-dark-200 custom-scrollbar"
                                    placeholder="key:value&#10;key2:value2"
                                    value={bulkText.params}
                                    onChange={(e) => setBulkText(prev => ({ ...prev, params: e.target.value }))}
                                ></textarea>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[30px_40px_1fr_1fr_1fr_40px] gap-2 px-2">
                                        <div className=""></div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600 text-center" title="Required">*</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Key</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Value</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Description</div>
                                        <div className=""></div>
                                    </div>
                                    {activeRequest.params.map((p, index) => (
                                        <div key={index} className="grid grid-cols-[30px_40px_1fr_1fr_1fr_40px] gap-2 items-center group animate-fade-in">
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={p.enabled}
                                                    onChange={(e) => updateParam(index, 'enabled', e.target.checked)}
                                                    className="accent-primary-500 w-3.5 h-3.5 cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={p.required}
                                                    onChange={(e) => updateParam(index, 'required', e.target.checked)}
                                                    className="accent-red-500 w-3 h-3 cursor-pointer"
                                                    title="Mark as Required"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Key"
                                                className={`input-field !py-1.5 ${p.required ? 'border-red-500/30' : ''}`}
                                                value={p.key}
                                                onChange={(e) => handleRowChange('params', index, 'key', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                className="input-field !py-1.5"
                                                value={p.value}
                                                onChange={(e) => handleRowChange('params', index, 'value', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                className="input-field !py-1.5 !bg-transparent border-transparent hover:border-dark-700 focus:bg-dark-800 focus:border-dark-700"
                                                value={p.description || ''}
                                                onChange={(e) => handleRowChange('params', index, 'description', e.target.value)}
                                            />
                                            <button onClick={() => removeParam(index)} className="p-2 text-dark-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {activeRequest.params.length === 0 && (
                                        <div className="text-center py-8 text-dark-600 text-sm italic">No parameters added.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'headers' && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">HTTP Headers</span>
                                    <button
                                        onClick={() => toggleBulkMode('headers')}
                                        className="text-[10px] font-bold text-primary-500 hover:text-primary-400 uppercase tracking-tight px-2 py-0.5 rounded bg-primary-500/10 transition-all"
                                    >
                                        {bulkMode.headers ? 'Key-Value Edit' : 'Bulk Edit'}
                                    </button>
                                </div>
                                {!bulkMode.headers && (
                                    <button onClick={addHeader} className="text-primary-500 hover:text-primary-400 text-xs font-medium flex items-center gap-1 transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Header
                                    </button>
                                )}
                            </div>

                            {bulkMode.headers ? (
                                <textarea
                                    className="w-full h-64 bg-dark-800/30 border border-dark-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-mono transition-all text-dark-200 custom-scrollbar"
                                    placeholder="key:value&#10;key2:value2"
                                    value={bulkText.headers}
                                    onChange={(e) => setBulkText(prev => ({ ...prev, headers: e.target.value }))}
                                ></textarea>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[30px_40px_1fr_1fr_1fr_40px] gap-2 px-2">
                                        <div className=""></div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600 text-center" title="Required">*</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Key</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Value</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Description</div>
                                        <div className=""></div>
                                    </div>
                                    {activeRequest.headers.map((h, index) => (
                                        <div key={index} className="grid grid-cols-[30px_40px_1fr_1fr_1fr_40px] gap-2 items-center group animate-fade-in">
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={h.enabled}
                                                    onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                                                    className="accent-primary-500 w-3.5 h-3.5 cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={h.required}
                                                    onChange={(e) => updateHeader(index, 'required', e.target.checked)}
                                                    className="accent-red-500 w-3 h-3 cursor-pointer"
                                                    title="Mark as Required"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Key"
                                                className={`input-field !py-1.5 ${h.required ? 'border-red-500/30' : ''}`}
                                                value={h.key}
                                                onChange={(e) => handleRowChange('headers', index, 'key', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                className="input-field !py-1.5"
                                                value={h.value}
                                                onChange={(e) => handleRowChange('headers', index, 'value', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                className="input-field !py-1.5 !bg-transparent border-transparent hover:border-dark-700 focus:bg-dark-800 focus:border-dark-700"
                                                value={h.description || ''}
                                                onChange={(e) => handleRowChange('headers', index, 'description', e.target.value)}
                                            />
                                            <button onClick={() => removeHeader(index)} className="p-2 text-dark-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'body' && <BodyEditor body={activeRequest.body} onChange={(val) => setActiveRequest({ body: val })} />}

                    {activeTab === 'examples' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Saved Logs (Snapshots)</span>
                            </div>

                            <div className="grid gap-3">
                                {examples.map(ex => (
                                    <div key={ex.id} className="flex items-center justify-between p-3 bg-dark-800/30 border border-dark-800 rounded-xl hover:border-primary-500/30 transition-all group">
                                        <div className="flex flex-col gap-1 min-w-0 flex-1 cursor-pointer" onClick={() => loadExample(ex)}>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${ex.method === 'GET' ? 'bg-green-500/10 text-green-500' :
                                                    ex.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>{ex.method}</span>
                                                <span className="text-sm font-bold text-dark-100 truncate">{ex.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-dark-500 font-medium">
                                                <span className="truncate max-w-[250px] font-mono">{ex.url}</span>
                                                <span>•</span>
                                                <span>{new Date(ex.created_at).toLocaleString()}</span>
                                                {ex.response_status && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={ex.response_status < 400 ? 'text-green-500' : 'text-red-500'}>
                                                            {ex.response_status}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => loadExample(ex)}
                                                className="px-3 py-1.5 text-[10px] font-bold bg-primary-600/10 text-primary-400 hover:bg-primary-600 hover:text-white rounded-lg transition-all"
                                            >
                                                LOAD
                                            </button>
                                            <button
                                                onClick={() => handleOpenRename(ex)}
                                                className="p-1.5 text-dark-500 hover:text-dark-200 transition-colors"
                                                title="Rename"
                                            >
                                                <Plus className="w-4 h-4 rotate-45" /> {/* Use Plus rotated as a pencil alternative if no edit icon */}
                                            </button>
                                            <button
                                                onClick={() => deleteExample(ex.id)}
                                                className="p-1.5 text-dark-500 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {examples.length === 0 && (
                                    <div className="text-center py-12 text-dark-600 space-y-3">
                                        <div className="w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-2 opacity-30">
                                            <Save className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium italic">Chưa có snapshot nào được lưu.</p>
                                        <p className="text-xs">Nhấn "SAVE LOG" ở bảng Response để lưu lại kết quả.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'scripts' && (
                        <div className="space-y-6 animate-fade-in flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Request Scripts</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-8 pb-10">
                                <div className="flex flex-col min-h-[200px]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                            <Plus className="w-3.5 h-3.5 text-yellow-500" />
                                        </div>
                                        <span className="text-xs font-bold text-dark-300">Pre-request Script</span>
                                        <span className="text-[9px] text-dark-600 font-medium ml-auto italic">Runs before sending request</span>
                                    </div>
                                    <textarea
                                        className="w-full bg-dark-800/30 border border-dark-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500/30 text-xs font-mono transition-all text-dark-200 custom-scrollbar resize-y min-h-[200px]"
                                        style={{ height: '300px' }}
                                        placeholder="// Pre-request Script: Tạo Signature&#10;const timestamp = Math.floor(Date.now() / 1000).toString();&#10;const signature = CryptoJS.HmacSHA256(timestamp + omni.env.get('clientId'), omni.env.get('clientSecret')).toString();&#10;omni.env.set('X-Timestamp', timestamp);&#10;omni.env.set('X-Signature', signature);"
                                        value={activeRequest.preScript || ''}
                                        onChange={(e) => setActiveRequest({ preScript: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="flex flex-col min-h-[200px]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                                            <Plus className="w-3.5 h-3.5 text-green-500" />
                                        </div>
                                        <span className="text-xs font-bold text-dark-300">Post-response Script (Tests)</span>
                                        <span className="text-[9px] text-dark-600 font-medium ml-auto italic">Runs after receiving response</span>
                                    </div>
                                    <textarea
                                        className="w-full bg-dark-800/30 border border-dark-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-500/30 text-xs font-mono transition-all text-dark-200 custom-scrollbar resize-y min-h-[200px]"
                                        style={{ height: '300px' }}
                                        placeholder="// Post-response Script: Lưu Token&#10;const res = omni.response.json();&#10;if (res.status === 'success') {&#10;    omni.env.set('ref-user-id', res.data.core_user_id);&#10;}"
                                        value={activeRequest.postScript || ''}
                                        onChange={(e) => setActiveRequest({ postScript: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}
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
                                    <div className="relative flex items-center min-w-0">
                                        {/* Highlight Layer */}
                                        <div className="absolute inset-0 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg pointer-events-none whitespace-pre overflow-hidden flex items-center text-sm">
                                            <div className="flex items-center pointer-events-none truncate">
                                                {(activeRequest.authConfig?.loginUrl || '').split(/(\{\{[^}]+\}\})/).map((part, i) => (
                                                    part.startsWith('{{') && part.endsWith('}}') ? (
                                                        <span key={i} className="text-orange-400 font-bold bg-orange-400/10 px-0.5 rounded">{part}</span>
                                                    ) : (
                                                        <span key={i} className="text-dark-200">{part}</span>
                                                    )
                                                ))}
                                                {!(activeRequest.authConfig?.loginUrl) && (
                                                    <span className="text-dark-600">VD: {"{{BASE_URL}}"}/auth/login</span>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            className="w-full px-3 py-2 bg-transparent border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm text-transparent caret-white relative z-10"
                                            placeholder=""
                                            value={activeRequest.authConfig?.loginUrl || ''}
                                            onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, loginUrl: e.target.value } })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Token Path (JSONPath)</label>
                                        <input
                                            className="input-field"
                                            placeholder="data.access_token"
                                            value={activeRequest.authConfig?.tokenPath || ''}
                                            onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, tokenPath: e.target.value } })}
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
                                        value={typeof activeRequest.authConfig?.loginBody === 'object' ? JSON.stringify(activeRequest.authConfig.loginBody, null, 2) : (activeRequest.authConfig?.loginBody || '')}
                                        onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, loginBody: e.target.value } })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <SaveSnapshotModal
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                onSave={handleUpdateName}
                defaultName={editingExample?.name}
            />
        </div>
    );
};

export default RequestBuilder;
