import React from 'react';
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
        <>
            <Header
                activeRequest={activeRequest}
                setActiveRequest={setActiveRequest}
                activeEnvironment={activeEnvironment}
                setActiveEnvironment={setActiveEnvironment}
                environments={environments}
                handleSave={handleSave}
            />
            <div className="flex-1 flex overflow-hidden">
                <RequestBuilder handleSend={handleSend} />
                <ResponsePanel response={response} />
            </div>
        </>
    );
};

export default Home;
