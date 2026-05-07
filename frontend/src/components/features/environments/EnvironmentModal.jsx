import React from 'react';
import { Plus, Database, Settings, Trash2 } from 'lucide-react';
import Modal from '../../common/Modal';

const EnvironmentModal = ({ 
  isOpen, 
  onClose, 
  environments, 
  editingEnv, 
  setEditingEnv, 
  handleSaveEnv, 
  deleteEnvironment,
  handleAddEnvVariable,
  handleUpdateEnvVariable,
  handleRemoveEnvVariable
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý Môi trường (Environments)"
      maxWidth="max-w-2xl"
      footer={(
        <button onClick={onClose} className="btn-secondary py-1.5">Đóng</button>
      )}
    >
      <div className="space-y-6">
        {!editingEnv ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Danh sách môi trường</span>
              <button 
                onClick={() => setEditingEnv({ name: '', variables: { 'BASE_URL': '' } })}
                className="text-primary-500 hover:text-primary-400 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo môi trường
              </button>
            </div>
            <div className="grid gap-2">
              {environments.map(env => (
                <div key={env.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary-500/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-dark-200">{env.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setEditingEnv(env)} className="p-2 hover:bg-dark-700 rounded-lg text-dark-400">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteEnvironment(env.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-dark-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {environments.length === 0 && (
                <div className="text-center py-8 text-dark-600 italic text-sm">Chưa có môi trường nào. Hãy tạo mới để dùng biến {'{{variable}}'}.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Tên môi trường</label>
              <input 
                className="input-field" 
                value={editingEnv.name} 
                onChange={(e) => setEditingEnv({...editingEnv, name: e.target.value})}
                placeholder="VD: Staging, Production..."
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Biến (Variables)</span>
                <button onClick={handleAddEnvVariable} className="text-primary-500 text-xs font-bold flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Thêm biến
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(editingEnv.variables || {}).map(([key, value], idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      className="input-field flex-1" 
                      value={key} 
                      placeholder="Key"
                      onChange={(e) => handleUpdateEnvVariable(key, e.target.value, value)}
                    />
                    <input 
                      className="input-field flex-1" 
                      value={value} 
                      placeholder="Value"
                      onChange={(e) => handleUpdateEnvVariable(key, key, e.target.value)}
                    />
                    <button onClick={() => handleRemoveEnvVariable(key)} className="p-2 text-dark-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setEditingEnv(null)} className="btn-secondary py-1.5 px-4 text-xs">Quay lại</button>
              <button onClick={handleSaveEnv} className="btn-primary py-1.5 px-6 text-xs">Lưu thay đổi</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EnvironmentModal;
