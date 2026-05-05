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
  setActiveRequest: (request) => set({ 
    activeRequest: { ...get().activeRequest, ...request } 
  }),
  setResponse: (response) => set({ response }),
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

  addHeader: () => set((state) => ({
    activeRequest: {
      ...state.activeRequest,
      headers: [...state.activeRequest.headers, { key: '', value: '', enabled: true }]
    }
  })),

  updateHeader: (index, field, value) => set((state) => {
    const headers = [...state.activeRequest.headers];
    headers[index][field] = value;
    return { activeRequest: { ...state.activeRequest, headers } };
  }),

  removeHeader: (index) => set((state) => ({
    activeRequest: {
      ...state.activeRequest,
      headers: state.activeRequest.headers.filter((_, i) => i !== index)
    }
  })),

  addParam: () => set((state) => ({
    activeRequest: {
      ...state.activeRequest,
      params: [...state.activeRequest.params, { key: '', value: '', enabled: true }]
    }
  })),

  updateParam: (index, field, value) => set((state) => {
    const params = [...state.activeRequest.params];
    params[index][field] = value;
    return { activeRequest: { ...state.activeRequest, params } };
  }),

  removeParam: (index) => set((state) => ({
    activeRequest: {
      ...state.activeRequest,
      params: state.activeRequest.params.filter((_, i) => i !== index)
    }
  })),

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
