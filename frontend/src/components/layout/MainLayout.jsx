import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import Sidebar from './Sidebar';
import Toast from '../common/Toast';
import CollectionModal from '../features/collections/CollectionModal';
import FolderModal from '../features/folders/FolderModal';
import EnvironmentModal from '../features/environments/EnvironmentModal';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        collections,
        fetchCollections,
        createCollection,
        environments,
        activeEnvironment,
        fetchEnvironments,
        saveEnvironment,
        deleteEnvironment,
        activeRequest,
        setActiveRequest,
        activeScenario,
        setActiveScenario
    } = useStore();

    const [expandedCollections, setExpandedCollections] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newColName, setNewColName] = useState('');
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [targetColId, setTargetColId] = useState(null);
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

    const handleCreateFolder = async () => {
        if (newFolderName && targetColId) {
            await createFolder(targetColId, newFolderName);
            setNewFolderName('');
            setIsFolderModalOpen(false);
            showToast('Đã tạo thư mục mới!');
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

    const loadRequest = (req) => {
        const headers = typeof req.headers === 'string' ? JSON.parse(req.headers) : (req.headers || []);
        const params = typeof req.params === 'string' ? JSON.parse(req.params) : (req.params || []);
        const body = typeof req.body === 'object' ? JSON.stringify(req.body, null, 2) : (req.body || '');

        setActiveRequest({
            id: req.id,
            collection_id: req.collection_id,
            folder_id: req.folder_id,
            name: req.name,
            method: req.method,
            url: req.url,
            headers: Array.isArray(headers) ? headers : [],
            params: Array.isArray(params) ? params : [],
            body: body,
            authConfig: req.auth_config || { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' }
        });
        navigate('/');
    };

    const loadScenario = (scenario) => {
        setActiveScenario(scenario);
        navigate(`/scenarios/${scenario.id}`);
    };

    // Determine viewMode from location
    const viewMode = location.pathname === '/' ? 'builder' : 
                     location.pathname.startsWith('/scenarios') ? 'scenario' :
                     location.pathname === '/history' ? 'history' :
                     location.pathname === '/performance' ? 'loadtest' : 'builder';

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
                setIsFolderModalOpen={(colId) => {
                    setTargetColId(colId);
                    setIsFolderModalOpen(true);
                }}
                setIsEnvModalOpen={setIsEnvModalOpen}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Outlet context={{ showToast }} />
            </div>

            <CollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                newColName={newColName}
                setNewColName={setNewColName}
                handleCreateCollection={handleCreateCollection}
            />

            <FolderModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                folderName={newFolderName}
                setFolderName={setNewFolderName}
                handleCreateFolder={handleCreateFolder}
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

export default MainLayout;
