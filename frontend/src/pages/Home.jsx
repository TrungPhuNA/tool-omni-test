import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import useStore from '../store/useStore';
import Header from '../components/layout/Header';
import RequestBuilder from '../components/features/builder/RequestBuilder';
import ResponsePanel from '../components/features/builder/ResponsePanel';

const Home = () => {
    const { showToast } = useOutletContext();
    const {
        collections,
        createCollection,
        saveRequest,
        environments,
        activeEnvironment,
        setActiveEnvironment,
        activeRequest,
        setActiveRequest,
        response,
        executeRequest
    } = useStore();

    const [responsePanelWidth, setResponsePanelWidth] = useState(500); // Default width 500px
    const [isResizing, setIsResizing] = useState(false);
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
        <div className="flex flex-col h-full overflow-hidden">
            <Header
                activeRequest={activeRequest}
                setActiveRequest={setActiveRequest}
                activeEnvironment={activeEnvironment}
                setActiveEnvironment={setActiveEnvironment}
                environments={environments}
                handleSave={handleSave}
            />
            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 overflow-hidden">
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
                    className="flex-shrink-0 bg-dark-950 border-l border-dark-800 overflow-hidden"
                    style={{ width: `${responsePanelWidth}px` }}
                >
                    <ResponsePanel response={response} />
                </div>
            </div>
        </div>
    );
};

export default Home;
