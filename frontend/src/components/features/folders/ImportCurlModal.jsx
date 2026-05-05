import React, { useState } from 'react';
import Modal from '../../common/Modal';

const ImportCurlModal = ({ isOpen, onClose, onImport }) => {
  const [curlCommand, setCurlCommand] = useState('');

  const handleImport = () => {
    if (!curlCommand) return;

    try {
      const request = parseCurl(curlCommand);
      onImport(request);
      setCurlCommand('');
      onClose();
    } catch (err) {
      alert('Không thể phân tích mã cURL. Vui lòng kiểm tra lại định dạng.');
    }
  };

  const parseCurl = (curl) => {
    const request = {
      method: 'GET',
      url: '',
      headers: [],
      body: ''
    };

    // Phân tích method
    const methodMatch = curl.match(/-X\s+(\w+)/i) || curl.match(/--request\s+(\w+)/i);
    if (methodMatch) request.method = methodMatch[1].toUpperCase();
    else if (curl.includes('--data') || curl.includes('-d')) request.method = 'POST';

    // Phân tích URL (tìm chuỗi trong ngoặc kép hoặc bắt đầu bằng http)
    const urlMatches = curl.match(/'(https?:\/\/[^']+)'/) || curl.match(/"(https?:\/\/[^"]+)"/) || curl.match(/(https?:\/\/[^\s]+)/);
    if (urlMatches) request.url = urlMatches[1];

    // Phân tích Headers
    const headerRegex = /-H\s+'([^']+)'|-H\s+"([^"]+)"|--header\s+'([^']+)'|--header\s+"([^"]+)"/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(curl)) !== null) {
      const headerStr = headerMatch[1] || headerMatch[2] || headerMatch[3] || headerMatch[4];
      const [key, ...valueParts] = headerStr.split(':');
      if (key) {
        request.headers.push({
          id: Date.now() + Math.random(),
          key: key.trim(),
          value: valueParts.join(':').trim(),
          enabled: true
        });
      }
    }

    // Phân tích Body
    const bodyMatch = curl.match(/--data\s+'([^']+)'/) || curl.match(/-d\s+'([^']+)'/) || 
                      curl.match(/--data\s+"([^"]+)"/) || curl.match(/-d\s+"([^"]+)"/) ||
                      curl.match(/--data-raw\s+'([^']+)'/) || curl.match(/--data-raw\s+"([^"]+)"/);
    if (bodyMatch) {
      request.body = bodyMatch[1];
    }

    return request;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Import từ cURL"
      footer={(
        <>
          <button onClick={onClose} className="btn-secondary py-1.5 px-4">Hủy</button>
          <button onClick={handleImport} className="btn-primary py-1.5 px-4">Import ngay</button>
        </>
      )}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Mã cURL</label>
          <textarea 
            autoFocus
            className="input-field min-h-[200px] font-mono text-xs leading-relaxed" 
            placeholder="Dán mã cURL của bạn vào đây (ví dụ từ Chrome DevTools...)"
            value={curlCommand}
            onChange={(e) => setCurlCommand(e.target.value)}
          />
        </div>
        <p className="text-xs text-dark-500 leading-relaxed">
          OmniTest sẽ tự động phân tách URL, Method, Headers và Body từ mã cURL để tạo Request cho bạn.
        </p>
      </div>
    </Modal>
  );
};

export default ImportCurlModal;
