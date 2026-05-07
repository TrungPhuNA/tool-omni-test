import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Globe, FileText, ChevronRight, ChevronDown,
    Terminal, Shield, Clock, BookOpen, ExternalLink,
    CheckCircle2, AlertCircle, Info, Copy
} from 'lucide-react';

const PublicFolderNode = ({ folder, activeRequestId, setActiveRequest, expandedFolders, toggleFolder }) => {
    return (
        <div className="space-y-1 mt-2">
            <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-dark-500 hover:text-dark-300 transition-colors"
            >
                {expandedFolders[folder.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-xs font-bold truncate uppercase tracking-wide">{folder.name}</span>
            </button>

            {expandedFolders[folder.id] && (
                <div className="ml-4 pl-3 border-l border-dark-800 space-y-1">
                    {/* Render Sub-folders recursively */}
                    {folder.folders?.map(subFolder => (
                        <PublicFolderNode 
                            key={subFolder.id}
                            folder={subFolder}
                            activeRequestId={activeRequestId}
                            setActiveRequest={setActiveRequest}
                            expandedFolders={expandedFolders}
                            toggleFolder={toggleFolder}
                        />
                    ))}

                    {/* Render Requests in this folder */}
                    {folder.requests?.map(req => (
                        <button
                            key={req.id}
                            onClick={() => setActiveRequest(req)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeRequestId === req.id ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-dark-400 hover:bg-dark-800/50'}`}
                        >
                            <span className={`text-[9px] font-black w-8 shrink-0 ${req.method === 'GET' ? 'text-green-500' : req.method === 'POST' ? 'text-blue-500' : 'text-yellow-500'}`}>
                                {req.method}
                            </span>
                            <span className="text-xs font-medium truncate">{req.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const PublicViewPage = () => {
    const { token } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeRequest, setActiveRequest] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const response = await axios.get(`${API_URL}/shares/public/${token}`);
                if (response.data.success) {
                    setCollection(response.data.data);
                    document.title = `${response.data.data.name || 'API Documentation'} - OmniTest`;
                    // Set first request as active if available
                    const firstReq = response.data.data.requests?.[0] || response.data.data.folders?.[0]?.requests?.[0];
                    if (firstReq) setActiveRequest(firstReq);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải dữ liệu tài liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, [token]);

    const toggleFolder = (id) => {
        setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Hàm render URL với highlight cho các biến {{variable}}
    const renderHighlightedUrl = (url) => {
        if (!url) return null;
        const parts = url.split(/(\{\{.*?\}\})/g);
        return parts.map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                return (
                    <span key={i} className="text-orange-400 font-bold drop-shadow-[0_0_8px_rgba(251,146,60,0.5)] cursor-help border-b border-orange-500/20" title="Biến môi trường">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    // Tìm giá trị BASE_URL từ danh sách requests nếu có thể (để hiển thị gợi ý)
    const getBaseUrlValue = () => {
        // Thực tế giá trị này nên được cấu hình khi share, 
        // tạm thời chúng ta hiển thị mô tả biến để người dùng biết cần thay thế gì.
        return "Địa chỉ máy chủ API của bạn (Ví dụ: http://api.example.com)";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-dark-400 font-medium animate-pulse">Đang tải tài liệu API...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-lg shadow-red-900/20">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-dark-100 mb-2">Truy cập bị từ chối</h1>
                <p className="text-dark-500 max-w-md mb-8">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-xl font-bold transition-all border border-dark-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-dark-950 text-dark-100 font-inter overflow-hidden">
            {/* Sidebar - Documentation Structure */}
            <div className="w-80 border-r border-dark-800 flex flex-col bg-dark-900/50 backdrop-blur-sm shrink-0">
                <div className="p-6 border-b border-dark-800 flex items-center gap-3 bg-dark-900/80">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/30">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-dark-100 tracking-tight">API Reference</h1>
                        <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest leading-none mt-1">Documentation</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <div className="px-3 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <span className="text-[10px] uppercase font-bold text-dark-500 tracking-widest">{collection.name}</span>
                        </div>

                        <div className="space-y-1">
                            {/* Root Requests */}
                            {collection.requests?.map(req => (
                                <button
                                    key={req.id}
                                    onClick={() => setActiveRequest(req)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeRequest?.id === req.id ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-dark-400 hover:bg-dark-800/50'}`}
                                >
                                    <span className={`text-[9px] font-black w-8 shrink-0 ${req.method === 'GET' ? 'text-green-500' : req.method === 'POST' ? 'text-blue-500' : 'text-yellow-500'}`}>
                                        {req.method}
                                    </span>
                                    <span className="text-xs font-medium truncate">{req.name}</span>
                                </button>
                            ))}

                            {/* Folders recursive */}
                            {collection.folders?.map(folder => (
                                <PublicFolderNode 
                                    key={folder.id} 
                                    folder={folder} 
                                    activeRequestId={activeRequest?.id}
                                    setActiveRequest={setActiveRequest}
                                    expandedFolders={expandedFolders}
                                    toggleFolder={toggleFolder}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-dark-800 bg-dark-900/50">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-dark-800/20 border border-dark-800/50">
                        <Globe className="w-4 h-4 text-dark-500" />
                        <span className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Public Documentation</span>
                    </div>
                </div>
            </div>


            {/* Main Content - API Details */}
            <div className="flex-1 overflow-y-auto bg-dark-950 p-12">
                {activeRequest ? (
                    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                        {/* API Header */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-widest ${activeRequest.method === 'GET' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        activeRequest.method === 'POST' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                    }`}>
                                    {activeRequest.method}
                                </span>
                                <h2 className="text-3xl font-black text-dark-100 tracking-tight">{activeRequest.name}</h2>
                            </div>
                            
                            {/* Biến môi trường thông tin ở đầu */}
                            {activeRequest.url?.includes('{{BASE_URL}}') && (
                                <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-start gap-4 mb-6">
                                    <div className="p-2 bg-orange-500/20 rounded-lg shrink-0">
                                        <Info className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-orange-400 mb-1">Cấu hình Base URL</h4>
                                        <p className="text-xs text-dark-400 leading-relaxed">
                                            API này sử dụng biến <code className="text-orange-400 font-bold">{"{{BASE_URL}}"}</code>. 
                                            Giá trị mặc định: <span className="text-dark-200 italic">{getBaseUrlValue()}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <p className="text-dark-400 leading-relaxed text-lg">{activeRequest.description || 'Chưa có mô tả cho API này.'}</p>
                        </div>

                        {/* Endpoint Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-primary-500" />
                                Endpoint
                            </h3>
                            <div className="p-6 bg-dark-900 rounded-3xl border border-dark-800 flex items-center justify-between group shadow-xl">
                                <code className="text-primary-400 font-mono text-lg break-all">
                                    {renderHighlightedUrl(activeRequest.url)}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(activeRequest.url);
                                        // Could add toast here
                                    }}
                                    className="p-3 hover:bg-dark-800 rounded-2xl text-dark-500 hover:text-dark-200 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Request Params & Headers Section */}
                        {(activeRequest.params?.length > 0 || activeRequest.headers?.length > 0) && (
                            <div className="grid grid-cols-1 gap-12">
                                {activeRequest.params?.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em]">Query Parameters</h3>
                                        <div className="overflow-hidden border border-dark-800 rounded-3xl bg-dark-900/50 shadow-lg">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-dark-800/50 border-b border-dark-800">
                                                        <th className="px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-widest">Tham số</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-widest">Trạng thái</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-widest">Mô tả</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-dark-800">
                                                    {activeRequest.params.map((p, idx) => (
                                                        <tr key={idx} className="hover:bg-dark-800/30 transition-colors">
                                                            <td className="px-6 py-4 font-mono text-xs text-primary-400">
                                                                {renderHighlightedUrl(p.key)}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {p.enabled ? (
                                                                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold">Bắt buộc</span>
                                                                ) : (
                                                                    <span className="text-[10px] bg-dark-700 text-dark-500 px-2 py-0.5 rounded-full font-bold">Tùy chọn</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-xs text-dark-400">{p.description || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeRequest.headers?.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em]">Headers</h3>
                                        <div className="overflow-hidden border border-dark-800 rounded-3xl bg-dark-900/50 shadow-lg">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-dark-800/50 border-b border-dark-800">
                                                        <th className="px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-widest">Key</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-widest">Value</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-widest">Mô tả</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-dark-800">
                                                    {activeRequest.headers.map((h, idx) => (
                                                        <tr key={idx} className="hover:bg-dark-800/30 transition-colors">
                                                            <td className="px-6 py-4 font-mono text-xs text-primary-400">
                                                                {renderHighlightedUrl(h.key)}
                                                            </td>
                                                            <td className="px-6 py-4 font-mono text-xs text-dark-300">
                                                                {renderHighlightedUrl(h.value)}
                                                            </td>
                                                            <td className="px-6 py-4 text-xs text-dark-400">{h.description || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Request Body */}
                        {activeRequest.body && activeRequest.method !== 'GET' && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em]">Request Body (JSON)</h3>
                                <div className="rounded-3xl border border-dark-800 bg-dark-900 overflow-hidden shadow-2xl">
                                    <div className="bg-dark-800/50 px-6 py-3 border-b border-dark-800 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-dark-500 uppercase">application/json</span>
                                    </div>
                                    <pre className="p-8 text-sm font-mono text-dark-300 overflow-x-auto">
                                        <code>{typeof activeRequest.body === 'string' ? activeRequest.body : JSON.stringify(activeRequest.body, null, 2)}</code>
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Examples / Responses */}
                        {activeRequest.examples?.length > 0 && (
                            <div className="space-y-8">
                                <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em]">Mẫu Phản Hồi (Snapshots)</h3>
                                <div className="space-y-6">
                                    {activeRequest.examples.map(ex => (
                                        <div key={ex.id} className="rounded-3xl border border-dark-800 bg-dark-900 overflow-hidden shadow-2xl">
                                            <div className="bg-dark-800/50 px-6 py-4 border-b border-dark-800 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-primary-500" />
                                                    <span className="text-sm font-bold text-dark-200">{ex.name}</span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${ex.response_status < 400 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                    STATUS: {ex.response_status}
                                                </span>
                                            </div>
                                            <pre className="p-8 text-sm font-mono text-dark-400 overflow-x-auto bg-dark-950/50">
                                                <code>{typeof ex.response_body === 'string' ? ex.response_body : JSON.stringify(ex.response_body, null, 2)}</code>
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 bg-dark-900 rounded-full flex items-center justify-center border border-dark-800 shadow-2xl">
                            <BookOpen className="w-10 h-10 text-dark-700" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-dark-200 mb-2">Chào mừng đến với API Reference</h2>
                            <p className="text-dark-500 max-w-sm mx-auto text-sm">Chọn một API từ menu bên trái để xem chi tiết tài liệu, bao gồm endpoint, tham số và các mẫu phản hồi.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicViewPage;
