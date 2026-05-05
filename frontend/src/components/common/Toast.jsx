import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Toast = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-4 left-1/2 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
            toast.type === 'success' 
              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
