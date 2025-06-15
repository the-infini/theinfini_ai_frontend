import React, { useState, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useChat } from '../../../contexts/ChatContext';
import ChatInput from '../ChatInput/ChatInput';
import MessageList from '../MessageList/MessageList';
import fileUploadService from '../../../services/fileUploadService';
import './ChatArea.css';

const ChatArea = ({ isSidebarOpen, onToggleSidebar }) => {
  const { user } = useAuth();
  const {
    currentThread,
    currentProject,
    messages,
    isSending,
    isStreaming,
    sendStreamingMessage,
    sendStreamingMessageWithFile,
    error,
    clearError
  } = useChat();

  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState(null);
  const chatInputRef = useRef(null);

  const getUserName = () => {
    if (user?.firstName) {
      return user.firstName;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const defaultPrompts = [
    {
      id: 1,
      icon: '🎵',
      title: 'Create a playlist',
      description: 'Help me create a music playlist for working'
    },
    {
      id: 2,
      icon: '💰',
      title: 'Investment advice',
      description: 'What are some good investment strategies?'
    },
    {
      id: 3,
      icon: '🔍',
      title: 'Research help',
      description: 'Help me research a topic thoroughly'
    },
    {
      id: 4,
      icon: '✍️',
      title: 'Writing assistant',
      description: 'Help me write and improve my content'
    }
  ];

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt.description);
  };

  const handleSendMessage = async (message) => {
    try {
      // Use streaming by default
      await sendStreamingMessage(
        message,
        currentThread?.id,
        currentProject?.id
        // selectedModel will be used automatically from context
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendMessageWithFile = async (message, file) => {
    try {
      // Use streaming with file attachment
      await sendStreamingMessageWithFile(
        message,
        file,
        currentThread?.id,
        currentProject?.id
        // selectedModel will be used automatically from context
      );
    } catch (error) {
      console.error('Failed to send message with file:', error);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isSending && !isStreaming) {
      setIsDragOver(true);
      setDragError(null);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only hide overlay if leaving the chat area entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDragError(null);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragError(null);

    if (isSending || isStreaming) {
      setDragError('Cannot upload file while sending message');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (files.length > 1) {
      setDragError('Please drop only one file at a time');
      return;
    }

    const file = files[0];

    // Validate file
    const validation = fileUploadService.validateFile(file);
    if (!validation.isValid) {
      setDragError(validation.errors.join(', '));
      return;
    }

    // Pass the file to ChatInput component to handle as attachment
    if (chatInputRef.current && chatInputRef.current.handleFileSelect) {
      chatInputRef.current.handleFileSelect(file);
    }
  };

  return (
    <div
      className="chat-area"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="chat-area__header">
        <div className="chat-area__header-left">
          <button
            className="chat-area__hamburger"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="chat-area__title">
            <h1>
              {currentProject ? (
                <>📁 {currentProject.name}</>
              ) : currentThread ? (
                <>💬 {currentThread.name}</>
              ) : (
                'AI Chat'
              )}
            </h1>
            {(currentProject || currentThread) && (
              <span className="chat-area__subtitle">
                {currentProject ? 'Project Chat' : 'Regular Chat'}
              </span>
            )}
          </div>
        </div>
        <button className="chat-area__share">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 12V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="chat-area__content">
        {messages.length === 0 && !currentThread && !currentProject ? (
          <div className="chat-area__welcome">
            <div className="chat-area__greeting">
              <h2>Hey, {getUserName()}! What's up today?</h2>
            </div>

            <div className="chat-area__prompts">
              {defaultPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  className="chat-area__prompt-card"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <div className="chat-area__prompt-icon">{prompt.icon}</div>
                  <div className="chat-area__prompt-content">
                    <div className="chat-area__prompt-title">{prompt.title}</div>
                    <div className="chat-area__prompt-description">{prompt.description}</div>
                  </div>
                  <div className="chat-area__prompt-add">+</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="chat-area__error">
          <div className="chat-area__error-content">
            <span className="chat-area__error-icon">⚠️</span>
            <span className="chat-area__error-message">{error}</span>
            <button
              className="chat-area__error-close"
              onClick={clearError}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="chat-area__input-container">
        <ChatInput
          ref={chatInputRef}
          onSendMessage={handleSendMessage}
          onSendMessageWithFile={handleSendMessageWithFile}
          disabled={isSending || isStreaming}
          isLoading={isSending || isStreaming}
        />
      </div>

      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="chat-area__drag-overlay">
          <div className="chat-area__drag-content">
            <div className="chat-area__drag-icon">📎</div>
            <div className="chat-area__drag-text">Drop file here to attach</div>
            <div className="chat-area__drag-subtext">
              Max 5MB • Images, PDFs, Documents, Text files
            </div>
          </div>
        </div>
      )}

      {/* Drag Error Display */}
      {dragError && (
        <div className="chat-area__drag-error">
          <div className="chat-area__drag-error-content">
            <span className="chat-area__drag-error-icon">⚠️</span>
            <span className="chat-area__drag-error-message">{dragError}</span>
            <button
              className="chat-area__drag-error-close"
              onClick={() => setDragError(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
