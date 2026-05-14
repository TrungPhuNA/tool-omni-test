import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Trash2, ShieldCheck, Save, Settings2, Check, Edit3, Info, Zap } from 'lucide-react';
import Select from 'react-select';
import useStore from '../../../store/useStore';
import SaveSnapshotModal from '../../common/SaveSnapshotModal';

const typeOptions = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'array', label: 'Array' },
    { value: 'object', label: 'Object' },
    { value: 'file', label: 'File' },
];

const customSelectStyles = {
    control: (base) => ({
        ...base,
        background: 'rgba(15, 23, 42, 0.3)', // bg-dark-800/30
        borderColor: 'rgba(30, 41, 59, 1)',   // border-dark-700
        minHeight: '34px',
        height: '34px',
        borderRadius: '0.5rem',             // rounded-lg
        boxShadow: 'none',
        fontSize: '11px',
        '&:hover': {
            borderColor: 'rgba(56, 189, 248, 0.5)', 
        }
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 8px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'rgba(226, 232, 240, 1)',      // text-dark-200
        margin: 0,
    }),
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
        borderRadius: '0.5rem',
        overflow: 'hidden',
        zIndex: 100,
    }),
    option: (base, { isFocused, isSelected }) => ({
        ...base,
        background: isSelected ? 'rgba(56, 189, 248, 0.2)' : isFocused ? 'rgba(30, 41, 59, 0.5)' : 'transparent',
        color: isSelected ? '#38bdf8' : '#94a3b8',
        fontSize: '11px',
        padding: '8px 12px',
        cursor: 'pointer',
        '&:active': {
            background: 'rgba(56, 189, 248, 0.3)',
        }
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0 4px',
        color: '#64748b',
        '&:hover': { color: '#94a3b8' }
    })
};

// Hàm helper tạo cấu trúc Tooltip xịn dùng chung
const renderVariableSpan = (key, value, targetId = 'api-url-input-field-unique') => {
    const displayValue = value !== undefined ? value : 'Chưa định nghĩa';
    const escapedKey = key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedValue = String(displayValue).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `
        <span 
            class="variable-badge group/var relative inline-block text-orange-400 font-mono cursor-text pointer-events-auto"
            onclick="document.getElementById('${targetId}').focus()"
        >
            {{${escapedKey}}}
            <div class="variable-tooltip absolute top-full left-0 mt-1.5 hidden group-hover/var:block z-[9999] w-max max-w-xs animate-fade-in pointer-events-none">
                <div class="bg-dark-900 border border-dark-700 rounded-lg shadow-2xl overflow-hidden p-2.5 shadow-orange-950/40 min-w-[180px]">
                    <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-dark-800">
                        <div class="w-4 h-4 bg-orange-500/20 rounded flex items-center justify-center text-[9px] text-orange-400 font-black italic border border-orange-500/20">E</div>
                        <span class="text-[9px] font-black text-dark-400 uppercase tracking-widest">Variable</span>
                    </div>
                    <div class="space-y-2">
                        <div class="bg-dark-950 p-2 rounded border border-dark-800 shadow-inner">
                            <code class="text-[11px] text-orange-400 font-mono break-all leading-relaxed">${escapedValue}</code>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[9px] text-dark-500 font-bold uppercase tracking-tight flex items-center gap-1">
                                <span class="text-emerald-500 text-xs">◈</span> Resolved
                            </span>
                            <span class="text-[9px] text-dark-300 font-mono font-bold">${escapedKey}</span>
                        </div>
                    </div>
                </div>
                <div class="w-2 h-2 bg-dark-900 border-l border-t border-dark-700 rotate-45 absolute -top-1 left-4"></div>
            </div>
        </span>
    `;
};

