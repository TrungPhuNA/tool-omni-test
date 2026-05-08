import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import useStore from '../store/useStore';
import Header from '../components/layout/Header';
import RequestBuilder from '../components/features/builder/RequestBuilder';
import ResponsePanel from '../components/features/builder/ResponsePanel';
import TabBar from '../components/layout/TabBar';
import { PlusCircle, Zap, Code2, Info, MessageSquare, ChevronRight } from 'lucide-react';
import CodeSnippetPanel from '../components/features/builder/CodeSnippetPanel';

const Home = () => {
    const { showToast, setIsEnvModalOpen } = useOutletContext();
    const {
        activeRequest,
        setActiveRequest,
        response,
        isLoading,
        executeRequest,
        tabs,
        activeTabId,
        addTab,
        environments,
        activeEnvironment,
        setActiveEnvironment,
        collections,
        createCollection,
        saveRequest
    } = useStore();

    const [responsePanelWidth, setResponsePanelWidth] = useState(500); // Default width 500px
    const [isResizing, setIsResizing] = useState(false);
    const [activeRightTab, setActiveRightTab] = useState(null); // 'snippet', 'info', 'comments'
    const startX = useRef(0);
    const startWidth = useRef(0);

    const startResizing = (e) => {
        setIsResizing(true);
        startX.current = e.clientX;
        startWidth.current = responsePanelWidth;
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const delta = startX.current - e.clientX;
            const newWidth = startWidth.current + delta;
            if (newWidth > 300 && newWidth < window.innerWidth - 400) {
                setResponsePanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
    }, [isResizing]);

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
        await saveRequest(collectionId, activeRequest);
        showToast('Đã lưu thay đổi!');
    };

    const handleSend = async () => {
        await executeRequest();
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-dark-950">
            <Header
                activeRequest={activeRequest}
                setActiveRequest={setActiveRequest}
                activeEnvironment={activeEnvironment}
                setActiveEnvironment={setActiveEnvironment}
                environments={environments}
                handleSave={handleSave}
                setIsEnvModalOpen={setIsEnvModalOpen}
            />
            
            <TabBar />

            {tabs.length > 0 && activeTabId ? (
                <div className="flex-1 flex overflow-hidden min-h-0 relative">
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                        <RequestBuilder handleSend={handleSend} />
                    </div>

                    <div 
                        className={`group w-2 cursor-col-resize flex items-center justify-center flex-shrink-0 z-10 relative`}
                        onMouseDown={startResizing}
                    >
                        <div className={`h-12 w-1 rounded-full transition-all ${isResizing ? 'bg-primary-500 h-24' : 'bg-dark-700 group-hover:bg-primary-500/50 group-hover:h-16'}`} />
                        <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
                    </div>

                    <div 
                        className="flex-shrink-0 bg-dark-950 border-l border-dark-800 flex flex-col h-full overflow-hidden"
                        style={{ width: `${responsePanelWidth}px` }}
                    >
                        <ResponsePanel response={response} isLoading={isLoading} />
                    </div>

                    {/* Right Utility Bar */}
                    <div className="w-12 bg-dark-900 border-l border-dark-800 flex flex-col items-center py-4 gap-4 z-20">
                        <button 
                            onClick={() => setActiveRightTab(activeRightTab === 'snippet' ? null : 'snippet')}
                            className={`p-2 rounded-lg transition-all ${activeRightTab === 'snippet' ? 'bg-primary-500 text-white' : 'text-dark-500 hover:text-dark-100 hover:bg-dark-800'}`}
                            title="Code Snippets"
                        >
                            <Code2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setActiveRightTab(activeRightTab === 'info' ? null : 'info')}
                            className={`p-2 rounded-lg transition-all ${activeRightTab === 'info' ? 'bg-primary-500 text-white' : 'text-dark-500 hover:text-dark-100 hover:bg-dark-800'}`}
                            title="Documentation"
                        >
                            <Info className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setActiveRightTab(activeRightTab === 'comments' ? null : 'comments')}
                            className={`p-2 rounded-lg transition-all ${activeRightTab === 'comments' ? 'bg-primary-500 text-white' : 'text-dark-500 hover:text-dark-100 hover:bg-dark-800'}`}
                            title="Comments"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Sliding Right Panels */}
                    {activeRightTab && (
                        <div 
                            className="absolute right-12 top-0 bottom-0 bg-dark-950 border-l border-dark-800 shadow-2xl z-30 animate-slide-in-right"
                            style={{ width: '400px' }}
                        >
                            {activeRightTab === 'snippet' && <CodeSnippetPanel onClose={() => setActiveRightTab(null)} />}
                            {activeRightTab === 'info' && (
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-dark-100 mb-4">Documentation</h3>
                                    <p className="text-sm text-dark-400 italic">Tính năng Documentation đang được phát triển...</p>
                                </div>
                            )}
                            {activeRightTab === 'comments' && (
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-dark-100 mb-4">Comments</h3>
                                    <p className="text-sm text-dark-400 italic">Tính năng Comments đang được phát triển...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 relative overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                        <div className="mb-8 relative">
                            <div className="absolute inset-0 bg-primary-500/20 rounded-3xl blur-2xl animate-pulse" />
                            <div className="relative bg-dark-900 p-6 rounded-3xl border border-dark-800 shadow-2xl">
                                <Zap className="w-16 h-16 text-primary-500 fill-primary-500/10" />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-dark-100 mb-3 tracking-tight">
                            OmniTest <span className="text-primary-500 text-sm align-top ml-1 font-black">PRO</span>
                        </h2>
                        <p className="text-dark-500 text-center max-w-sm mb-10 leading-relaxed font-medium">
                            Công cụ quản lý và kiểm thử API hiện đại. 
                            Hãy chọn một API từ Sidebar hoặc tạo tab mới để bắt đầu.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => addTab()}
                                className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-10 rounded-2xl shadow-2xl shadow-primary-900/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Create New Request
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-dark-600">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                Multi-Tab Support
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                Real-time Sync
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500/50" />
                                Premium Design
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
