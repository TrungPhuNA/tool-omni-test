import React, { useEffect } from 'react';
import axios from 'axios';
import useStore from './store/useStore';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
    const { token, logout, fetchCollections, fetchEnvironments } = useStore();

    useEffect(() => {
        if (token) {
            const init = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                    await axios.get(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // Data fetching will be handled in Home.jsx or here
                } catch (err) {
                    logout();
                }
            };
            init();
        }
    }, [token, logout]);

    if (!token) {
        return <Login />;
    }

    return <Home />;
}

export default App;