// Hàm helper để tô màu biến và hiện giá trị khi hover
const renderVariables = (text, environment, targetId) => {
    if (!text) return '';
    const escape = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const parts = text.split(/({{[^{}]+}})/g);
    return parts.map(part => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
            const key = part.slice(2, -2);
            const value = environment?.variables?.[key];
            return renderVariableSpan(key, value, targetId);
        }
        return `<span>${escape(part)}</span>`;
    }).join('');
};

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

    const highlightJson = (code) => {
        if (!code) return '';
        const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Highlight biến {{...}}
        let highlightedCode = code.replace(/({{[^{}]+}})/g, (match) => {
            const environment = useStore.getState().activeEnvironment;
            const key = match.slice(2, -2);
            const value = environment?.variables?.[key];
            return renderVariableSpan(key, value, 'body-json-textarea');
        });

        return highlightedCode.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            if (match.startsWith('<span')) return match; 
            let cls = 'text-emerald-400'; 
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'text-sky-400 font-medium'; 
                } else {
                    cls = 'text-emerald-400'; 
                }
            } else if (/true|false/.test(match)) {
                cls = 'text-violet-400 font-bold'; 
            } else if (/null/.test(match)) {
                cls = 'text-rose-400 font-bold'; 
            } else {
                cls = 'text-orange-400'; 
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
            <div className="relative w-full rounded-xl overflow-visible border border-dark-700 bg-dark-800/50 group focus-within:ring-2 focus-within:ring-primary-500/30 transition-all">
                {/* Lớp hiển thị màu sắc (Highlight Layer) - Đưa lên trên z-20 */}
                <pre
                    ref={preRef}
                    className="absolute inset-0 w-full p-4 m-0 text-sm font-mono pointer-events-none whitespace-pre overflow-hidden break-words text-dark-300 z-20"
                    style={{ height: `${height}px`, boxSizing: 'border-box' }}
                    dangerouslySetInnerHTML={{ __html: highlightJson(displayValue) + '\n' }}
                />
                
                {/* Lớp nhận input (Input Layer) - Đưa xuống dưới z-0 */}
                <textarea
                    id="body-json-textarea"
                    className="relative w-full bg-transparent p-4 outline-none text-sm font-mono resize-none text-white/10 caret-white custom-scrollbar z-0 whitespace-pre overflow-auto"
                    style={{ height: `${height}px`, boxSizing: 'border-box' }}
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

const DocsTab = ({ request, onChange, examples, saveExample, updateExample, deleteExample }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const generateAutoDocs = () => {
        let doc = `# ${request.name || 'API Documentation'}\n\n`;
        doc += `Đây là tài liệu hướng dẫn cho API \`${request.name}\`. \n\n`;
        doc += `## Endpoint\n\n`;
        doc += `\`${request.method}\` \`${request.url}\` \n\n`;
        
        const enabledParams = request.params?.filter(p => p.key && p.enabled) || [];
        if (enabledParams.length > 0) {
            doc += `## Query Parameters\n\n`;
            enabledParams.forEach(p => {
                doc += `- \`${p.key}\` (${p.type || 'string'}): ${p.description || 'Chưa có mô tả'}${p.required ? ' **(Bắt buộc)**' : ''}\n`;
            });
            doc += `\n`;
        }
        
        const enabledHeaders = request.headers?.filter(h => h.key && h.enabled) || [];
        if (enabledHeaders.length > 0) {
            doc += `## Headers\n\n`;
            enabledHeaders.forEach(h => {
                doc += `- \`${h.key}\`: ${h.description || 'Chưa có mô tả'}${h.required ? ' **(Bắt buộc)**' : ''}\n`;
            });
            doc += `\n`;
        }
        
        if (request.body && request.body.mode !== 'none') {
            doc += `## Request Body\n\n`;
            const bodyStr = typeof request.body === 'string' ? request.body : 
                            (request.body.mode === 'raw' ? request.body.raw : JSON.stringify(request.body, null, 2));
            doc += `\`\`\`json\n${bodyStr}\n\`\`\`\n\n`;
        }
        
        onChange({ documentation: doc });
    };

    
    const enabledParams = request.params?.filter(p => p.key && p.enabled) || [];
    const enabledHeaders = request.headers?.filter(h => h.key && h.enabled) || [];

    const renderMarkdown = (text) => {
        if (!text) return '';
        let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Render biến trước
        const environment = useStore.getState().activeEnvironment;
        html = renderVariables(text, environment);

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

    const handleUpdateParamType = (index, type) => {
        const newParams = [...request.params];
        newParams[index].type = type;
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
                    {isEditing && (
                        <button 
                            onClick={generateAutoDocs}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight px-4 py-2 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-all border border-primary-500/20"
                        >
                            <Zap className="w-3.5 h-3.5" /> Generate from Request
                        </button>
                    )}
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

            <div className="flex-1 min-h-0 space-y-7 pb-10">
                {/* 1. Main Documentation (Markdown) */}
                <div className="space-y-3">
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
                        <div className="relative bg-dark-900/40 p-5 rounded-2xl border border-dark-800/50 shadow-inner">
                            {request.documentation ? (
                                <div 
                                    className="prose prose-invert prose-sm max-w-none text-dark-300 leading-6"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(request.documentation) }}
                                />
                            ) : (
                                <p className="text-sm text-dark-500 italic text-center py-2">Chưa có nội dung giới thiệu.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-px bg-dark-800/20" />

                {/* 2. Endpoint Information */}
                <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                        Endpoint Detail
                    </h3>
                    {isEditing ? (
                        <div className="flex items-center gap-4 p-4 bg-dark-950/50 border border-dark-800 rounded-2xl shadow-inner">
                            <select 
                                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-primary-400 font-bold outline-none cursor-pointer"
                                value={request.method}
                                onChange={(e) => onChange({ method: e.target.value })}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                            <input 
                                type="text"
                                className="flex-1 bg-dark-800/50 border border-dark-700 rounded-lg px-4 py-1.5 text-sm font-mono text-dark-100 outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                                value={request.url}
                                placeholder="https://api.example.com/v1/resource"
                                onChange={(e) => onChange({ url: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-dark-950/50 border border-dark-800 rounded-2xl font-mono text-sm shadow-inner group">
                            <span className={`px-3 py-1 rounded-lg text-[11px] font-black tracking-widest ${
                                request.method === 'GET' ? 'bg-green-500/10 text-green-500' :
                                request.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                            }`}>{request.method}</span>
                            <span className="text-dark-200" dangerouslySetInnerHTML={{ __html: renderVariables(request.url || 'No URL', useStore.getState().activeEnvironment, 'url-main-input') }}></span>
                        </div>
                    )}
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
                                            <td className="px-5 py-2.5 font-mono text-[11px] text-primary-400 font-bold">{h.key}</td>
                                            <td className="px-5 py-2.5 font-mono text-[11px] text-dark-400" dangerouslySetInnerHTML={{ __html: renderVariables(h.value, useStore.getState().activeEnvironment, 'header-value-input-' + i) }}></td>
                                            <td className="px-5 py-2.5 text-center">
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
                                            <td className="px-5 py-2.5">
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
                                        <th className="px-5 py-3 text-center">Type</th>
                                        <th className="px-5 py-3">Value</th>
                                        <th className="px-5 py-3 text-center">Required</th>
                                        <th className="px-5 py-3">Description / Note</th>
                                    </tr>
                                </thead>
                                <tbody className="text-dark-200">
                                    {request.params.map((p, i) => p.enabled && p.key && (
                                        <tr key={i} className="hover:bg-dark-800/40 transition-colors border-t border-dark-800/50">
                                            <td className="px-5 py-2.5 font-mono text-[11px] text-primary-400 font-bold">{p.key}</td>
                                            <td className="px-5 py-2.5 text-center">
                                                {isEditing ? (
                                                    <div className="w-[100px] mx-auto">
                                                        <Select 
                                                            options={typeOptions}
                                                            styles={customSelectStyles}
                                                            value={typeOptions.find(opt => opt.value === (p.type || 'string'))}
                                                            onChange={(opt) => handleUpdateParamType(i, opt.value)}
                                                            isSearchable={false}
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-dark-800 text-dark-400 text-[9px] font-bold uppercase tracking-tighter border border-dark-700">{p.type || 'string'}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-2.5 font-mono text-[11px] text-dark-400" dangerouslySetInnerHTML={{ __html: renderVariables(p.value, useStore.getState().activeEnvironment, 'param-value-input-' + i) }}></td>
                                            <td className="px-5 py-2.5 text-center">
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
                                            <td className="px-5 py-2.5">
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
                {request.body && request.body.mode !== 'none' && (
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                            Request Body ({request.body.mode})
                        </h3>

                        {request.body.mode === 'raw' ? (
                            <div className="relative group">
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-dark-950/50 border border-dark-800 rounded-2xl p-4 font-mono text-[12px] text-emerald-400 outline-none focus:ring-2 focus:ring-primary-500/30 min-h-[150px] custom-scrollbar shadow-inner"
                                        value={request.body.raw || ''}
                                        onChange={(e) => onChange({ body: { ...request.body, raw: e.target.value } })}
                                    />
                                ) : (
                                    <pre className="p-5 bg-dark-950/50 border border-dark-800 rounded-2xl font-mono text-[12px] text-emerald-400 overflow-auto shadow-inner custom-scrollbar max-h-[300px]">
                                        {request.body.raw || ''}
                                    </pre>
                                )}
                                <div className="absolute top-3 right-3 text-[9px] text-dark-600 font-bold uppercase tracking-widest bg-dark-900 px-2 py-0.5 rounded border border-dark-800">
                                    {request.body.options?.raw?.language?.toUpperCase() || 'TEXT'}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden border border-dark-800 rounded-2xl bg-dark-900/30">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-dark-800/50 text-dark-500 text-[9px] uppercase font-black tracking-wider">
                                        <tr>
                                            <th className="px-5 py-2.5">Key</th>
                                            <th className="px-5 py-2.5">Value</th>
                                            <th className="px-5 py-2.5">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-dark-200">
                                        {(request.body[request.body.mode === 'form-data' ? 'formData' : 'urlencoded'] || [])
                                            .filter(f => f.enabled && f.key)
                                            .map((f, i) => (
                                            <tr key={i} className="hover:bg-dark-800/40 transition-colors border-t border-dark-800/50">
                                                <td className="px-5 py-3 font-mono text-[11px] text-primary-400 font-bold">{f.key}</td>
                                                <td className="px-5 py-3 font-mono text-[11px] text-dark-400">{f.value}</td>
                                                <td className="px-5 py-3">
                                                    {isEditing ? (
                                                        <input 
                                                            type="text"
                                                            className="w-full bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-1 text-xs text-dark-100 outline-none focus:ring-1 focus:ring-primary-500/50"
                                                            placeholder="Mô tả..."
                                                            value={f.description || ''}
                                                            onChange={(e) => {
                                                                const mode = request.body.mode === 'form-data' ? 'formData' : 'urlencoded';
                                                                const newList = [...request.body[mode]];
                                                                const realIdx = request.body[mode].findIndex(item => item.key === f.key);
                                                                if (realIdx !== -1) {
                                                                    newList[realIdx].description = e.target.value;
                                                                    onChange({ body: { ...request.body, [mode]: newList } });
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-dark-500 italic">{f.description || '-'}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className="h-px bg-dark-800/30" />

                {/* 6. Response Examples (Saved/Mock) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                            Response Examples / Mockups
                        </h3>
                        {isEditing && (
                            <button 
                                onClick={() => saveExample({
                                    request_id: request.id,
                                    name: 'New Mock Response',
                                    response_status: 200,
                                    response_body: { message: "Mock success" },
                                    response_headers: { "Content-Type": "application/json" },
                                    response_time: 100
                                })}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-all shadow-lg"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Mock Response
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {(examples || []).length > 0 ? (
                            examples.map((ex, idx) => (
                                <div key={idx} className="bg-dark-900/30 border border-dark-800 rounded-2xl overflow-hidden">
                                    <div className="flex items-center justify-between p-4 bg-dark-800/30">
                                        <div className="flex items-center gap-4 flex-1">
                                            {isEditing ? (
                                                <input 
                                                    type="text"
                                                    className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm text-dark-100 outline-none focus:ring-1 focus:ring-primary-500/50 min-w-[200px]"
                                                    value={ex.name}
                                                    onChange={(e) => updateExample(ex.id, { name: e.target.value })}
                                                />
                                            ) : (
                                                <span className="font-bold text-dark-100 text-sm">{ex.name}</span>
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <input 
                                                        type="number"
                                                        className="w-16 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-xs text-primary-400 font-mono outline-none"
                                                        value={ex.response_status}
                                                        onChange={(e) => updateExample(ex.id, { response_status: parseInt(e.target.value) })}
                                                    />
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${ex.response_status < 400 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {ex.response_status}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-dark-600 font-mono italic">{ex.response_time}ms</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {isEditing && (
                                                <button 
                                                    onClick={() => deleteExample(ex.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-dark-500 hover:text-red-500 transition-all"
                                                    title="Delete Example"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-dark-950/20">
                                        {isEditing ? (
                                            <textarea 
                                                className="w-full bg-dark-900/50 border border-dark-800 rounded-xl p-4 font-mono text-[11px] text-dark-300 outline-none focus:ring-1 focus:ring-primary-500/30 min-h-[150px] custom-scrollbar"
                                                value={typeof ex.response_body === 'string' ? ex.response_body : JSON.stringify(ex.response_body, null, 2)}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        updateExample(ex.id, { response_body: parsed });
                                                    } catch(err) {
                                                        updateExample(ex.id, { response_body: e.target.value });
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <pre className="text-[11px] font-mono text-dark-400 overflow-auto max-h-[200px] custom-scrollbar">
                                                {typeof ex.response_body === 'string' ? ex.response_body : JSON.stringify(ex.response_body, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 border-2 border-dashed border-dark-800 rounded-3xl text-center">
                                <p className="text-sm text-dark-500 italic mb-2">Chưa có Response Example nào cho API này.</p>
                                {isEditing && (
                                    <button 
                                        onClick={() => saveExample({
                                            request_id: request.id,
                                            name: 'New Mock Response',
                                            response_status: 200,
                                            response_body: { message: "Mock success" },
                                            response_headers: { "Content-Type": "application/json" },
                                            response_time: 100
                                        })}
                                        className="text-xs text-primary-500 font-bold hover:underline"
                                    >
                                        Tạo Mock Response đầu tiên
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
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
        saveExample,
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
    
    const urlInputRef = useRef(null);
    const urlDisplayRef = useRef(null);

    const syncUrlScroll = () => {
        if (urlInputRef.current && urlDisplayRef.current) {
            urlDisplayRef.current.style.transform = `translateX(-${urlInputRef.current.scrollLeft}px)`;
        }
    };

    useEffect(() => {
        if (activeRequest?.id && (activeTab === 'examples' || activeTab === 'tab-examples' || activeTab === 'docs')) {
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
        <div className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Request Input Area */}
            <div className="flex gap-0 p-1 bg-dark-900 border border-dark-800 rounded-xl shadow-lg items-stretch relative z-[60]">
                <select
                    className="bg-dark-800 text-sm font-bold px-4 py-2.5 rounded-l-lg outline-none border-r border-dark-700 focus:border-primary-500 transition-all min-w-[100px] text-dark-100 cursor-pointer relative z-20"
                    value={activeRequest.method}
                    onChange={(e) => setActiveRequest({ method: e.target.value })}
                >
                    <option value="GET" className="text-green-500">GET</option>
                    <option value="POST" className="text-blue-500">POST</option>
                    <option value="PUT" className="text-yellow-500">PUT</option>
                    <option value="PATCH" className="text-orange-500">PATCH</option>
                    <option value="DELETE" className="text-red-500">DELETE</option>
                </select>

                <div className="flex-1 relative h-[42px] z-10">
                    {/* 1. Background Layer */}
                    <div className="absolute inset-0 bg-dark-800/30 rounded-xl pointer-events-none"></div>
                    
                    {/* 2. Content Layer (Clipped X, Visible Y up to 300px) */}
                    <div className="absolute inset-x-0 top-0 overflow-hidden pointer-events-none" style={{ height: '300px' }}>
                        <div className="grid grid-cols-1 grid-rows-1 h-[42px] relative overflow-visible">
                            <div 
                                ref={urlDisplayRef}
                                className="col-start-1 row-start-1 px-4 whitespace-nowrap overflow-visible pointer-events-none z-20 border-none outline-none m-0 flex items-center transition-none"
                                style={{ 
                                    height: '42px', 
                                    lineHeight: '42px', 
                                    letterSpacing: '0px', 
                                    fontSize: '13px',
                                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                                    willChange: 'transform'
                                }}
                                dangerouslySetInnerHTML={{ __html: renderVariables(activeRequest?.url || '', useStore.getState().activeEnvironment, 'api-url-input-field-unique') }}
                            />
                            <input
                                ref={urlInputRef}
                                id="api-url-input-field-unique"
                                type="text"
                                className="col-start-1 row-start-1 w-full bg-transparent px-4 outline-none text-transparent caret-white relative z-10 border-none m-0 pointer-events-auto"
                                style={{ 
                                    height: '42px', 
                                    lineHeight: '42px', 
                                    letterSpacing: '0px', 
                                    fontSize: '13px',
                                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                }}
                                placeholder="Enter API URL or {{BASE_URL}}/path"
                                value={activeRequest?.url || ''}
                                onChange={(e) => setActiveRequest({ url: e.target.value })}
                                onScroll={syncUrlScroll}
                                onWheel={(e) => {
                                    if (urlInputRef.current) {
                                        urlInputRef.current.scrollLeft += e.deltaY;
                                        syncUrlScroll();
                                    }
                                }}
                                spellCheck="false"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>

                <button
                    className="btn-primary flex items-center gap-2 px-6 rounded-r-lg shadow-lg shadow-primary-900/20 relative z-20"
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
                    {activeTab === 'docs' && (
                        <DocsTab 
                            request={activeRequest} 
                            onChange={(val) => setActiveRequest(val)} 
                            examples={examples}
                            saveExample={saveExample}
                            updateExample={updateExample}
                            deleteExample={deleteExample}
                        />
                    )}
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
                                    <div className="grid grid-cols-[30px_40px_1.2fr_100px_1.2fr_1.5fr_40px] gap-2 px-2">
                                        <div className=""></div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600 text-center" title="Required">*</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Key</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600 text-center">Type</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Value</div>
                                        <div className="text-[10px] uppercase font-bold text-dark-600">Description</div>
                                        <div className=""></div>
                                    </div>
                                    {activeRequest.params.map((p, index) => (
                                        <div key={index} className="grid grid-cols-[30px_40px_1.2fr_100px_1.2fr_1.5fr_40px] gap-2 items-center group animate-fade-in">
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
                                            <div className="w-[100px]">
                                                <Select 
                                                    options={typeOptions}
                                                    styles={customSelectStyles}
                                                    value={typeOptions.find(opt => opt.value === (p.type || 'string'))}
                                                    onChange={(opt) => handleRowChange('params', index, 'type', opt.value)}
                                                    isSearchable={false}
                                                    menuPortalTarget={document.body}
                                                />
                                            </div>
                                            <div className="relative flex-1">
                                                <div 
                                                    className="absolute inset-0 px-3 py-1.5 text-xs font-mono whitespace-nowrap overflow-hidden pointer-events-none"
                                                    dangerouslySetInnerHTML={{ __html: renderVariables(p.value, useStore.getState().activeEnvironment, 'param-value-input-' + index) }}
                                                />
                                                <input
                                                    id={`param-value-input-${index}`}
                                                    type="text"
                                                    placeholder="Value"
                                                    className="input-field !py-1.5 text-white/10 caret-white relative z-10 bg-transparent w-full"
                                                    value={p.value}
                                                    onChange={(e) => handleRowChange('params', index, 'value', e.target.value)}
                                                />
                                            </div>
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
                                            <div className="relative flex-1">
                                                <div 
                                                    className="absolute inset-0 px-3 py-1.5 text-xs font-mono whitespace-nowrap overflow-hidden pointer-events-none"
                                                    dangerouslySetInnerHTML={{ __html: renderVariables(h.value, useStore.getState().activeEnvironment, 'header-value-input-' + index) }}
                                                />
                                                <input
                                                    id={`header-value-input-${index}`}
                                                    type="text"
                                                    placeholder="Value"
                                                    className="input-field !py-1.5 text-white/10 caret-white relative z-10 bg-transparent w-full"
                                                    value={h.value}
                                                    onChange={(e) => handleRowChange('headers', index, 'value', e.target.value)}
                                                />
                                            </div>
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

                    {activeTab === 'body' && (
                        <div className="flex flex-col h-full animate-fade-in space-y-4">
                            {/* Body Type Selector */}
                            <div className="flex items-center gap-6 px-1 py-2 border-b border-dark-800/50">
                                {[
                                    { id: 'none', label: 'none' },
                                    { id: 'form-data', label: 'form-data' },
                                    { id: 'urlencoded', label: 'x-www-form-urlencoded' },
                                    { id: 'raw', label: 'raw' }
                                ].map((mode) => (
                                    <label key={mode.id} className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="bodyMode"
                                                className="sr-only"
                                                checked={(activeRequest.body?.mode || 'none') === mode.id}
                                                onChange={() => setActiveRequest({ 
                                                    body: { ...activeRequest.body, mode: mode.id } 
                                                })}
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${(activeRequest.body?.mode || 'none') === mode.id ? 'border-primary-500 bg-primary-500' : 'border-dark-600 group-hover:border-dark-500'}`}>
                                                {(activeRequest.body?.mode || 'none') === mode.id && (
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-[11px] font-medium transition-colors ${(activeRequest.body?.mode || 'none') === mode.id ? 'text-dark-100' : 'text-dark-500 group-hover:text-dark-400'}`}>
                                            {mode.label}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {/* Body Content Editor */}
                            <div className="flex-1 min-h-0">
                                {(activeRequest.body?.mode || 'none') === 'none' && (
                                    <div className="flex flex-col items-center justify-center h-full text-dark-600 space-y-2 opacity-50">
                                        <Info className="w-8 h-8" />
                                        <span className="text-xs font-medium">This request does not have a body</span>
                                    </div>
                                )}

                                {(activeRequest.body?.mode || 'none') === 'raw' && (
                                    <div className="h-full flex flex-col space-y-2">
                                        <div className="flex justify-end">
                                            <select 
                                                className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-[10px] text-primary-400 font-bold outline-none"
                                                value={activeRequest.body?.options?.raw?.language || 'json'}
                                                onChange={(e) => setActiveRequest({
                                                    body: { 
                                                        ...activeRequest.body, 
                                                        options: { ...activeRequest.body.options, raw: { language: e.target.value } }
                                                    }
                                                })}
                                            >
                                                <option value="json">JSON</option>
                                                <option value="text">Text</option>
                                                <option value="html">HTML</option>
                                                <option value="xml">XML</option>
                                            </select>
                                        </div>
                                        <BodyEditor 
                                            body={activeRequest.body?.raw || ''} 
                                            onChange={(val) => setActiveRequest({ 
                                                body: { ...activeRequest.body, raw: val } 
                                            })} 
                                        />
                                    </div>
                                )}

                                {((activeRequest.body?.mode || 'none') === 'form-data' || (activeRequest.body?.mode || 'none') === 'urlencoded') && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-[30px_1.2fr_100px_1.2fr_1.5fr_40px] gap-2 px-2">
                                            <div className=""></div>
                                            <div className="text-[10px] uppercase font-bold text-dark-600">Key</div>
                                            {(activeRequest.body?.mode || 'none') === 'form-data' && (
                                                <div className="text-[10px] uppercase font-bold text-dark-600 text-center">Type</div>
                                            )}
                                            <div className="text-[10px] uppercase font-bold text-dark-600">Value</div>
                                            <div className="text-[10px] uppercase font-bold text-dark-600">Description</div>
                                            <div className=""></div>
                                        </div>
                                        
                                        {(activeRequest.body?.mode === 'form-data' ? (activeRequest.body?.formData || []) : (activeRequest.body?.urlencoded || [])).map((item, idx) => (
                                            <div key={idx} className="grid grid-cols-[30px_1.2fr_100px_1.2fr_1.5fr_40px] gap-2 items-center group animate-fade-in">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.enabled !== false}
                                                        onChange={(e) => {
                                                            const mode = activeRequest.body.mode === 'form-data' ? 'formData' : 'urlencoded';
                                                            const newList = [...(activeRequest.body[mode] || [])];
                                                            newList[idx] = { ...newList[idx], enabled: e.target.checked };
                                                            setActiveRequest({ body: { ...activeRequest.body, [mode]: newList } });
                                                        }}
                                                        className="accent-primary-500 w-3.5 h-3.5 cursor-pointer"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Key"
                                                    className="input-field !py-1.5"
                                                    value={item.key || ''}
                                                    onChange={(e) => {
                                                        const mode = activeRequest.body.mode === 'form-data' ? 'formData' : 'urlencoded';
                                                        const newList = [...(activeRequest.body[mode] || [])];
                                                        newList[idx] = { ...newList[idx], key: e.target.value };
                                                        // Tự động thêm dòng mới nếu gõ vào dòng cuối
                                                        if (idx === newList.length - 1 && e.target.value) {
                                                            newList.push({ key: '', value: '', type: 'text', enabled: true, description: '' });
                                                        }
                                                        setActiveRequest({ body: { ...activeRequest.body, [mode]: newList } });
                                                    }}
                                                />
                                                {activeRequest.body.mode === 'form-data' && (
                                                    <div className="w-[100px]">
                                                        <Select 
                                                            options={[
                                                                { value: 'text', label: 'Text' },
                                                                { value: 'file', label: 'File' }
                                                            ]}
                                                            styles={customSelectStyles}
                                                            value={{ value: item.type || 'text', label: (item.type || 'text').charAt(0).toUpperCase() + (item.type || 'text').slice(1) }}
                                                            onChange={(opt) => {
                                                                const newList = [...(activeRequest.body.formData || [])];
                                                                newList[idx] = { ...newList[idx], type: opt.value };
                                                                setActiveRequest({ body: { ...activeRequest.body, formData: newList } });
                                                            }}
                                                            isSearchable={false}
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </div>
                                                )}
                                                <div className="relative flex-1">
                                                    <input
                                                        type={item.type === 'file' ? 'file' : 'text'}
                                                        placeholder="Value"
                                                        className="input-field !py-1.5"
                                                        value={item.type === 'file' ? undefined : (item.value || '')}
                                                        onChange={(e) => {
                                                            const mode = activeRequest.body.mode === 'form-data' ? 'formData' : 'urlencoded';
                                                            const newList = [...(activeRequest.body[mode] || [])];
                                                            newList[idx] = { ...newList[idx], value: e.target.value };
                                                            setActiveRequest({ body: { ...activeRequest.body, [mode]: newList } });
                                                        }}
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Description"
                                                    className="input-field !py-1.5 !bg-transparent border-transparent hover:border-dark-700 focus:bg-dark-800 focus:border-dark-700"
                                                    value={item.description || ''}
                                                    onChange={(e) => {
                                                        const mode = activeRequest.body.mode === 'form-data' ? 'formData' : 'urlencoded';
                                                        const newList = [...(activeRequest.body[mode] || [])];
                                                        newList[idx] = { ...newList[idx], description: e.target.value };
                                                        setActiveRequest({ body: { ...activeRequest.body, [mode]: newList } });
                                                    }}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const mode = activeRequest.body.mode === 'form-data' ? 'formData' : 'urlencoded';
                                                        const newList = (activeRequest.body[mode] || []).filter((_, i) => i !== idx);
                                                        setActiveRequest({ body: { ...activeRequest.body, [mode]: newList } });
                                                    }}
                                                    className="p-1.5 text-dark-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {(activeRequest.body.mode === 'form-data' ? (activeRequest.body?.formData || []) : (activeRequest.body?.urlencoded || [])).length === 0 && (
                                            <button 
                                                onClick={() => {
                                                    const mode = activeRequest.body.mode === 'form-data' ? 'formData' : 'urlencoded';
                                                    setActiveRequest({ body: { ...activeRequest.body, [mode]: [{ key: '', value: '', type: 'text', enabled: true, description: '' }] } });
                                                }}
                                                className="w-full py-3 border border-dashed border-dark-700 rounded-xl text-dark-500 hover:text-primary-500 hover:border-primary-500/50 transition-all text-xs font-medium"
                                            >
                                                + Add Row
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
