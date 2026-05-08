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

import PublicViewPage from './pages/PublicViewPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminCollectionPage from './pages/admin/AdminCollectionPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

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

    return (
        <Router>
            <Routes>
                {/* Public documentation route - No Auth */}
                <Route path="/public/:token" element={<PublicViewPage />} />

                {/* Login Route */}
                <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />

                {/* Protected App Routes */}
                <Route element={token ? <MainLayout /> : <Navigate to="/login" />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/performance" element={<LoadTest />} />
                    <Route path="/scenarios/:id" element={<ScenarioPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={token ? <AdminLayout /> : <Navigate to="/login" />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<AdminUserPage />} />
                    <Route path="collections" element={<AdminCollectionPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
