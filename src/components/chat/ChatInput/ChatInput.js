import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import ModelSelector from '../ModelSelector/ModelSelector';
import FileAttachment from '../FileAttachment/FileAttachment';
import './ChatInput.css';

const ChatInput = forwardRef(({ onSendMessage, onSendMessageWithFile, disabled = false, isLoading = false }, ref) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
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

  const handleTalk = () => {
    // Handle voice recording
    setIsRecording(!isRecording);
    console.log('Talk clicked');
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

          <button
            type="button"
            className={`chat-input__action-btn ${isRecording ? 'chat-input__action-btn--recording' : ''}`}
            onClick={handleTalk}
            title="Talk"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 10V12C19 16.4183 15.4183 20 11 20H13C17.4183 20 21 16.4183 21 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Talk</span>
          </button>

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
