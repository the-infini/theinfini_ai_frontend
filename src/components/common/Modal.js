import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  size = 'medium', // small, medium, large
  className = '',
  isLoading = false
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && !isLoading && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal modal--${size} ${className}`}>
        {(title || showCloseButton) && (
          <div className="modal__header">
            {title && <h2 className="modal__title">{title}</h2>}
            {showCloseButton && (
              <button
                className="modal__close-btn"
                onClick={onClose}
                type="button"
                aria-label="Close modal"
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonType = 'danger', // primary, secondary, danger
  isLoading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      className={`confirmation-modal ${isLoading ? 'modal--loading' : ''}`}
      closeOnOverlayClick={!isLoading}
      isLoading={isLoading}
    >
      <div className="confirmation-modal__content">
        <p className="confirmation-modal__message">{message}</p>
        <div className="confirmation-modal__actions">
          <button
            type="button"
            onClick={onClose}
            className="modal-btn modal-btn--secondary"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`modal-btn modal-btn--${confirmButtonType} ${isLoading ? 'modal-btn--loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="modal-btn__loading">
                <div className="modal-btn__spinner"></div>
                Deleting...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
