import React, { useEffect } from 'react';
import axios from 'axios';
import useStore from './store/useStore';
import Login from './pages/Login';
import Home from './pages/Home';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import History from './pages/History';
import LoadTest from './pages/LoadTest';
import ScenarioPage from './pages/ScenarioPage';

function App() {
    const { token, logout } = useStore();

    useEffect(() => {
        if (token) {
            const init = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                    await axios.get(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
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

    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/performance" element={<LoadTest />} />
                    <Route path="/scenarios/:id" element={<ScenarioPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
