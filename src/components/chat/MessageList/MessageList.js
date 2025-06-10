import React, { useEffect, useRef } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import './MessageList.css';

const MessageList = () => {
  const { messages, isLoading, hasMoreMessages, loadMessages, currentThread } = useChat();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasMoreMessages && !isLoading && currentThread) {
      // Load more messages when scrolled to top
      loadMessages(currentThread.id, messages.length, true);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessage = (text) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="message-list message-list--empty">
        <div className="message-list__empty-state">
          <div className="message-list__empty-icon">💬</div>
          <h3>Start a conversation</h3>
          <p>Send a message to begin chatting with AI</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="message-list"
      ref={messagesContainerRef}
      onScroll={handleScroll}
    >
      {isLoading && messages.length === 0 && (
        <div className="message-list__loading">
          <div className="message-list__loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      )}

      {hasMoreMessages && messages.length > 0 && (
        <div className="message-list__load-more">
          {isLoading ? (
            <div className="message-list__loading-spinner"></div>
          ) : (
            <button
              onClick={() => loadMessages(currentThread.id, messages.length, true)}
              className="message-list__load-more-btn"
            >
              Load more messages
            </button>
          )}
        </div>
      )}

      <div className="message-list__messages">
        {messages.map((message, index) => (
          <div key={message.id || index} className="message-list__message-group">
            {message.isUserMessage ? (
              /* User Message */
              <div className="message-list__message message-list__message--user">
                <div className="message-list__message-content">
                  <div className="message-list__message-text">
                    {message.message}
                  </div>
                  <div className="message-list__message-time">
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ) : (
              /* AI Response */
              <div className="message-list__message message-list__message--ai">
                <div className="message-list__message-content">
                  <div className="message-list__message-header">
                    <span className="message-list__message-sender">the infini ai</span>
                    {message.isStreaming && (
                      <span className="message-list__streaming-indicator">
                        <span className="message-list__streaming-dot"></span>
                        <span className="message-list__streaming-dot"></span>
                        <span className="message-list__streaming-dot"></span>
                      </span>
                    )}
                  </div>
                  <div
                    className="message-list__message-text"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.response || message.message || '')
                    }}
                  />
                  {!message.isStreaming && (
                    <div className="message-list__message-footer">
                      <div className="message-list__message-time">
                        {formatTime(message.createdAt)}
                      </div>
                      {message.llmModel && (
                        <span className="message-list__message-model">{message.llmModel}</span>
                      )}
                      <div className="message-list__message-actions">
                        <button
                          className="message-list__action-btn message-list__copy-btn"
                          onClick={() => navigator.clipboard.writeText(message.response || message.message)}
                          title="Copy response"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                        <button
                          className="message-list__action-btn"
                          title="Regenerate response"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 4v6h6"/>
                            <path d="M23 20v-6h-6"/>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
