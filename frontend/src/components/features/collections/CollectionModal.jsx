import React from 'react';
import Modal from '../../common/Modal';

const CollectionModal = ({ isOpen, onClose, newColName, setNewColName, handleCreateCollection }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Tạo Collection mới"
      footer={(
        <>
          <button onClick={onClose} className="btn-secondary py-1.5">Hủy</button>
          <button onClick={handleCreateCollection} className="btn-primary py-1.5">Tạo ngay</button>
        </>
      )}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Tên bộ sưu tập</label>
          <input 
            type="text" 
            autoFocus
            className="input-field" 
            placeholder="VD: Auth Module, Payment API..."
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
          />
        </div>
        <p className="text-xs text-dark-500 leading-relaxed">
          Collection giúp bạn nhóm các API theo dự án hoặc module để dễ dàng quản lý và chạy test kịch bản sau này.
        </p>
      </div>
    </Modal>
  );
};

export default CollectionModal;
