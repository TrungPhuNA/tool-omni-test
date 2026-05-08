import React, { useEffect, useState } from 'react';
import { 
    Users, 
    Library, 
    Zap, 
    CheckCircle2, 
    XCircle, 
    Activity,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import axios from 'axios';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell,
    AreaChart,
    Area
} from 'recharts';
import useStore from '../../store/useStore';

const AdminDashboardPage = () => {
    const { token } = useStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                const res = await axios.get(`${API_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStats(res.data.data);
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const { counters, testResults, recentRequests } = stats || {};

    const pieData = [
        { name: 'Thành công', value: testResults?.pass || 0, color: '#10b981' },
        { name: 'Thất bại', value: testResults?.fail || 0, color: '#ef4444' },
    ];

    const cards = [
        { label: 'Người dùng', value: counters?.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Bộ sưu tập', value: counters?.collections, icon: Library, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Thư mục', value: counters?.folders, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Tổng API', value: counters?.requests, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-bold text-dark-50 tracking-tight">Hệ thống Thống kê</h2>
                <p className="text-dark-400 mt-1">Dữ liệu hoạt động của OmniTest trong 30 ngày qua.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-dark-900 border border-dark-800 p-6 rounded-3xl shadow-sm hover:shadow-indigo-900/10 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <span className="flex items-center text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
                                <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
                            </span>
                        </div>
                        <div className="text-3xl font-black text-dark-50 mb-1">{card.value?.toLocaleString()}</div>
                        <div className="text-sm font-medium text-dark-400">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Test Results Chart */}
                <div className="lg:col-span-2 bg-dark-900 border border-dark-800 p-8 rounded-[2rem] shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-dark-100">Kết quả thực thi API</h3>
                            <p className="text-sm text-dark-400">Tỷ lệ thành công trung bình: {((testResults?.pass / testResults?.total) * 100 || 0).toFixed(1)}%</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-dark-300">Pass</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs text-dark-300">Fail</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pieData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Distribution */}
                <div className="bg-dark-900 border border-dark-800 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-dark-100 mb-6 self-start">Tỷ lệ Lỗi</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-3 mt-4">
                        {pieData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-medium text-dark-300">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-dark-100">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Requests Table */}
            <div className="bg-dark-900 border border-dark-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-dark-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-dark-100">API mới nhất</h3>
                        <p className="text-sm text-dark-400">Các request vừa được tạo trên hệ thống.</p>
                    </div>
                    <button className="text-indigo-400 text-sm font-bold hover:underline">Xem tất cả</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[11px] font-black uppercase tracking-widest text-dark-500 bg-dark-950/50">
                                <th className="px-8 py-4">Tên API</th>
                                <th className="px-8 py-4">Method</th>
                                <th className="px-8 py-4">Bộ sưu tập</th>
                                <th className="px-8 py-4">Ngày tạo</th>
                                <th className="px-8 py-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800/50">
                            {recentRequests?.map((req) => (
                                <tr key={req.id} className="hover:bg-dark-800/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-dark-100 group-hover:text-indigo-400 transition-colors">{req.name}</div>
                                        <div className="text-[10px] text-dark-500 truncate max-w-[200px]">{req.url}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                                            req.method === 'GET' ? 'bg-green-500/10 text-green-500' :
                                            req.method === 'POST' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                            {req.method}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-dark-300 font-medium">
                                        {req.collection?.name || 'N/A'}
                                    </td>
                                    <td className="px-8 py-5 text-xs text-dark-500">
                                        {req.created_at ? new Date(req.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center text-green-500 gap-1.5 text-xs font-bold">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Active
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
