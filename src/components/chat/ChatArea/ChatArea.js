import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useChat } from '../../../contexts/ChatContext';
import ChatInput from '../ChatInput/ChatInput';
import MessageList from '../MessageList/MessageList';
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
    error,
    clearError
  } = useChat();

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

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-area__header">
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
          onSendMessage={handleSendMessage}
          disabled={isSending || isStreaming}
          isLoading={isSending || isStreaming}
        />
      </div>
    </div>
  );
};

export default ChatArea;
