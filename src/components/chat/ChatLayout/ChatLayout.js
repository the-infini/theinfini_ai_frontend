import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ChatArea from '../ChatArea/ChatArea';
import './ChatLayout.css';

const ChatLayout = () => {
  // Check if mobile on initial load
  const isMobile = () => window.innerWidth <= 768;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile());

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        // Desktop: sidebar should be open by default
        setIsSidebarOpen(true);
      } else {
        // Mobile: sidebar should be closed by default
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="chat-layout">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <ChatArea isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="chat-layout__overlay"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default ChatLayout;
