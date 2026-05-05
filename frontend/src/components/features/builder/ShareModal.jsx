import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Globe, Copy, Trash2, Shield, Mail, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import useStore from '../../../store/useStore';
import axios from 'axios';

const ShareModal = ({ isOpen, onClose, collection }) => {
  const [activeTab, setActiveTab] = useState('internal');
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('viewer');
  const [shares, setShares] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { showToast } = useStore();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';

  useEffect(() => {
    if (isOpen && collection) {
      fetchShares();
    }
  }, [isOpen, collection]);

  const fetchShares = async () => {
    try {
      const response = await axios.get(`${API_URL}/shares/${collection.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setShares(response.data.data);
      }
    } catch (error) {
      console.error('Fetch shares error:', error);
    }
  };

  const handleShareInternal = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/shares`, {
        collectionId: collection.id,
        targetEmail: email,
        permission,
        type: 'internal'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        showToast(`Đã chia sẻ cho ${email}`);
        setEmail('');
        fetchShares();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi chia sẻ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    const publicShare = shares.find(s => s.type === 'public');
    
    if (publicShare) {
      // Disable public sharing
      try {
        await axios.delete(`${API_URL}/shares/${publicShare.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showToast('Đã tắt link công khai');
        fetchShares();
      } catch (error) {
        showToast('Lỗi khi tắt link công khai', 'error');
      }
    } else {
      // Enable public sharing
      setIsLoading(true);
      try {
        await axios.post(`${API_URL}/shares`, {
          collectionId: collection.id,
          type: 'public',
          permission: 'viewer'
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showToast('Đã bật link công khai');
        fetchShares();
      } catch (error) {
        showToast('Lỗi khi bật link công khai', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteShare = async (id) => {
    try {
      await axios.delete(`${API_URL}/shares/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('Đã gỡ quyền truy cập');
      fetchShares();
    } catch (error) {
      showToast('Lỗi khi gỡ quyền', 'error');
    }
  };

  const copyPublicLink = () => {
    const publicShare = shares.find(s => s.type === 'public');
    if (!publicShare) return;

    const link = `${window.location.origin}/public/${publicShare.share_token}`;
    navigator.clipboard.writeText(link);
    setIsCopying(true);
    showToast('Đã sao chép link công khai');
    setTimeout(() => setIsCopying(false), 2000);
  };

  if (!isOpen) return null;

  const publicShare = shares.find(s => s.type === 'public');
  const internalShares = shares.filter(s => s.type === 'internal');

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-dark-800 flex items-center justify-between bg-dark-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-xl">
              <UserPlus className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark-100">Chia sẻ Collection</h3>
              <p className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">{collection?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-full text-dark-500 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-800">
          <button 
            onClick={() => setActiveTab('internal')}
            className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'internal' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-500 hover:text-dark-300'}`}
          >
            Chia sẻ nội bộ
          </button>
          <button 
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'public' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-500 hover:text-dark-300'}`}
          >
            Link công khai
          </button>
        </div>

        {/* Content */}
        <div className="p-8 h-[400px] overflow-y-auto">
          {activeTab === 'internal' ? (
            <div className="space-y-6">
              <form onSubmit={handleShareInternal} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-dark-500 tracking-widest ml-1">Email người nhận</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 group-focus-within:text-primary-500 transition-colors" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full bg-dark-800/50 border border-dark-700 rounded-xl pl-11 pr-4 py-3 text-sm text-dark-100 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all shadow-inner"
                      />
                    </div>
                    <select 
                      value={permission}
                      onChange={(e) => setPermission(e.target.value)}
                      className="bg-dark-800/50 border border-dark-700 rounded-xl px-4 py-3 text-sm text-dark-200 outline-none focus:border-primary-500/50 transition-all cursor-pointer"
                    >
                      <option value="viewer">Chỉ xem</option>
                      <option value="editor">Có thể sửa</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-900/20 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi lời mời'}
                </button>
              </form>

              <div className="space-y-4 pt-4">
                <h4 className="text-[10px] uppercase font-black text-dark-500 tracking-widest ml-1">Người đã được chia sẻ</h4>
                {internalShares.length > 0 ? (
                  <div className="space-y-2">
                    {internalShares.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-xl border border-dark-800/50 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-[10px] font-bold text-dark-300">
                            {s.target_email.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-dark-100">{s.target_email}</span>
                            <span className="text-[10px] text-dark-500 font-medium uppercase">{s.permission === 'editor' ? 'Biên tập viên' : 'Người xem'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteShare(s.id)}
                          className="p-2 hover:bg-red-500/10 text-dark-600 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-dark-800/10 rounded-2xl border border-dashed border-dark-800">
                    <p className="text-xs text-dark-600 italic">Chưa có ai được chia sẻ.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between p-6 bg-dark-800/30 rounded-3xl border border-dark-800/50">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${publicShare ? 'bg-green-500/10 text-green-500' : 'bg-dark-700 text-dark-500'}`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-dark-100">Chia sẻ công khai</span>
                    <span className="text-xs text-dark-500 font-medium">Bất kỳ ai có link đều có thể xem tài liệu</span>
                  </div>
                </div>
                <div 
                  onClick={handleTogglePublic}
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${publicShare ? 'bg-primary-600' : 'bg-dark-700'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${publicShare ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              {publicShare && (
                <div className="space-y-4 animate-fade-in">
                  <label className="text-[10px] uppercase font-black text-dark-500 tracking-widest ml-1">Đường dẫn công khai</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-dark-800/50 border border-dark-700 rounded-xl px-4 py-3 text-xs text-dark-300 truncate font-mono">
                      {window.location.origin}/public/{publicShare.share_token}
                    </div>
                    <button 
                      onClick={copyPublicLink}
                      className={`px-4 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 ${isCopying ? 'bg-green-500/10 text-green-500' : 'bg-dark-700 hover:bg-dark-600 text-dark-200'}`}
                    >
                      {isCopying ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="text-sm">{isCopying ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-2xl flex gap-3">
                    <Shield className="w-5 h-5 text-primary-500 shrink-0" />
                    <p className="text-[11px] text-dark-400 leading-relaxed">
                      Lưu ý: Link công khai cho phép người khác xem toàn bộ API và Examples nhưng <strong className="text-primary-400">không thể sửa đổi</strong> hoặc xem các môi trường (Environments) bảo mật của bạn.
                    </p>
                  </div>
                </div>
              )}

              {!publicShare && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-dark-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-800">
                    <LinkIcon className="w-8 h-8 text-dark-600" />
                  </div>
                  <p className="text-sm text-dark-500">Bật tính năng chia sẻ để nhận link tài liệu API.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-dark-900/50 border-t border-dark-800">
          <button 
            onClick={onClose}
            className="w-full px-6 py-3.5 rounded-xl border border-dark-700 text-dark-300 font-bold hover:bg-dark-800 transition-all active:scale-95 text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
