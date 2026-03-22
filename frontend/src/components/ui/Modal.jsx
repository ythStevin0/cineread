import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Content */}
          <div
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border"
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;