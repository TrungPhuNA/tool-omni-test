import React, { useState, useEffect } from 'react';
import {
    Play,
    Save,
    Plus,
    Settings,
    History,
    Folder,
    Globe,
    Database,
    Cpu,
    ChevronRight,
    ChevronDown,
    Trash2,
    Copy,
    Clock,
    ShieldCheck,
    LogOut,
    User as UserIcon,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from './store/useStore';
import Login from './components/Login';
import Modal from './components/Modal';
import axios from 'axios';
import ScenarioRunner from './components/ScenarioRunner';

function App() {
    const {
        user,
        token,
        logout,
        collections,
        fetchCollections,
        createCollection,
        saveRequest,
        environments,
        activeEnvironment,
        setActiveEnvironment,
        fetchEnvironments,
        saveEnvironment,
        deleteEnvironment,
        activeRequest,
        setActiveRequest,
        response,
        setResponse,
        isLoading,
        setIsLoading,
        addHeader,
        updateHeader,
        removeHeader,
        addParam,
        updateParam,
        removeParam
    } = useStore();

    const [activeTab, setActiveTab] = useState('params'); // params, headers, body, auth
    const [expandedCollections, setExpandedCollections] = useState({});
    const [viewMode, setViewMode] = useState('builder'); // 'builder' or 'scenario'
    const [activeScenario, setActiveScenario] = useState(null);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newColName, setNewColName] = useState('');

    const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
    const [editingEnv, setEditingEnv] = useState(null); // { id, name, variables: { key: value } }

    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (token) {
            const init = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                    await axios.get(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchCollections();
                    fetchEnvironments();
                } catch (err) {
                    logout();
                }
            };
            init();
        }
    }, [token, logout, fetchCollections, fetchEnvironments]);

    if (!token) {
        return <Login />;
    }

    const toggleCollection = (id) => {
        setExpandedCollections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCreateCollection = async () => {
        if (newColName) {
            await createCollection(newColName);
            setNewColName('');
            setIsModalOpen(false);
            showToast('Đã tạo Collection mới!');
        }
    };

    const handleSaveEnv = async () => {
        if (editingEnv && editingEnv.name) {
            await saveEnvironment(editingEnv);
            setEditingEnv(null);
            showToast('Đã lưu môi trường!');
        }
    };

    const handleAddEnvVariable = () => {
        setEditingEnv(prev => ({
            ...prev,
            variables: { ...(prev.variables || {}), '': '' }
        }));
    };

    const handleUpdateEnvVariable = (oldKey, newKey, value) => {
        const newVars = { ...(editingEnv.variables || {}) };
        if (oldKey !== newKey) {
            delete newVars[oldKey];
        }
        newVars[newKey] = value;
        setEditingEnv(prev => ({ ...prev, variables: newVars }));
    };

    const handleRemoveEnvVariable = (key) => {
        const newVars = { ...(editingEnv.variables || {}) };
        delete newVars[key];
        setEditingEnv(prev => ({ ...prev, variables: newVars }));
    };

    const handleSave = async () => {
        let collectionId = activeRequest.collection_id;
        if (!collectionId) {
            if (collections.length === 0) {
                const col = await createCollection('Default Collection');
                collectionId = col.id;
            } else {
                collectionId = collections[0].id;
            }
        }

        const requestData = {
            ...activeRequest,
            headers: activeRequest.headers,
            params: activeRequest.params,
        };

        await saveRequest(collectionId, requestData);
        showToast('Đã lưu request thành công!');
    };

    const loadRequest = (req) => {
        setViewMode('builder');
        const headers = typeof req.headers === 'string' ? JSON.parse(req.headers) : (req.headers || []);
        const params = typeof req.params === 'string' ? JSON.parse(req.params) : (req.params || []);
        const body = typeof req.body === 'object' ? JSON.stringify(req.body, null, 2) : (req.body || '');

        setActiveRequest({
            id: req.id,
            collection_id: req.collection_id,
            name: req.name,
            method: req.method,
            url: req.url,
            headers: Array.isArray(headers) ? headers : [],
            params: Array.isArray(params) ? params : [],
            body: body,
            authConfig: req.auth_config || { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' }
        });
    };

    const loadScenario = (scenario) => {
        setActiveScenario(scenario);
        setViewMode('scenario');
    };

    const handleSend = async () => {
        setIsLoading(true);
        try {
            const headersObj = activeRequest.headers
                .filter(h => h.enabled && h.key)
                .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

            const paramsObj = activeRequest.params
                .filter(p => p.enabled && p.key)
                .reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {});

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';

            // Inject variables if environment is active
            const variables = activeEnvironment?.variables || {};

            const res = await axios.post(`${API_URL}/proxy/execute`, {
                method: activeRequest.method,
                url: activeRequest.url,
                headers: headersObj,
                params: paramsObj,
                body: activeRequest.body ? JSON.parse(activeRequest.body) : undefined,
                variables: variables, // Pass variables to backend for injection
                authConfig: activeRequest.authConfig // Pass authConfig for auto-token
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setResponse(res.data.data);
            showToast('Thực thi request thành công!');
        } catch (error) {
            setResponse({
                statusCode: 500,
                statusText: 'Internal Error',
                body: { error: error.message },
                responseTime: 0,
                headers: {}
            });
            showToast('Gửi request thất bại!', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-dark-950 overflow-hidden text-dark-100 selection:bg-primary-500/30">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className={`fixed top-4 left-1/2 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal for New Collection */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tạo Collection mới"
                footer={(
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="btn-secondary py-1.5">Hủy</button>
                        <button onClick={handleCreateCollection} className="btn-primary py-1.5">Tạo ngay</button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="label">Tên bộ sưu tập</label>
                        <input
                            type="text"
                            autoFocus
                            className="input-field"
                            placeholder="VD: Auth Module, Payment API..."
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                        />
                    </div>
                    <p className="text-xs text-dark-500 leading-relaxed">
                        Collection giúp bạn nhóm các API theo dự án hoặc module để dễ dàng quản lý và chạy test kịch bản sau này.
                    </p>
                </div>
            </Modal>

            {/* Modal for Environments Management */}
            <Modal
                isOpen={isEnvModalOpen}
                onClose={() => { setIsEnvModalOpen(false); setEditingEnv(null); }}
                title="Quản lý Môi trường (Environments)"
                footer={(
                    <button onClick={() => setIsEnvModalOpen(false)} className="btn-secondary py-1.5">Đóng</button>
                )}
            >
                <div className="space-y-6">
                    {!editingEnv ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="label">Danh sách môi trường</span>
                                <button
                                    onClick={() => setEditingEnv({ name: '', variables: { 'BASE_URL': '' } })}
                                    className="text-primary-500 hover:text-primary-400 text-xs font-bold flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tạo môi trường
                                </button>
                            </div>
                            <div className="grid gap-2">
                                {environments.map(env => (
                                    <div key={env.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary-500/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                                                <Database className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-sm">{env.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => setEditingEnv(env)} className="p-2 hover:bg-dark-700 rounded-lg text-dark-400">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => deleteEnvironment(env.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-dark-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {environments.length === 0 && (
                                    <div className="text-center py-8 text-dark-600 italic text-sm">Chưa có môi trường nào. Hãy tạo mới để dùng biến {'{{variable}}'}.</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="space-y-1">
                                <label className="label">Tên môi trường</label>
                                <input
                                    className="input-field"
                                    value={editingEnv.name}
                                    onChange={(e) => setEditingEnv({ ...editingEnv, name: e.target.value })}
                                    placeholder="VD: Staging, Production..."
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="label">Biến (Variables)</span>
                                    <button onClick={handleAddEnvVariable} className="text-primary-500 text-xs font-bold flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Thêm biến
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(editingEnv.variables || {}).map(([key, value], idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                className="input-field flex-1"
                                                value={key}
                                                placeholder="Key"
                                                onChange={(e) => handleUpdateEnvVariable(key, e.target.value, value)}
                                            />
                                            <input
                                                className="input-field flex-1"
                                                value={value}
                                                placeholder="Value"
                                                onChange={(e) => handleUpdateEnvVariable(key, key, e.target.value)}
                                            />
                                            <button onClick={() => handleRemoveEnvVariable(key)} className="p-2 text-dark-500 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button onClick={() => setEditingEnv(null)} className="btn-secondary py-1.5 px-4 text-xs">Quay lại</button>
                                <button onClick={handleSaveEnv} className="btn-primary py-1.5 px-6 text-xs">Lưu thay đổi</button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Sidebar - Collections */}
            <aside className="w-72 border-r border-dark-800 flex flex-col bg-dark-900/30 backdrop-blur-sm">
                <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/20">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight">OmniTest</h1>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="p-1.5 hover:bg-dark-800 rounded-md text-dark-400 transition-colors">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="label text-[10px]">Collections</span>
                        </div>
                        <div className="space-y-1">
                            {collections.map((col) => (
                                <div key={col.id}>
                                    <div
                                        onClick={() => toggleCollection(col.id)}
                                        className="group flex items-center gap-2 p-2 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all"
                                    >
                                        {expandedCollections[col.id] ? <ChevronDown className="w-4 h-4 text-dark-500" /> : <ChevronRight className="w-4 h-4 text-dark-500" />}
                                        <Folder className="w-4 h-4 text-primary-400" />
                                        <span className="text-sm font-medium">{col.name}</span>
                                    </div>
                                    {expandedCollections[col.id] && (
                                        <div className="ml-6 space-y-1 border-l border-dark-800 mt-1">
                                            {col.requests?.map((req) => (
                                                <div
                                                    key={req.id}
                                                    onClick={() => loadRequest(req)}
                                                    className={`flex items-center gap-2 p-2 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all ml-2 ${activeRequest.id === req.id ? 'bg-primary-500/10 text-primary-400' : ''}`}
                                                >
                                                    <span className={`text-[10px] font-bold w-8 ${req.method === 'GET' ? 'text-green-500' :
                                                            req.method === 'POST' ? 'text-blue-500' :
                                                                req.method === 'PUT' ? 'text-yellow-500' : 'text-red-500'
                                                        }`}>{req.method}</span>
                                                    <span className="text-sm truncate">{req.name}</span>
                                                </div>
                                            ))}

                                            {/* Scenarios Section */}
                                            {col.scenarios?.length > 0 && (
                                                <div className="mt-2 ml-2">
                                                    <span className="text-[9px] uppercase font-bold text-dark-600 ml-2 mb-1 block tracking-widest">Scenarios</span>
                                                    {col.scenarios.map(sc => (
                                                        <div
                                                            key={sc.id}
                                                            onClick={() => loadScenario(sc)}
                                                            className={`flex items-center gap-2 p-2 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all ${activeScenario?.id === sc.id && viewMode === 'scenario' ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-primary-400'}`}
                                                        >
                                                            <Play className="w-3 h-3" />
                                                            <span className="text-xs font-medium truncate">{sc.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 p-2 text-dark-600 hover:text-dark-400 cursor-pointer transition-all ml-2 group">
                                                <Plus className="w-3 h-3" />
                                                <span className="text-xs font-medium" onClick={() => setActiveRequest({ id: null, collection_id: col.id, name: 'New Request' })}>Add Request</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {collections.length === 0 && (
                                <div className="text-center py-4 text-dark-600 text-xs italic">No collections yet. Click + to add.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-dark-800 space-y-2">
                    <div className="flex items-center gap-3 px-2 py-3 bg-dark-800/30 rounded-xl border border-dark-800 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                            <UserIcon className="w-4 h-4 text-primary-400" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-dark-100 truncate">{user?.username}</p>
                            <p className="text-[10px] text-dark-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-dark-500"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="flex items-center gap-3 w-full p-2 hover:bg-dark-800 rounded-lg text-sm text-dark-400 transition-all">
                        <History className="w-4 h-4" />
                        History
                    </button>
                    <button
                        onClick={() => setIsEnvModalOpen(true)}
                        className="flex items-center gap-3 w-full p-2 hover:bg-dark-800 rounded-lg text-sm text-dark-400 transition-all"
                    >
                        <Settings className="w-4 h-4" />
                        Environments
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            {viewMode === 'builder' ? (
                <main className="flex-1 flex flex-col bg-dark-950">
                    {/* Top Header / Env Selector */}
                    <header className="h-14 border-b border-dark-800 flex items-center justify-between px-6 bg-dark-900/20">
                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                className="bg-transparent border-none outline-none text-sm font-bold text-primary-400 focus:ring-0 w-48"
                                value={activeRequest.name || 'Untitled Request'}
                                onChange={(e) => setActiveRequest({ name: e.target.value })}
                            />
                            <div className="w-px h-4 bg-dark-800"></div>
                            <div className="relative group/env">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm cursor-pointer hover:border-primary-500/50 transition-all">
                                    <Database className="w-4 h-4 text-primary-500" />
                                    <span>{activeEnvironment?.name || 'No Environment'}</span>
                                    <ChevronDown className="w-4 h-4 text-dark-500" />
                                </div>
                                <div className="absolute top-full left-0 w-48 pt-2 hidden group-hover/env:block z-50">
                                    <div className="bg-dark-900 border border-dark-800 rounded-xl shadow-2xl p-1 animate-fade-in">
                                        {environments.map(env => (
                                            <button
                                                key={env.id}
                                                onClick={() => setActiveEnvironment(env)}
                                                className={`flex items-center justify-between w-full p-2 rounded-lg text-xs transition-all ${activeEnvironment?.id === env.id ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-800 text-dark-400'}`}
                                            >
                                                {env.name}
                                                {activeEnvironment?.id === env.id && <CheckCircle2 className="w-3 h-3" />}
                                            </button>
                                        ))}
                                        <div className="border-t border-dark-800 mt-1 pt-1">
                                            <button
                                                onClick={() => setIsEnvModalOpen(true)}
                                                className="flex items-center gap-2 w-full p-2 rounded-lg text-xs text-primary-500 hover:bg-primary-500/5 transition-all font-medium"
                                            >
                                                <Settings className="w-3.5 h-3.5" /> Quản lý môi trường
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleSave} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </header>

                    {/* Request Input Area */}
                    <div className="p-6 space-y-6">
                        <div className="flex gap-2 p-1 bg-dark-900 border border-dark-800 rounded-xl shadow-lg">
                            <select
                                className="bg-dark-800 text-sm font-bold px-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-primary-500 transition-all min-w-[100px]"
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
                                className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm font-medium tracking-wide placeholder:text-dark-600"
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
                        <div className="glass-card flex-1 flex flex-col min-h-[300px]">
                            <div className="flex border-b border-dark-800 p-1 gap-1">
                                {['params', 'headers', 'body', 'auth', 'assertions'].map((tab) => (
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

                            <div className="flex-1 p-4 overflow-y-auto">
                                {activeTab === 'params' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="label">Query Parameters</span>
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
                                            <span className="label">HTTP Headers</span>
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

                                {activeTab === 'body' && (
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="label">JSON Body</span>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 text-[10px] font-bold uppercase">JSON</span>
                                            </div>
                                        </div>
                                        <textarea
                                            className="flex-1 w-full bg-dark-800/50 border border-dark-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-mono transition-all resize-none"
                                            placeholder='{ "key": "value" }'
                                            value={activeRequest.body}
                                            onChange={(e) => setActiveRequest({ body: e.target.value })}
                                        ></textarea>
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
                                                <label className="label">Login URL</label>
                                                <input
                                                    className="input-field"
                                                    placeholder="VD: {{BASE_URL}}/auth/login"
                                                    value={activeRequest.authConfig?.loginUrl || ''}
                                                    onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, loginUrl: e.target.value } })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="label">Token Path (JSONPath)</label>
                                                    <input
                                                        className="input-field"
                                                        placeholder="data.access_token"
                                                        value={activeRequest.authConfig?.tokenPath || ''}
                                                        onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, tokenPath: e.target.value } })}
                                                    />
                                                    <p className="text-[10px] text-dark-600 italic">Dùng lodash.get style để lấy token từ response login.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="label">Auth Type</label>
                                                    <select className="input-field">
                                                        <option>Bearer Token</option>
                                                        <option>Basic Auth (Coming soon)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="label">Login Body (JSON)</label>
                                                <textarea
                                                    className="input-field h-24 font-mono text-xs resize-none"
                                                    placeholder='{ "username": "admin", "password": "{{PASSWORD}}" }'
                                                    value={activeRequest.authConfig?.loginBody || ''}
                                                    onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, loginBody: e.target.value } })}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            ) : (
                <ScenarioRunner
                    scenario={activeScenario}
                    collections={collections}
                    activeEnvironment={activeEnvironment}
                    token={token}
                    showToast={showToast}
                />
            )}

            {/* Response Panel */}
            {viewMode === 'builder' && (
                <section className="w-[450px] border-l border-dark-800 bg-dark-900/30 backdrop-blur-sm flex flex-col">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <span className="label">Response</span>
                        {response && (
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
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
                        {!response ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-dark-600 gap-4 opacity-50">
                                <div className="p-6 bg-dark-800 rounded-full">
                                    <Cpu className="w-12 h-12" />
                                </div>
                                <p className="text-sm font-medium">Click "Send" to execute request</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 flex flex-col glass-card p-4 overflow-hidden animate-fade-in">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="label">Body</span>
                                        <button className="p-1 hover:bg-dark-800 rounded text-dark-500 transition-colors">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <pre className="flex-1 overflow-auto text-[13px] font-mono leading-relaxed text-dark-200 custom-scrollbar">
                                        {JSON.stringify(response.body, null, 2)}
                                    </pre>
                                </div>

                                <div className="h-48 glass-card p-4 overflow-hidden animate-fade-in">
                                    <span className="label block mb-3">Headers</span>
                                    <div className="space-y-1.5 overflow-y-auto h-full text-[11px] font-mono custom-scrollbar">
                                        {Object.entries(response.headers).map(([k, v]) => (
                                            <div key={k} className="flex border-b border-dark-800/50 pb-1 last:border-0">
                                                <span className="text-primary-400 w-24 shrink-0">{k}:</span>
                                                <span className="text-dark-400 truncate">{String(v)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

export default App;
