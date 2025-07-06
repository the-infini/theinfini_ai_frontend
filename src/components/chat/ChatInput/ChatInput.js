import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import ModelSelector from '../ModelSelector/ModelSelector';
import FileAttachment from '../FileAttachment/FileAttachment';
import './ChatInput.css';

const ChatInput = forwardRef(({ onSendMessage, onSendMessageWithFile, disabled = false, isLoading = false }, ref) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileAttachmentRef = useRef(null);
  const maxLength = 3000;

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handleFileSelect: (file) => {
      setSelectedFile(file);
      // Also trigger the FileAttachment component's file selection
      if (fileAttachmentRef.current && fileAttachmentRef.current.handleExternalFileSelect) {
        fileAttachmentRef.current.handleExternalFileSelect(file);
      }
    }
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Allow sending if there's either a message or a file attachment
    const hasContent = (message.trim() && message.length <= maxLength) || selectedFile;

    if (hasContent && !disabled && !isLoading) {
      if (selectedFile && onSendMessageWithFile) {
        // Send with file attachment (message can be empty)
        onSendMessageWithFile(message.trim() || '', selectedFile);
      } else if (message.trim()) {
        // Send text-only message
        onSendMessage(message.trim());
      }
      setMessage('');
      setSelectedFile(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleModelSelect = (modelId) => {
    console.log('Model selected:', modelId);
  };

  return (
    <div className="chat-input">
      <form onSubmit={handleSubmit} className="chat-input__form">
        <div className="chat-input__container">
          <div className="chat-input__field-wrapper">
            <textarea
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? "Generating response..." : "What do you want to know?"}
              className="chat-input__field"
              rows="1"
              maxLength={maxLength}
              disabled={disabled || isLoading}
            />
          </div>

          <button
            type="submit"
            className="chat-input__send"
            disabled={(!message.trim() && !selectedFile) || message.length > maxLength || disabled || isLoading}
          >
            {isLoading ? (
              <div className="chat-input__loading-spinner"></div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        <div className="chat-input__actions">
          <FileAttachment
            ref={fileAttachmentRef}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            disabled={disabled || isLoading}
          />

          <div className="chat-input__model-selector">
            <ModelSelector
              onModelSelect={handleModelSelect}
              disabled={disabled || isLoading}
            />
          </div>
        </div>
      </form>
    </div>
  );
});

export default ChatInput;
