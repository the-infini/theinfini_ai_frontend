import React, { useState, useEffect } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import './ProjectModal.css';

const ProjectModal = ({ isOpen, onClose, project = null }) => {
  const { createProject, updateProject, isLoading } = useChat();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: ''
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        rules: project.rules || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        rules: ''
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Project name must be less than 255 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.rules.trim()) {
      newErrors.rules = 'Project rules are required';
    } else if (formData.rules.length > 2000) {
      newErrors.rules = 'Rules must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (project) {
        // Update existing project
        await updateProject(project.id, formData);
      } else {
        // Create new project
        await createProject(formData);
      }
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', rules: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="project-modal-overlay" onClick={handleClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal__header">
          <h2>{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button 
            className="project-modal__close"
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="project-modal__form">
          <div className="project-modal__field">
            <label htmlFor="name" className="project-modal__label">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`project-modal__input ${errors.name ? 'project-modal__input--error' : ''}`}
              placeholder="Enter project name"
              maxLength={255}
            />
            {errors.name && (
              <span className="project-modal__error">{errors.name}</span>
            )}
            <div className="project-modal__char-count">
              {formData.name.length}/255
            </div>
          </div>

          <div className="project-modal__field">
            <label htmlFor="description" className="project-modal__label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`project-modal__textarea ${errors.description ? 'project-modal__textarea--error' : ''}`}
              placeholder="Describe your project and what you want to achieve"
              rows={4}
              maxLength={2000}
            />
            {errors.description && (
              <span className="project-modal__error">{errors.description}</span>
            )}
            <div className="project-modal__char-count">
              {formData.description.length}/2000
            </div>
          </div>

          <div className="project-modal__field">
            <label htmlFor="rules" className="project-modal__label">
              Rules & Guidelines *
            </label>
            <textarea
              id="rules"
              name="rules"
              value={formData.rules}
              onChange={handleInputChange}
              className={`project-modal__textarea ${errors.rules ? 'project-modal__textarea--error' : ''}`}
              placeholder="Define rules and guidelines for AI responses in this project"
              rows={4}
              maxLength={2000}
            />
            {errors.rules && (
              <span className="project-modal__error">{errors.rules}</span>
            )}
            <div className="project-modal__char-count">
              {formData.rules.length}/2000
            </div>
          </div>

          {errors.submit && (
            <div className="project-modal__submit-error">
              {errors.submit}
            </div>
          )}

          <div className="project-modal__actions">
            <button
              type="button"
              onClick={handleClose}
              className="project-modal__button project-modal__button--secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="project-modal__button project-modal__button--primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="project-modal__loading">
                  <div className="project-modal__spinner"></div>
                  {project ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                project ? 'Update Project' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
