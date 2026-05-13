import React, { useEffect, useState } from 'react';
import { 
    Search, 
    MoreVertical, 
    Shield, 
    User as UserIcon,
    Mail,
    Calendar,
    Filter,
    ArrowUpDown,
    Check,
    X,
    Lock,
    Unlock
} from 'lucide-react';
import axios from 'axios';
import useStore from '../../store/useStore';
import { TableSkeleton } from '../../components/common/Skeleton';

const AdminUserPage = () => {
    const { token } = useStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            const res = await axios.get(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(res.data.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleUpdateUser = async (userId, data) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            await axios.put(`${API_URL}/admin/users/${userId}`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error('Failed to update user', err);
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-dark-50 tracking-tight">Quản lý Người dùng</h2>
                <p className="text-dark-400 mt-1">Quản lý quyền hạn và trạng thái tài khoản trên hệ thống.</p>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-900/50 p-4 rounded-2xl border border-dark-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full bg-dark-800 border border-dark-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-medium hover:bg-dark-700 transition-all">
                        <Filter className="w-4 h-4" />
                        Lọc
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-medium hover:bg-dark-700 transition-all">
                        <ArrowUpDown className="w-4 h-4" />
                        Sắp xếp
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-dark-900 border border-dark-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[11px] font-black uppercase tracking-widest text-dark-500 bg-dark-950/50">
                                <th className="px-8 py-5">Người dùng</th>
                                <th className="px-8 py-5">Vai trò</th>
                                <th className="px-8 py-5">Trạng thái</th>
                                <th className="px-8 py-5">Ngày tham gia</th>
                                <th className="px-8 py-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-0">
                                        <TableSkeleton rows={8} cols={5} />
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-dark-800/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-500 font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-dark-100">{user.username}</div>
                                                <div className="text-xs text-dark-500 flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'admin' ? (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-500/20 shadow-sm">
                                                    <Shield className="w-3 h-3" /> Admin
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 text-dark-400 text-[10px] font-black uppercase tracking-wider border border-dark-700">
                                                    <UserIcon className="w-3 h-3" /> User
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {user.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                Đã khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-xs text-dark-400">
                                            <Calendar className="w-3.5 h-3.5 text-dark-600" />
                                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            {user.status === 'active' ? (
                                                <button 
                                                    onClick={() => handleUpdateUser(user.id, { status: 'inactive' })}
                                                    className="p-2 hover:bg-red-500/10 rounded-xl text-dark-500 hover:text-red-500 transition-colors"
                                                    title="Khóa tài khoản"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUpdateUser(user.id, { status: 'active' })}
                                                    className="p-2 hover:bg-emerald-500/10 rounded-xl text-dark-500 hover:text-emerald-500 transition-colors"
                                                    title="Mở khóa tài khoản"
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleUpdateUser(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })}
                                                className="p-2 hover:bg-indigo-500/10 rounded-xl text-dark-500 hover:text-indigo-500 transition-colors"
                                                title="Thay đổi quyền"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUserPage;
