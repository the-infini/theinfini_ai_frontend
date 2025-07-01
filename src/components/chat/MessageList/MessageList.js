import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../../contexts/ChatContext';
import MarkdownRenderer from '../../common/MarkdownRenderer';
import { AuthenticatedImage } from '../../../hooks/useAuthenticatedFile';
import chatService from '../../../services/chatService';
import './MessageList.css';

const MessageList = () => {
  const {
    messages,
    isLoading,
    hasMoreMessages,
    loadMessages,
    currentThread,
    regenerateMessage,
    regeneratingMessages,
    regenerationError,
    clearRegenerationError,
    selectedModel
  } = useChat();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [copiedMessages, setCopiedMessages] = useState(new Set());

  // Helper function to get full attachment URL
  const getAttachmentUrl = (url) => {
    if (!url) return '';

    // If it's already a full URL (starts with http), return as is
    if (url.startsWith('http')) {
      return url;
    }

    // If it's a relative URL, prepend the API base URL
    const baseUrl = process.env.REACT_APP_API_URL;
    return `${baseUrl}${url}`;
  };

  // Scroll to bottom when new messages arrive or thread changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll to bottom when thread changes
  useEffect(() => {
    if (currentThread && messages.length > 0) {
      // Use a small delay to ensure messages are rendered
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [currentThread?.id]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use both scrollIntoView and manual scroll for better reliability
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });

      // Also try manual scroll as backup
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    }
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

  const handleCopyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.response || message.message);

      // Add message ID to copied set
      setCopiedMessages(prev => new Set([...prev, message.id]));

      // Remove from copied set after 2 seconds
      setTimeout(() => {
        setCopiedMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(message.id);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleRegenerate = async (message) => {
    try {
      // Clear any previous regeneration errors
      clearRegenerationError();

      // Call the regenerate function with the message ID and selected model
      await regenerateMessage(message.id, selectedModel);
    } catch (error) {
      console.error('Failed to regenerate message:', error);
    }
  };

  const handleUpgradeCredits = () => {
    navigate('/profile');
    // Scroll to plan management section after navigation
    setTimeout(() => {
      const planSection = document.querySelector('.plan-management-section');
      if (planSection) {
        planSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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

      {regenerationError && (
        <div className="message-list__error">
          <div className="message-list__error-content">
            <span className="message-list__error-text">
              Failed to regenerate response: {regenerationError}
            </span>
            {regenerationError.includes('Insufficient credits') && (
              <button
                className="message-list__error-upgrade-btn"
                onClick={handleUpgradeCredits}
                title="Upgrade your plan to get more credits"
              >
                Upgrade Plan
              </button>
            )}
            <button
              className="message-list__error-close"
              onClick={clearRegenerationError}
              title="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="message-list__messages">
        {messages.map((message, index) => (
          <div key={message.id || index} className="message-list__message-group">
            {message.isUserMessage ? (
              /* User Message */
              <div className="message-list__message message-list__message--user">
                <div className="message-list__message-content">
                  {/* Attachment Display */}
                  {message.attachmentName && (
                    <div className="message-list__attachment">
                      {/* Display image if it's an image attachment with URL */}
                      {message.attachmentType?.startsWith('image/') && (message.attachmentUrl || message.attachmentS3Url) ? (
                        <div className="message-list__attachment-image-container">
                          <AuthenticatedImage
                            src={message.attachmentUrl || message.attachmentS3Url}
                            alt={message.attachmentName}
                            className="message-list__attachment-image"
                            onClick={() => {
                              // For authenticated files, we need to handle download differently
                              const fileUrl = message.attachmentUrl || message.attachmentS3Url;
                              if (fileUrl.startsWith('http')) {
                                window.open(fileUrl, '_blank');
                              } else {
                                // Create a download link for authenticated files
                                const link = document.createElement('a');
                                link.href = getAttachmentUrl(fileUrl);
                                link.download = message.attachmentName;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          <div className="message-list__attachment-info">
                            <div className="message-list__attachment-name">{message.attachmentName}</div>
                            {message.attachmentSize && (
                              <div className="message-list__attachment-size">
                                {(message.attachmentSize / 1024 / 1024).toFixed(2)} MB
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Non-image attachments or images without URL */
                        <div className="message-list__attachment-file">
                          <div className="message-list__attachment-icon">
                            {message.attachmentType?.startsWith('image/') ? '🖼️' :
                             message.attachmentType === 'application/pdf' ? '📄' :
                             message.attachmentType?.includes('word') ? '📝' :
                             message.attachmentType?.includes('sheet') ? '📊' : '📎'}
                          </div>
                          <div className="message-list__attachment-info">
                            <div className="message-list__attachment-name">
                              {(message.attachmentUrl || message.attachmentS3Url) ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      const fileUrl = message.attachmentUrl || message.attachmentS3Url;
                                      if (fileUrl.startsWith('http')) {
                                        // External URL, open directly
                                        window.open(fileUrl, '_blank');
                                      } else {
                                        // Authenticated file, download via blob
                                        const blob = await chatService.getFile(fileUrl);
                                        const url = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = message.attachmentName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(url);
                                      }
                                    } catch (error) {
                                      console.error('Failed to download file:', error);
                                      alert('Failed to download file. Please try again.');
                                    }
                                  }}
                                  className="message-list__attachment-link"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: 'inherit',
                                    textDecoration: 'underline',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {message.attachmentName}
                                </button>
                              ) : (
                                message.attachmentName
                              )}
                            </div>
                            {message.attachmentSize && (
                              <div className="message-list__attachment-size">
                                {(message.attachmentSize / 1024 / 1024).toFixed(2)} MB
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Text */}
                  {message.message && (
                    <div className="message-list__message-text">
                      <MarkdownRenderer
                        content={message.message || ''}
                        className="message-list__markdown message-list__markdown--user"
                      />
                    </div>
                  )}

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
                    {message.isRegenerated && (
                      <span className="message-list__regenerated-badge" title="Regenerated response">
                        🔄
                      </span>
                    )}
                    {message.isStreaming && (
                      <span className="message-list__streaming-indicator">
                        <span className="message-list__streaming-dot"></span>
                        <span className="message-list__streaming-dot"></span>
                        <span className="message-list__streaming-dot"></span>
                      </span>
                    )}
                  </div>
                  <div className="message-list__message-text">
                    <MarkdownRenderer
                      content={message.response || message.message || ''}
                      className="message-list__markdown"
                    />
                  </div>
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
                          onClick={() => handleCopyMessage(message)}
                          title={copiedMessages.has(message.id) ? "Copied!" : "Copy response"}
                        >
                          {copiedMessages.has(message.id) ? (
                            // Checkmark icon
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                          ) : (
                            // Copy icon
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                          )}
                        </button>
                        <button
                          className={`message-list__action-btn ${regeneratingMessages.has(message.id) ? 'message-list__action-btn--loading' : ''}`}
                          onClick={() => handleRegenerate(message)}
                          disabled={regeneratingMessages.has(message.id)}
                          title={regeneratingMessages.has(message.id) ? "Regenerating..." : "Regenerate response"}
                        >
                          {regeneratingMessages.has(message.id) ? (
                            // Loading spinner
                            <div className="message-list__loading-spinner message-list__loading-spinner--small"></div>
                          ) : (
                            // Regenerate icon
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 4v6h6"/>
                              <path d="M23 20v-6h-6"/>
                              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                            </svg>
                          )}
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
