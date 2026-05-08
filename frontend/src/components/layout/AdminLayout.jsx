import React from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Library, 
    Settings, 
    ArrowLeft, 
    ShieldCheck,
    ChevronRight,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import useStore from '../../store/useStore';

const AdminLayout = () => {
    const location = useLocation();
    const { user, logout } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Kiểm tra quyền admin (Bảo vệ phía FE)
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Thống kê' },
        { path: '/admin/users', icon: Users, label: 'Người dùng' },
        { path: '/admin/collections', icon: Library, label: 'Bộ sưu tập' },
        { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
    ];

    return (
        <div className="flex h-screen bg-dark-950 text-dark-100 font-sans overflow-hidden">
            {/* Sidebar cho Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-dark-900 border-r border-dark-800 shadow-xl z-30">
                <div className="p-6 border-b border-dark-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Admin</h1>
                            <p className="text-[10px] text-dark-400 uppercase tracking-widest font-bold">OmniTest Center</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                                    : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-dark-500 group-hover:text-indigo-400'}`} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto space-y-2 border-t border-dark-800">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-indigo-400 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Quay lại Tool</span>
                    </Link>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    <span className="font-bold">Admin Panel</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="hidden md:flex h-16 bg-dark-900/50 backdrop-blur-md border-b border-dark-800 items-center justify-between px-8 z-20">
                    <div className="text-sm text-dark-400">
                        Admin / <span className="text-dark-100 font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-dark-100">{user.username}</span>
                            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">Super Admin</span>
                        </div>
                        <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-500 font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-dark-950">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-dark-950 z-50 pt-16">
                    <nav className="p-6 space-y-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 text-xl font-bold p-4 rounded-2xl bg-dark-900 border border-dark-800"
                            >
                                <item.icon className="w-6 h-6 text-indigo-500" />
                                {item.label}
                            </Link>
                        ))}
                        <button 
                            onClick={logout}
                            className="w-full flex items-center gap-4 text-xl font-bold p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"
                        >
                            <LogOut className="w-6 h-6" />
                            Đăng xuất
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
