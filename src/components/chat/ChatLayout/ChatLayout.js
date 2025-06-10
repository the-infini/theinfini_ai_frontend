import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ChatArea from '../ChatArea/ChatArea';
import './ChatLayout.css';

const ChatLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="chat-layout">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <ChatArea isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
    </div>
  );
};

export default ChatLayout;
