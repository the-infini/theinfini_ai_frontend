import React, { useState } from 'react';
import ModelSelector from '../ModelSelector/ModelSelector';
import './ChatInput.css';

const ChatInput = ({ onSendMessage, disabled = false, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const maxLength = 3000;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && message.length <= maxLength && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
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

  const handleAttach = () => {
    // Handle file attachment
    console.log('Attach clicked');
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
            disabled={!message.trim() || message.length > maxLength || disabled || isLoading}
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
          <button
            type="button"
            className="chat-input__action-btn"
            onClick={handleAttach}
            title="Attach"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59722 21.9983 8.005 21.9983C6.41278 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42944 14.0985 2.00867 15.16 2.00867C16.2215 2.00867 17.2394 2.42944 17.99 3.18C18.7406 3.93056 19.1613 4.94844 19.1613 6.00995C19.1613 7.07145 18.7406 8.08933 17.99 8.84L9.41 17.41C9.03494 17.7851 8.52556 17.9961 7.995 17.9961C7.46444 17.9961 6.95506 17.7851 6.58 17.41C6.20494 17.0349 5.99389 16.5256 5.99389 15.995C5.99389 15.4644 6.20494 14.9551 6.58 14.58L14.5 6.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Attach</span>
          </button>

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
};

export default ChatInput;
