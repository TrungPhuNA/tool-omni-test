import React from 'react';
import Modal from '../../common/Modal';

const FolderModal = ({ isOpen, onClose, folderName, setFolderName, handleCreateFolder, parentName }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Tạo Thư mục mới"
      footer={(
        <>
          <button onClick={onClose} className="btn-secondary py-1.5 px-4">Hủy</button>
          <button onClick={handleCreateFolder} className="btn-primary py-1.5 px-4">Tạo ngay</button>
        </>
      )}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Tên thư mục</label>
          <input 
            type="text" 
            autoFocus
            className="input-field" 
            placeholder="VD: Auth, Users, Checkout..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          {parentName && (
            <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 bg-primary-500/10 rounded border border-primary-500/20 w-fit">
               <span className="text-[10px] text-primary-400 font-medium">Thư mục cha:</span>
               <span className="text-[10px] text-primary-200 font-bold">{parentName}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-dark-500 leading-relaxed">
          Thư mục giúp bạn phân loại các API bên trong một Collection một cách khoa học hơn.
        </p>
      </div>
    </Modal>
  );
};

export default FolderModal;
