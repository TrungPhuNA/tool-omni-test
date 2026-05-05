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
    }
  },
  response: null,
  isLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, environments: [], activeEnvironment: null });
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
      authConfig: { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' }
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

  setActiveRequest: (request) => {
    const { activeTabId, tabs, activeRequest } = get();
    const updatedRequest = { ...activeRequest, ...request };
    
    const newTabs = tabs.map(t => 
      t.id === activeTabId ? { ...t, request: updatedRequest, name: request.name || t.name } : t
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
      set({ collections: res.data.data });
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

  createFolder: async (collectionId, name) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
    const token = get().token;
    try {
      const res = await axios.post(`${API_URL}/folders`, { 
        collection_id: collectionId, 
        name 
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

      if (requestData.id) {
        res = await axios.put(`${API_URL}/requests/${requestData.id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_URL}/requests`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      // Refresh collections to get updated request list
      await get().fetchCollections();
      return res.data.data;
    } catch (err) {
      console.error('Failed to save request', err);
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
      // 1. Tìm source request trong collections có sẵn
      let sourceReq = null;
      get().collections.forEach(col => {
        // Tìm trong requests của collection
        const foundInCol = col.requests?.find(r => r.id === requestId);
        if (foundInCol) sourceReq = foundInCol;
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
        auth_config: sourceReq.auth_config
      };

      await axios.post(`${API_URL}/requests`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      await get().fetchCollections();
      return true;
    } catch (err) {
      console.error('Failed to duplicate request', err);
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
    setActiveRequest({
      method: ex.method,
      url: ex.url,
      headers: ex.headers || [],
      params: ex.params || [],
      body: ex.body || ''
    });
    setResponse({
      statusCode: ex.response_status,
      statusText: ex.response_status === 200 ? 'OK' : 'Response Log',
      body: ex.response_body,
      headers: ex.response_headers || {},
      responseTime: ex.response_time || 0
    });
  },

  addHeader: () => {
    const { activeRequest, setActiveRequest } = get();
    setActiveRequest({
      headers: [...activeRequest.headers, { key: '', value: '', enabled: true }]
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

  addParam: () => {
    const { activeRequest, setActiveRequest } = get();
    setActiveRequest({
      params: [...activeRequest.params, { key: '', value: '', enabled: true }]
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

      const res = await axios.post(`${API_URL}/proxy/execute`, {
        method: activeRequest.method,
        url: activeRequest.url,
        headers: headersObj,
        params: paramsObj,
        body: activeRequest.body ? JSON.parse(activeRequest.body) : undefined,
        variables: variables,
        authConfig: activeRequest.authConfig
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setResponse(res.data.data);
      return { success: true, data: res.data.data };
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
