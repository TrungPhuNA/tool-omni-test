import React, { useState } from 'react';
import { Globe, Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';
import useStore from '../store/useStore';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useStore((state) => state.setAuth);

  const toggleTab = (login) => {
    setIsLogin(login);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      if (isLogin) {
        setAuth(res.data.data.user, res.data.data.token);
      } else {
        setIsLogin(true);
        setError('Đăng ký thành công! Vui lòng đăng nhập.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-900/50 mb-6 rotate-3">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">OmniTest Tool</h1>
          <p className="text-dark-400 text-sm">Hệ thống kiểm thử API chuyên nghiệp</p>
        </div>

        <div className="glass-card p-8 border-dark-800/50">
          <div className="flex p-1 bg-dark-950 rounded-xl mb-8 gap-1">
            <button 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-dark-800 text-primary-400' : 'text-dark-500 hover:text-dark-300'}`}
              onClick={() => toggleTab(true)}
            >
              Đăng nhập
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-dark-800 text-primary-400' : 'text-dark-500 hover:text-dark-300'}`}
              onClick={() => toggleTab(false)}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="label">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input 
                    type="text" 
                    required 
                    className="input-field pl-10" 
                    placeholder="john_doe"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input 
                  type="email" 
                  required 
                  className="input-field pl-10" 
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input 
                  type="password" 
                  required 
                  className="input-field pl-10" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className={`p-3 rounded-lg text-xs font-medium border ${error.includes('thành công') ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 mt-4 shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Vào hệ thống' : 'Tạo tài khoản'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-dark-600 text-xs">
          Bằng việc đăng nhập, bạn đồng ý với các điều khoản bảo mật của OmniTest.
        </p>
      </div>
    </div>
  );
};

export default Login;
