import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Library, User as UserIcon, Calendar, Zap, Folder, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import Skeleton from '../../components/common/Skeleton';

const AdminCollectionPage = () => {
    const { token } = useStore();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                const res = await axios.get(`${API_URL}/admin/collections`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCollections(res.data.data);
            } catch (err) {
                console.error('Failed to fetch admin collections', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, [token]);


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-dark-50 tracking-tight">Bộ sưu tập Hệ thống</h2>
                <p className="text-dark-400 mt-1">Xem và quản lý tất cả các bộ sưu tập API của người dùng.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-dark-900 border border-dark-800 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton variant="rect" width="48px" height="48px" className="rounded-2xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton variant="text" width="60%" />
                                    <Skeleton variant="text" width="40%" className="opacity-50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton variant="rect" height="60px" className="rounded-2xl" />
                                <Skeleton variant="rect" height="60px" className="rounded-2xl" />
                            </div>
                        </div>
                    ))
                ) : (
                    collections.map((col) => (
                    <div key={col.id} className="bg-dark-900 border border-dark-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                    <Library className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-dark-100">{col.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-dark-500">
                                        <UserIcon className="w-3 h-3" />
                                        <span>Sở hữu bởi: {col.owner?.username || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 text-dark-600 hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-dark-950 p-3 rounded-2xl border border-dark-800/50">
                                <div className="flex items-center gap-2 text-dark-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                                    <Folder className="w-3 h-3" /> Thư mục
                                </div>
                                <div className="text-xl font-black text-dark-200">{col.foldersCount || 0}</div>
                            </div>
                            <div className="bg-dark-950 p-3 rounded-2xl border border-dark-800/50">
                                <div className="flex items-center gap-2 text-dark-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                                    <Zap className="w-3 h-3" /> Requests
                                </div>
                                <div className="text-xl font-black text-dark-200">{col.requestsCount || 0}</div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-dark-800/50 flex items-center justify-between text-[10px] text-dark-500 font-medium">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Created: {col.created_at ? new Date(col.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                            </div>
                            <div className="text-indigo-400 font-bold">
                                View Details →
                            </div>
                        </div>
                    </div>
                )))}
                {!loading && collections.length === 0 && (
                    <div className="col-span-2 py-20 text-center text-dark-500 italic">
                        Không có dữ liệu bộ sưu tập nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCollectionPage;
