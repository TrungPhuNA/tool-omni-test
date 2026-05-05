import React, { useState, useEffect } from 'react';
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

    const startResizing = (e) => {
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
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
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
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
                    className={`w-1 hover:w-1.5 transition-all cursor-col-resize bg-dark-800 hover:bg-primary-500/50 flex-shrink-0 z-10 ${isResizing ? 'w-1.5 bg-primary-500/50' : ''}`}
                    onMouseDown={startResizing}
                >
                    <div className="absolute inset-y-0 -ml-1 w-3 cursor-col-resize" />
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
