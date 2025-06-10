import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useChat } from '../../../contexts/ChatContext';
import { ConfirmationModal } from '../../common';
import ProjectModal from '../ProjectModal/ProjectModal';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const [activeItem, setActiveItem] = useState('new-chat');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    threadId: null,
    threadName: '',
    isDeleting: false
  });
  const { user, logout } = useAuth();
  const {
    threads,
    projects,
    currentThread,
    currentProject,
    projectThreads,
    expandedProjects,
    isLoading,
    startNewChat,
    startNewProjectChat,
    selectThread,
    toggleProjectExpansion,
    searchProjects,
    searchResults,
    deleteThread
  } = useChat();
  const navigate = useNavigate();

  const topMenuItems = [
    { id: 'search', label: 'Search', icon: '🔍' }
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Note: Data loading is handled by ChatContext, no need to duplicate here

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);

    if (itemId === 'new-chat') {
      startNewChat();
    } else if (itemId === 'search') {
      setShowSearch(!showSearch);
    } else if (itemId === 'settings') {
      navigate('/profile');
    }
  };

  const handleNewChat = () => {
    startNewChat();
    setActiveItem('new-chat');
  };

  const handleCreateProject = () => {
    setShowProjectModal(true);
  };

  const handleThreadClick = (thread) => {
    selectThread(thread);
    setActiveItem('threads');
  };

  const handleProjectClick = (project) => {
    toggleProjectExpansion(project.id);
    setActiveItem('projects');
  };

  const handleNewProjectChat = (project, e) => {
    e.stopPropagation(); // Prevent project expansion/collapse
    startNewProjectChat(project);
    setActiveItem('projects');
  };

  const handleDeleteThread = (threadId, threadName, e) => {
    e.stopPropagation(); // Prevent thread selection when clicking delete
    setDeleteConfirmation({
      isOpen: true,
      threadId,
      threadName,
      isDeleting: false
    });
  };

  const confirmDeleteThread = async () => {
    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteThread(deleteConfirmation.threadId);
      setDeleteConfirmation({
        isOpen: false,
        threadId: null,
        threadName: '',
        isDeleting: false
      });
    } catch (error) {
      console.error('Failed to delete thread:', error);
      // Keep modal open on error so user can try again, but stop loading
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDeleteThread = () => {
    setDeleteConfirmation({
      isOpen: false,
      threadId: null,
      threadName: '',
      isDeleting: false
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchProjects(searchQuery.trim());
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'G';
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Guest';
  };

  const getUserPlan = () => {
    return user?.plan || 'Free Plan';
  };

  return (
    <div className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      {/* Header */}
      <div className="sidebar__header">
        <div className="sidebar__logo" onClick={() => navigate('/')}>
          <h2>the infini ai</h2>
        </div>
        <button className="sidebar__toggle" onClick={onToggle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="sidebar__content">

      {/* New Chat Button */}
      <div className="sidebar__new-chat">
        <button className="sidebar__new-chat-btn" onClick={handleNewChat}>
          <span className="sidebar__new-chat-icon">+</span>
          {isOpen && <span>New chat</span>}
        </button>
      </div>

      {/* Top Menu Items */}
      {isOpen && (
        <nav className="sidebar__top-nav">
          <ul className="sidebar__nav-list">
            {topMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`sidebar__nav-item ${activeItem === item.id ? 'sidebar__nav-item--active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <span className="sidebar__nav-icon">{item.icon}</span>
                  <span className="sidebar__nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Search Section */}
      {showSearch && isOpen && (
        <div className="sidebar__search">
          <form onSubmit={handleSearch} className="sidebar__search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search projects..."
              className="sidebar__search-input"
            />
            <button type="submit" className="sidebar__search-btn">
              🔍
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="sidebar__search-results">
              <div className="sidebar__section-title">Search Results</div>
              {searchResults.map(project => (
                <div
                  key={project.id}
                  className={`sidebar__item ${currentProject?.id === project.id ? 'sidebar__item--active' : ''}`}
                  onClick={() => handleProjectClick(project)}
                >
                  <span className="sidebar__item-icon">📁</span>
                  <span className="sidebar__item-text">{project.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Projects Section */}
      {isOpen && (
        <div className="sidebar__section">
          <div className="sidebar__section-header">
            <span className="sidebar__section-title">Projects</span>
            <button
              className="sidebar__section-action"
              onClick={handleCreateProject}
              title="Create new project"
            >
              +
            </button>
          </div>

          {isLoading ? (
            <div className="sidebar__loading">Loading...</div>
          ) : (
            <div className="sidebar__items">
              {projects.map(project => {
                const isExpanded = expandedProjects.has(project.id);
                const threads = projectThreads[project.id] || [];

                return (
                  <div key={project.id} className="sidebar__project-container">
                    <div
                      className={`sidebar__item sidebar__project-item ${currentProject?.id === project.id ? 'sidebar__item--active' : ''}`}
                      onClick={() => handleProjectClick(project)}
                    >
                      <span className="sidebar__item-expand-icon">
                        {isExpanded ? '📂' : '📁'}
                      </span>
                      <span className="sidebar__item-text">{project.name}</span>
                      <span className="sidebar__expand-arrow">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="sidebar__project-threads">
                        {/* New Chat Button for Project */}
                        <div className="sidebar__project-new-chat">
                          <button
                            className="sidebar__project-new-chat-btn"
                            onClick={(e) => handleNewProjectChat(project, e)}
                            title="Start new chat in this project"
                          >
                            <span className="sidebar__item-icon">+</span>
                            <span className="sidebar__item-text">New chat</span>
                          </button>
                        </div>

                        {threads.length > 0 ? (
                          threads.map(thread => (
                            <div
                              key={thread.id}
                              className={`sidebar__item sidebar__thread-item ${currentThread?.id === thread.id ? 'sidebar__item--active' : ''}`}
                              onClick={() => handleThreadClick(thread)}
                            >
                              <span className="sidebar__item-icon">💬</span>
                              <span className="sidebar__item-text">{thread.name}</span>
                              <button
                                className="sidebar__item-delete"
                                onClick={(e) => handleDeleteThread(thread.id, thread.name, e)}
                                title="Delete thread"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3,6 5,6 21,6"/>
                                  <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                                  <line x1="10" y1="11" x2="10" y2="17"/>
                                  <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="sidebar__empty sidebar__project-empty">No chats in this project yet</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {projects.length === 0 && (
                <div className="sidebar__empty">No projects yet</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Chats Section - Only show threads not in projects */}
      {isOpen && threads.length > 0 && (
        <div className="sidebar__section">
          <div className="sidebar__section-header">
            <span className="sidebar__section-title">Recent Chats</span>
          </div>

          <div className="sidebar__items">
            {threads.filter(thread => !thread.projectId).map(thread => (
              <div
                key={thread.id}
                className={`sidebar__item ${currentThread?.id === thread.id ? 'sidebar__item--active' : ''}`}
                onClick={() => handleThreadClick(thread)}
              >
                <span className="sidebar__item-icon">💬</span>
                <span className="sidebar__item-text">{thread.name}</span>
                <button
                  className="sidebar__item-delete"
                  onClick={(e) => handleDeleteThread(thread.id, thread.name, e)}
                  title="Delete thread"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>

      {/* Bottom Section */}
      <div className="sidebar__bottom">
        {/* Settings */}
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeItem === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {isOpen && <span className="sidebar__nav-label">{item.label}</span>}
          </button>
        ))}

        {/* User Profile */}
        <div className="sidebar__user-profile" onClick={() => navigate('/profile')}>
          <div className="sidebar__user-avatar">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="sidebar__user-avatar-image"
              />
            ) : (
              <div className="sidebar__user-avatar-placeholder">
                {getUserInitials()}
              </div>
            )}
          </div>
          {isOpen && (
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{getUserName()}</div>
              <div className="sidebar__user-plan">{getUserPlan()}</div>
            </div>
          )}
          {isOpen && (
            <button
              className="sidebar__logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDeleteThread}
        onConfirm={confirmDeleteThread}
        title="Delete Chat Thread"
        message={`Are you sure you want to delete "${deleteConfirmation.threadName}"? This action cannot be undone.`}
        confirmText="Delete Thread"
        cancelText="Cancel"
        confirmButtonType="danger"
        isLoading={deleteConfirmation.isDeleting}
      />
    </div>
  );
};

export default Sidebar;
