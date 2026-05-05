import { create } from 'zustand';

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
