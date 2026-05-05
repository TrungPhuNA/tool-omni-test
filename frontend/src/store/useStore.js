import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  collections: [],
  activeCollection: null,
  activeRequest: {
    method: 'GET',
    url: '',
    headers: [],
    body: '',
    params: []
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
    set({ user: null, token: null });
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

  saveRequest: async (collectionId, requestData) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
    const token = get().token;
    try {
      let res;
      if (requestData.id) {
        res = await axios.put(`${API_URL}/requests/${requestData.id}`, requestData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_URL}/requests`, { ...requestData, collection_id: collectionId }, {
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
}));

export default useStore;
