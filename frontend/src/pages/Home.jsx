import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import RequestBuilder from '../components/features/builder/RequestBuilder';
import ResponsePanel from '../components/features/builder/ResponsePanel';
import ScenarioRunner from '../components/features/scenarios/ScenarioRunner';
import Toast from '../components/common/Toast';
import CollectionModal from '../components/features/collections/CollectionModal';
import EnvironmentModal from '../components/features/environments/EnvironmentModal';

const Home = () => {
    const {
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
        executeRequest
    } = useStore();

    const [expandedCollections, setExpandedCollections] = useState({});
    const [viewMode, setViewMode] = useState('builder'); // 'builder' or 'scenario'
    const [activeScenario, setActiveScenario] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newColName, setNewColName] = useState('');
    const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
    const [editingEnv, setEditingEnv] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchCollections();
        fetchEnvironments();
    }, []);

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
        if (oldKey !== newKey) delete newVars[oldKey];
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
        await saveRequest(collectionId, activeRequest);
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
        const result = await executeRequest();
        if (result.success) {
            showToast('Thực thi request thành công!');
        } else {
            showToast('Gửi request thất bại!', 'error');
        }
    };

    return (
        <div className="flex h-screen bg-dark-950 overflow-hidden text-dark-100 selection:bg-primary-500/30">
            <Toast toast={toast} />

            <Sidebar
                expandedCollections={expandedCollections}
                toggleCollection={toggleCollection}
                loadRequest={loadRequest}
                loadScenario={loadScenario}
                activeRequest={activeRequest}
                activeScenario={activeScenario}
                viewMode={viewMode}
                setIsModalOpen={setIsModalOpen}
                setIsEnvModalOpen={setIsEnvModalOpen}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {viewMode === 'builder' ? (
                    <>
                        <Header
                            activeRequest={activeRequest}
                            setActiveRequest={setActiveRequest}
                            activeEnvironment={activeEnvironment}
                            setActiveEnvironment={setActiveEnvironment}
                            environments={environments}
                            setIsEnvModalOpen={setIsEnvModalOpen}
                            handleSave={handleSave}
                        />
                        <div className="flex-1 flex overflow-hidden">
                            <RequestBuilder handleSend={handleSend} />
                            <ResponsePanel response={response} />
                        </div>
                    </>
                ) : (
                    <ScenarioRunner
                        scenario={activeScenario}
                        collections={collections}
                        activeEnvironment={activeEnvironment}
                        showToast={showToast}
                    />
                )}
            </div>

            <CollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                newColName={newColName}
                setNewColName={setNewColName}
                handleCreateCollection={handleCreateCollection}
            />

            <EnvironmentModal
                isOpen={isEnvModalOpen}
                onClose={() => { setIsEnvModalOpen(false); setEditingEnv(null); }}
                environments={environments}
                editingEnv={editingEnv}
                setEditingEnv={setEditingEnv}
                handleSaveEnv={handleSaveEnv}
                deleteEnvironment={deleteEnvironment}
                handleAddEnvVariable={handleAddEnvVariable}
                handleUpdateEnvVariable={handleUpdateEnvVariable}
                handleRemoveEnvVariable={handleRemoveEnvVariable}
            />
        </div>
    );
};

export default Home;
