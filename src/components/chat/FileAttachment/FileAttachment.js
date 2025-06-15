import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import fileUploadService from '../../../services/fileUploadService';
import './FileAttachment.css';

const FileAttachment = forwardRef(({ onFileSelect, onFileRemove, disabled = false }, ref) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handleExternalFileSelect: (file) => {
      handleFileSelect(file);
    }
  }));

  const handleFileSelect = async (file) => {
    setError(null);

    // Validate file
    const validation = fileUploadService.validateFile(file);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      // Get file preview
      const preview = await fileUploadService.getFilePreview(file);
      
      setSelectedFile(file);
      setFilePreview(preview);
      onFileSelect(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process file');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAttachClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setError(null);
    onFileRemove();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]); // Only handle first file
    }
  };

  const renderFilePreview = () => {
    if (!filePreview) return null;

    return (
      <div className="file-attachment__preview">
        <div className="file-attachment__preview-content">
          {filePreview.type === 'image' ? (
            <img 
              src={filePreview.url} 
              alt={filePreview.name}
              className="file-attachment__preview-image"
            />
          ) : (
            <div className="file-attachment__preview-icon">
              <span className="file-attachment__icon">{filePreview.icon}</span>
            </div>
          )}
          
          <div className="file-attachment__preview-info">
            <div className="file-attachment__preview-name" title={filePreview.name}>
              {filePreview.name}
            </div>
            <div className="file-attachment__preview-size">
              {fileUploadService.formatFileSize(filePreview.size)}
            </div>
          </div>
          
          <button
            type="button"
            className="file-attachment__remove"
            onClick={handleRemoveFile}
            title="Remove file"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="file-attachment">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={fileUploadService.supportedTypes.join(',')}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Attach Button */}
      <button
        type="button"
        className={`file-attachment__button ${selectedFile ? 'file-attachment__button--has-file' : ''}`}
        onClick={handleAttachClick}
        disabled={disabled}
        title="Attach file"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59722 21.9983 8.005 21.9983C6.41278 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42944 14.0985 2.00867 15.16 2.00867C16.2215 2.00867 17.2394 2.42944 17.99 3.18C18.7406 3.93056 19.1613 4.94844 19.1613 6.00995C19.1613 7.07145 18.7406 8.08933 17.99 8.84L9.41 17.41C9.03494 17.7851 8.52556 17.9961 7.995 17.9961C7.46444 17.9961 6.95506 17.7851 6.58 17.41C6.20494 17.0349 5.99389 16.5256 5.99389 15.995C5.99389 15.4644 6.20494 14.9551 6.58 14.58L14.5 6.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Attach</span>
      </button>

      {/* File Preview */}
      {renderFilePreview()}

      {/* Error Display */}
      {error && (
        <div className="file-attachment__error">
          <span className="file-attachment__error-icon">⚠️</span>
          <span className="file-attachment__error-message">{error}</span>
          <button
            type="button"
            className="file-attachment__error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div 
          className="file-attachment__drop-overlay"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-attachment__drop-content">
            <div className="file-attachment__drop-icon">📎</div>
            <div className="file-attachment__drop-text">Drop file here</div>
            <div className="file-attachment__drop-subtext">
              Max 5MB • Images, PDFs, Documents, Text files
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default FileAttachment;
