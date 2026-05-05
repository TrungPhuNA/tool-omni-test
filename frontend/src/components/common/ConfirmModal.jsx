import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', type = 'danger' }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
      footer={(
        <>
          <button onClick={onClose} className="btn-secondary py-1.5 px-4">{cancelText}</button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className={`py-1.5 px-4 rounded-lg font-medium transition-all shadow-lg ${
              type === 'danger' 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/20' 
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-900/20'
            }`}
          >
            {confirmText}
          </button>
        </>
      )}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary-500/10 text-primary-500'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1 flex-1">
          <p className="text-sm text-dark-200 leading-relaxed font-medium">
            {message}
          </p>
          <p className="text-xs text-dark-500 leading-relaxed">
            Hành động này không thể hoàn tác. Vui lòng kiểm tra kỹ trước khi xác nhận.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
