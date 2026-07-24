import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          let bgColor = 'bg-white border-emerald-100 shadow-emerald-500/5';
          let textColor = 'text-slate-800';
          let iconColor = 'text-emerald-500';
          let icon = 'check_circle';

          if (toast.type === 'error') {
            bgColor = 'bg-white border-rose-100 shadow-rose-500/5';
            iconColor = 'text-rose-500';
            icon = 'error';
          } else if (toast.type === 'info') {
            bgColor = 'bg-white border-blue-100 shadow-blue-500/5';
            iconColor = 'text-blue-500';
            icon = 'info';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border shadow-xl transition-all duration-300 animate-slide-in-right ${bgColor} ${textColor}`}
              style={{
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${iconColor}`} style={{ fontSize: '20px' }}>
                  {icon}
                </span>
                <span className="text-sm font-semibold tracking-tight">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  close
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
