import React, { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown, Code2 } from 'lucide-react';
import useStore from '../../../store/useStore';

const CodeSnippetPanel = ({ onClose }) => {
  const { activeRequest, activeEnvironment } = useStore();
  const [selectedLang, setSelectedLang] = useState('curl');
  const [copied, setCopied] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const resolveVariables = (text) => {
    if (!text || typeof text !== 'string') return text;
    if (!activeEnvironment || !activeEnvironment.variables) return text;
    
    let resolvedText = text;
    Object.entries(activeEnvironment.variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      resolvedText = resolvedText.replace(regex, value);
    });
    return resolvedText;
  };

  const languages = [
    { id: 'curl', name: 'cURL' },
    { id: 'fetch', name: 'JavaScript - Fetch' },
    { id: 'axios', name: 'JavaScript - Axios' },
    { id: 'python', name: 'Python - Requests' }
  ];

  const generateSnippet = () => {
    const { method, url, headers, body, params } = activeRequest;
    
    // Resolve variables in base parts
    // URL already contains params due to sync logic in useStore.js
    const fullUrl = resolveVariables(url || 'https://api.example.com');
    const resolvedBody = resolveVariables(body);
    
    const enabledHeaders = headers?.filter(h => h.enabled && h.key) || [];
    const hasJsonBody = resolvedBody && method !== 'GET';
    
    // Ensure Content-Type is present if there is a body
    let finalHeaders = [...enabledHeaders];
    if (hasJsonBody && !finalHeaders.find(h => h.key.toLowerCase() === 'content-type')) {
      finalHeaders.push({ key: 'Content-Type', value: 'application/json' });
    }

    // Resolve variables in headers
    const resolvedHeaders = finalHeaders.map(h => ({
      key: resolveVariables(h.key),
      value: resolveVariables(h.value)
    }));

    switch (selectedLang) {
      case 'curl':
        let curl = `curl --location --globoff '${fullUrl}' \\\n--request ${method}`;
        resolvedHeaders.forEach(h => {
          curl += ` \\\n--header '${h.key}: ${h.value}'`;
        });
        if (hasJsonBody) {
          // Use --data-raw for better Postman compatibility
          curl += ` \\\n--data-raw '${resolvedBody.replace(/'/g, "'\\''")}'`;
        }
        return curl;

      case 'fetch':
        let fetchCode = `fetch("${fullUrl}", {\n  method: "${method}",\n`;
        fetchCode += `  headers: {\n`;
        resolvedHeaders.forEach((h, i) => {
          fetchCode += `    "${h.key}": "${h.value}"${i === resolvedHeaders.length - 1 ? '' : ','}\n`;
        });
        fetchCode += `  }${hasJsonBody ? ',' : ''}\n`;
        
        if (hasJsonBody) {
          fetchCode += `  body: JSON.stringify(${resolvedBody})\n`;
        }
        fetchCode += `})\n.then(response => response.json())\n.then(result => console.log(result))\n.catch(error => console.log('error', error));`;
        return fetchCode;

      case 'axios':
        let axiosCode = `const axios = require('axios');\n\nlet config = {\n  method: '${method.toLowerCase()}',\n  url: '${fullUrl}',\n`;
        axiosCode += `  headers: {\n`;
        resolvedHeaders.forEach((h, i) => {
          axiosCode += `    '${h.key}': '${h.value}'${i === resolvedHeaders.length - 1 ? '' : ','}\n`;
        });
        axiosCode += `  }${hasJsonBody ? ',' : ''}\n`;
        
        if (hasJsonBody) {
          axiosCode += `  data: ${resolvedBody}\n`;
        }
        axiosCode += `};\n\naxios(config)\n.then(function (response) {\n  console.log(JSON.stringify(response.data));\n})\n.catch(function (error) {\n  console.log(error);\n});`;
        return axiosCode;

      case 'python':
        let pyCode = `import requests\nimport json\n\nurl = "${fullUrl}"\n\n`;
        if (hasJsonBody) {
          pyCode += `payload = json.dumps(${resolvedBody})\n`;
        } else {
          pyCode += `payload = {}\n`;
        }
        
        pyCode += `headers = {\n`;
        resolvedHeaders.forEach((h, i) => {
          pyCode += `  '${h.key}': '${h.value}'${i === resolvedHeaders.length - 1 ? '' : ','}\n`;
        });
        pyCode += `}\n\nresponse = requests.request("${method}", url, headers=headers, data=payload)\n\nprint(response.text)`;
        return pyCode;

      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-dark-950/80 backdrop-blur-xl animate-slide-in-right border-l border-dark-800 shadow-2xl">
      <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-900/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-500/10 rounded-lg">
            <Code2 className="w-4 h-4 text-primary-500" />
          </div>
          <h3 className="text-sm font-bold text-dark-100 uppercase tracking-widest">Code Snippet</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-dark-800 rounded-lg text-dark-500 hover:text-dark-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        {/* Language Selector Area */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-dark-500 tracking-[0.2em] ml-1">Language</label>
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-sm text-dark-100 hover:border-primary-500/50 transition-all shadow-inner"
            >
              <span className="font-bold">{languages.find(l => l.id === selectedLang)?.name}</span>
              <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-900 border border-dark-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in py-1">
                {languages.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setSelectedLang(lang.id);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all ${selectedLang === lang.id ? 'text-primary-400 bg-primary-500/10 font-bold' : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code Preview Area */}
        <div className="space-y-2 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] uppercase font-black text-dark-500 tracking-[0.2em]">Generated Code</label>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white shadow-lg shadow-primary-900/20'}`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>
          
          <div className="relative flex-1 group min-h-[300px]">
            <pre className="absolute inset-0 p-5 bg-dark-950/50 rounded-2xl border border-dark-800/50 text-[13px] font-mono leading-relaxed text-primary-300 overflow-auto custom-scrollbar shadow-inner">
              <code className="block py-2">{generateSnippet()}</code>
            </pre>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-dark-800 bg-dark-900/20">
        <p className="text-[10px] text-dark-600 text-center font-medium">Snippets are generated based on the current active request state.</p>
      </div>
    </div>
  );
};

const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

export default CodeSnippetPanel;
