import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    collections: [],
    environments: [],
    history: [],
    activeEnvironment: null,
    activeCollection: null,
    tabs: [],
    activeTabId: null,
    examples: [],
    activeRequest: {
        method: 'GET',
        url: '',
        headers: [],
        body: '',
        params: [],
        authConfig: {
            enabled: false,
            loginUrl: '',
            loginBody: '',
            tokenPath: 'data.token'
        },
        preScript: '',
        postScript: '',
        documentation: '',
        description: ''
    },
    response: null,
    isLoading: false,
    toast: { message: '', type: 'success', visible: false },

    showToast: (message, type = 'success') => {
        set({ toast: { message, type, visible: true } });
        setTimeout(() => {
            set({ toast: { ...get().toast, visible: false } });
        }, 3000);
    },

    setAuth: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({ user, token });
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null, environments: [], activeEnvironment: null, collections: [], tabs: [], activeTabId: null });
    },

    exportCollection: (id) => {
        const col = get().collections.find(c => c.id === id);
        if (!col) return;

        // Create a deep copy and clean up sensitive data if needed
        const exportData = {
            version: '1.0.0',
            type: 'collection',
            timestamp: new Date().toISOString(),
            data: col
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${col.name.replace(/\s+/g, '_')}.omnitest.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        get().showToast('Đã xuất Collection thành công!');
    },

    importCollection: async (jsonData) => {
        try {
            const { createCollection, createFolder, saveRequest, showToast, fetchCollections } = get();

            // Support single collection or array of collections
            const collectionsToImport = Array.isArray(jsonData) ? jsonData :
                (jsonData.type === 'collection' ? [jsonData.data] : [jsonData]);

            for (const colData of collectionsToImport) {
                // 1. Create Collection
                const newCol = await createCollection(colData.name);
                if (!newCol || !newCol.id) continue;

                // 2. Import Folders and their requests
                if (colData.folders && colData.folders.length > 0) {
                    for (const folder of colData.folders) {
                        const folderRes = await createFolder(newCol.id, folder.name);
                        // createFolder returns res.data which is { success, data: { id, ... } }
                        const folderId = folderRes?.data?.id;

                        if (folderId && folder.requests && folder.requests.length > 0) {
                            for (const req of folder.requests) {
                                const { id, ...reqData } = req;
                                await saveRequest(newCol.id, { ...reqData, id: null }, folderId);
                            }
                        }
                    }
                }

                // 3. Import Direct Requests (those not in folders)
                const directRequests = colData.requests?.filter(r => !r.folder_id) || colData.filteredDirectRequests || [];
                if (directRequests.length > 0) {
                    for (const req of directRequests) {
                        const { id, ...reqData } = req;
                        await saveRequest(newCol.id, { ...reqData, id: null });
                    }
                }
            }

            await fetchCollections();
            showToast('Import Collection thành công!');
            return true;
        } catch (err) {
            console.error('Import failed', err);
            get().showToast('Import thất bại: ' + err.message, 'danger');
            return false;
        }
    },

    setCollections: (collections) => set({ collections }),
    setActiveCollection: (activeCollection) => set({ activeCollection }),

    setActiveTab: (tabId) => {
        const { tabs } = get();
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
            set({
                activeTabId: tabId,
                activeRequest: tab.request,
                response: tab.response || null
            });
        }
    },

    addTab: (request = null) => {
        const { tabs, activeTabId } = get();

        // Nếu request đã mở trong một tab, switch sang tab đó
        if (request?.id) {
            const existingTab = tabs.find(t => t.request.id === request.id);
            if (existingTab) {
                get().setActiveTab(existingTab.id);
                return;
            }
        }

        const newId = `tab-${Date.now()}`;
        const defaultRequest = {
            method: 'GET',
            url: '',
            headers: [],
            body: '',
            params: [],
            authConfig: { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' },
            preScript: '',
            postScript: '',
            documentation: '',
            description: ''
        };

        const newTab = {
            id: newId,
            name: request?.name || 'New Request',
            request: request ? { ...defaultRequest, ...request } : defaultRequest,
            response: null
        };

        set({
            tabs: [...tabs, newTab],
            activeTabId: newId,
            activeRequest: newTab.request,
            response: null
        });
    },

    closeTab: (tabId) => {
        const { tabs, activeTabId } = get();
        const newTabs = tabs.filter(t => t.id !== tabId);

        if (newTabs.length === 0) {
            set({ tabs: [], activeTabId: null, activeRequest: null, response: null });
            return;
        }

        if (activeTabId === tabId) {
            const lastTab = newTabs[newTabs.length - 1];
            set({
                tabs: newTabs,
                activeTabId: lastTab.id,
                activeRequest: lastTab.request,
                response: lastTab.response || null
            });
        } else {
            set({ tabs: newTabs });
        }
    },

    setActiveRequest: (requestUpdate) => {
        const { activeTabId, tabs, activeRequest } = get();
        let updatedRequest = { ...activeRequest, ...requestUpdate };

        // 1. Nếu URL thay đổi, đồng bộ sang Params
        if (requestUpdate.url !== undefined) {
            const url = requestUpdate.url;
            if (url.includes('?')) {
                const [baseUrl, queryString] = url.split('?');
                const searchParams = new URLSearchParams(queryString);
                const newParams = [];
                searchParams.forEach((value, key) => {
                    newParams.push({ key, value, description: '', enabled: true, required: false });
                });
                // Giữ lại một dòng trống cuối cùng
                newParams.push({ key: '', value: '', description: '', enabled: true, required: false });
                updatedRequest.params = newParams;
            } else {
                // Nếu xóa sạch dấu ?, xóa bảng params (giữ lại 1 dòng trống)
                if ((activeRequest.url || '').includes('?') && !url.includes('?')) {
                    updatedRequest.params = [{ key: '', value: '', description: '', enabled: true, required: false }];
                }
            }
        }
        // 2. Nếu Params thay đổi, đồng bộ ngược lại URL
        else if (requestUpdate.params !== undefined) {
            const params = requestUpdate.params.filter(p => p.enabled && p.key);
            const urlParts = (activeRequest.url || '').split('?');
            const baseUrl = urlParts[0];

            if (params.length > 0) {
                const queryString = params
                    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                    .join('&');
                updatedRequest.url = `${baseUrl}?${queryString}`;
            } else {
                updatedRequest.url = baseUrl;
            }
        }

        const newTabs = tabs.map(t =>
            t.id === activeTabId ? { ...t, request: updatedRequest, name: requestUpdate.name || t.name } : t
        );

        set({
            activeRequest: updatedRequest,
            tabs: newTabs
        });
    },

    setResponse: (response) => {
        const { activeTabId, tabs } = get();
        const newTabs = tabs.map(t =>
            t.id === activeTabId ? { ...t, response } : t
        );
        set({ response, tabs: newTabs });
    },

    setIsLoading: (isLoading) => set({ isLoading }),

    fetchCollections: async () => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            const res = await axios.get(`${API_URL}/collections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const mappedCollections = res.data.data.map(col => {
                // 1. Map all requests first with scripts/auth
                const allRequests = (col.folders || []).flatMap(f => f.requests || [])
                    .concat(col.requests || [])
                    .map(req => ({
                        ...req,
                        preScript: req.preScript || req.pre_script || '',
                        postScript: req.postScript || req.post_script || '',
                        authConfig: req.authConfig || req.auth_config || { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' }
                    }));

                // 2. Build recursive folder tree
                const buildTree = (folders, parentId = null) => {
                    return folders
                        .filter(f => f.parent_id === parentId)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(folder => ({
                            ...folder,
                            requests: allRequests
                                .filter(r => r.folder_id === folder.id)
                                .sort((a, b) => (a.order || 0) - (b.order || 0)),
                            subFolders: buildTree(folders, folder.id)
                        }));
                };

                return {
                    ...col,
                    requests: allRequests
                        .filter(r => !r.folder_id)
                        .sort((a, b) => (a.order || 0) - (b.order || 0)),
                    folders: buildTree(col.folders || [])
                };
            });

            set({
                collections: mappedCollections,
                isLoading: false
            });
        } catch (err) {
            console.error('Failed to fetch collections', err);
        }
    },

    fetchHistory: async (params = {}) => {
        const { token } = get();
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            const res = await axios.get(`${API_URL}/history`, {
                params,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            set({ history: res.data.data });
        } catch (error) {
            console.error('Failed to fetch history', error);
        }
    },

    deleteHistory: async (id) => {
        const { token } = get();
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        try {
            await axios.delete(`${API_URL}/history/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchHistory();
        } catch (err) {
            console.error('Failed to delete history', err);
        }
    },

    createCollection: async (name) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            const res = await axios.post(`${API_URL}/collections`, { name }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Refresh list from server to be sure
            await get().fetchCollections();
            return res.data.data;
        } catch (err) {
            console.error('Failed to create collection', err);
        }
    },

    deleteCollection: async (id) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            await axios.delete(`${API_URL}/collections/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchCollections();
            return true;
        } catch (err) {
            console.error('Failed to delete collection', err);
            return false;
        }
    },

    createFolder: async (collectionId, name, parentId = null) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            const res = await axios.post(`${API_URL}/folders`, {
                collection_id: collectionId,
                name,
                parent_id: parentId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchCollections();
            return res.data;
        } catch (err) {
            console.error('Failed to create folder', err);
        }
    },

    deleteFolder: async (id) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            await axios.delete(`${API_URL}/folders/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchCollections();
        } catch (err) {
            console.error('Failed to delete folder', err);
        }
    },

    saveRequest: async (collectionId, requestData, folderId = null) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            let res;
            const payload = {
                ...requestData,
                collection_id: collectionId,
                folder_id: folderId || requestData.folder_id || null
            };

            console.log('Sending save request payload:', payload);

            if (requestData.id) {
                res = await axios.put(`${API_URL}/requests/${requestData.id}`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                res = await axios.post(`${API_URL}/requests`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            const updatedRequest = {
                ...res.data.data,
                preScript: res.data.data.preScript || res.data.data.pre_script || '',
                postScript: res.data.data.postScript || res.data.data.post_script || '',
                authConfig: res.data.data.authConfig || res.data.data.auth_config || { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' }
            };

            // Sync tabs and activeRequest
            const { activeTabId, tabs } = get();
            const newTabs = tabs.map(t =>
                t.id === activeTabId ? { ...t, request: updatedRequest } : t
            );

            set({
                activeRequest: updatedRequest,
                tabs: newTabs
            });

            await get().fetchCollections();
            return updatedRequest;
        } catch (err) {
            console.error('Failed to save request', err);
            throw err;
        }
    },

    moveRequest: async (requestId, targetCollectionId, targetFolderId = null) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            await axios.put(`${API_URL}/requests/${requestId}`, {
                collection_id: targetCollectionId,
                folder_id: targetFolderId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchCollections();
            return true;
        } catch (err) {
            console.error('Failed to move request', err);
            return false;
        }
    },

    reorderRequests: async (items) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            await axios.put(`${API_URL}/requests/reorder`, { items }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchCollections();
        } catch (err) {
            console.error('Failed to reorder requests', err);
        }
    },

    reorderFolders: async (items) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            await axios.put(`${API_URL}/folders/reorder`, { items }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchCollections();
        } catch (err) {
            console.error('Failed to reorder folders', err);
        }
    },

    deleteRequest: async (id) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            await axios.delete(`${API_URL}/requests/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchCollections();
            return true;
        } catch (err) {
            console.error('Failed to delete request', err);
            return false;
        }
    },

    duplicateRequest: async (requestId) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            // 1. Tìm source request trong collections và folders
            let sourceReq = null;
            get().collections.forEach(col => {
                // Tìm trong requests trực tiếp của collection
                const foundInCol = col.requests?.find(r => r.id === requestId);
                if (foundInCol) sourceReq = foundInCol;

                // Tìm trong các folders
                if (!sourceReq) {
                    col.folders?.forEach(f => {
                        const foundInFolder = f.requests?.find(r => r.id === requestId);
                        if (foundInFolder) sourceReq = foundInFolder;
                    });
                }
            });

            if (!sourceReq) return;

            // 2. Tạo request mới với dữ liệu tương tự
            const payload = {
                collection_id: sourceReq.collection_id,
                folder_id: sourceReq.folder_id,
                name: `${sourceReq.name} (Copy)`,
                method: sourceReq.method,
                url: sourceReq.url,
                headers: sourceReq.headers,
                params: sourceReq.params,
                body: sourceReq.body,
                description: sourceReq.description,
                documentation: sourceReq.documentation,
                authConfig: sourceReq.authConfig,
                preScript: sourceReq.preScript,
                postScript: sourceReq.postScript
            };

            await axios.post(`${API_URL}/requests`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await get().fetchCollections();
            get().showToast(`Đã nhân bản API "${sourceReq.name}"`);
            return true;
        } catch (err) {
            console.error('Failed to duplicate request', err);
            get().showToast('Nhân bản API thất bại', 'danger');
        }
    },

    fetchEnvironments: async () => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            const res = await axios.get(`${API_URL}/environments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            set({ environments: res.data.data });
            if (res.data.data.length > 0 && !get().activeEnvironment) {
                set({ activeEnvironment: res.data.data[0] });
            }
        } catch (err) {
            console.error('Failed to fetch environments', err);
        }
    },

    setActiveEnvironment: (activeEnvironment) => set({ activeEnvironment }),

    saveEnvironment: async (envData) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            let res;
            if (envData.id) {
                res = await axios.put(`${API_URL}/environments/${envData.id}`, envData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                res = await axios.post(`${API_URL}/environments`, envData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            await get().fetchEnvironments();
            return res.data.data;
        } catch (err) {
            console.error('Failed to save environment', err);
        }
    },

    deleteEnvironment: async (id) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        const token = get().token;
        try {
            await axios.delete(`${API_URL}/environments/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchEnvironments();
        } catch (err) {
            console.error('Failed to delete environment', err);
        }
    },

    fetchExamples: async (requestId) => {
        const { token } = get();
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        try {
            const res = await axios.get(`${API_URL}/examples/request/${requestId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            set({ examples: res.data.data });
        } catch (err) {
            console.error('Failed to fetch examples', err);
        }
    },

    saveExample: async (data) => {
        const { token, fetchExamples, fetchCollections } = get();
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        try {
            await axios.post(`${API_URL}/examples`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchExamples(data.request_id);
            await fetchCollections(); // Sync sidebar
            return true;
        } catch (err) {
            console.error('Failed to save example', err);
            return false;
        }
    },

    updateExample: async (id, data) => {
        const { token, activeRequest, fetchExamples, fetchCollections } = get();
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        try {
            await axios.put(`${API_URL}/examples/${id}`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (activeRequest?.id) await fetchExamples(activeRequest.id);
            await fetchCollections(); // Sync sidebar
            return true;
        } catch (err) {
            console.error('Failed to update example', err);
            return false;
        }
    },

    deleteExample: async (id) => {
        const { token, activeRequest, fetchExamples, fetchCollections } = get();
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        try {
            await axios.delete(`${API_URL}/examples/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (activeRequest?.id) await fetchExamples(activeRequest.id);
            await fetchCollections(); // Sync sidebar
            return true;
        } catch (err) {
            console.error('Failed to delete example', err);
            return false;
        }
    },

    loadExample: (ex) => {
        const { setActiveRequest, setResponse } = get();
        const updatedRequest = {
            ...ex,
            params: Array.isArray(ex.params) ? ex.params : [],
            headers: Array.isArray(ex.headers) ? ex.headers : [],
            assertions: Array.isArray(ex.assertions) ? ex.assertions : []
        };
        setActiveRequest(updatedRequest);
        // Đảm bảo response body được parse nếu là chuỗi (đề phòng double-stringify)
        let parsedBody = ex.response_body;
        while (typeof parsedBody === 'string') {
            try {
                const next = JSON.parse(parsedBody);
                if (typeof next === 'string' && next !== parsedBody) {
                    parsedBody = next;
                } else {
                    parsedBody = next;
                    break;
                }
            } catch (e) {
                break;
            }
        }

        setResponse({
            statusCode: ex.response_status,
            statusText: ex.response_status === 200 ? 'OK' : 'Response Log',
            body: parsedBody,
            headers: ex.response_headers || {},
            responseTime: ex.response_time || 0
        });
    },

    addHeader: () => {
        const { activeRequest, setActiveRequest } = get();
        setActiveRequest({
            headers: [...activeRequest.headers, { key: '', value: '', description: '', enabled: true, required: false }]
        });
    },

    updateHeader: (index, field, value) => {
        const { activeRequest, setActiveRequest } = get();
        const headers = [...activeRequest.headers];
        headers[index][field] = value;
        setActiveRequest({ headers });
    },

    removeHeader: (index) => {
        const { activeRequest, setActiveRequest } = get();
        setActiveRequest({
            headers: activeRequest.headers.filter((_, i) => i !== index)
        });
    },

    bulkUpdateHeaders: (text) => {
        const { setActiveRequest } = get();
        const headers = text.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [key, ...valueParts] = line.split(':');
                return {
                    key: key.trim(),
                    value: valueParts.join(':').trim(),
                    description: '',
                    enabled: true,
                    required: false
                };
            });
        setActiveRequest({ headers: headers.length > 0 ? headers : [{ key: '', value: '', description: '', enabled: true, required: false }] });
    },

    addParam: () => {
        const { activeRequest, setActiveRequest } = get();
        setActiveRequest({
            params: [...activeRequest.params, { key: '', value: '', description: '', enabled: true, required: false }]
        });
    },

    updateParam: (index, field, value) => {
        const { activeRequest, setActiveRequest } = get();
        const params = [...activeRequest.params];
        params[index][field] = value;
        setActiveRequest({ params });
    },

    removeParam: (index) => {
        const { activeRequest, setActiveRequest } = get();
        setActiveRequest({
            params: activeRequest.params.filter((_, i) => i !== index)
        });
    },

    bulkUpdateParams: (text) => {
        const { setActiveRequest } = get();
        const params = text.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [key, ...valueParts] = line.split(':');
                return {
                    key: key.trim(),
                    value: valueParts.join(':').trim(),
                    description: '',
                    enabled: true,
                    required: false
                };
            });
        setActiveRequest({ params: params.length > 0 ? params : [{ key: '', value: '', description: '', enabled: true, required: false }] });
    },

    executeRequest: async () => {
        const { activeRequest, activeEnvironment, token, setResponse, setIsLoading } = get();
        setIsLoading(true);
        try {
            const headersObj = activeRequest.headers
                .filter(h => h.enabled && h.key)
                .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

            const paramsObj = activeRequest.params
                .filter(p => p.enabled && p.key)
                .reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {});

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            const variables = activeEnvironment?.variables || {};

            // Tách baseUrl để tránh lặp params khi axios tự append paramsObj
            const baseUrl = activeRequest.url.split('?')[0];

            const res = await axios.post(`${API_URL}/proxy/execute`, {
                method: activeRequest.method,
                url: baseUrl,
                headers: headersObj,
                params: paramsObj,
                body: activeRequest.body ? JSON.parse(activeRequest.body) : undefined,
                variables: variables,
                authConfig: activeRequest.authConfig,
                preScript: activeRequest.preScript,
                postScript: activeRequest.postScript
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = res.data.data;
            setResponse(result);

            // In logs từ script ra console trình duyệt để user dễ soi
            if (result.scriptLogs && result.scriptLogs.length > 0) {
                console.group('%c [OmniScript Console] ', 'background: #0174be; color: #fff; border-radius: 4px; padding: 2px;');
                result.scriptLogs.forEach(log => console.log(log));
                console.groupEnd();
            }

            // Nếu script có cập nhật biến môi trường
            if (result.variables && activeEnvironment) {
                console.log('[Debug] Script updated variables:', result.variables);
                const updatedEnv = {
                    ...activeEnvironment,
                    variables: { ...activeEnvironment.variables, ...result.variables }
                };
                set({
                    activeEnvironment: updatedEnv,
                    environments: get().environments.map(e => e.id === updatedEnv.id ? updatedEnv : e)
                });

                // Lưu vào DB để persist - Chỉ gửi những trường cần thiết
                try {
                    const saveRes = await get().saveEnvironment({
                        id: updatedEnv.id,
                        name: updatedEnv.name,
                        variables: updatedEnv.variables
                    });
                    if (saveRes) {
                        console.log('[Debug] Environment saved successfully to DB');
                    } else {
                        console.warn('[Debug] Environment save returned null/false');
                    }
                } catch (saveErr) {
                    console.error('[Debug] Failed to save environment to DB:', saveErr);
                }
            }

            return { success: true, data: result };
        } catch (error) {
            const errorRes = {
                statusCode: 500,
                statusText: 'Internal Error',
                body: { error: error.message },
                responseTime: 0,
                headers: {}
            };
            setResponse(errorRes);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }
}));

export default useStore;
