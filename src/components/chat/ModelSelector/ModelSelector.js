import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import modelService from '../../../services/modelService';
import './ModelSelector.css';

const ModelSelector = ({ onModelSelect, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('top');
  const { availableModels, selectedModel, setSelectedModel } = useChat();
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
    setIsOpen(false);
    if (onModelSelect) {
      onModelSelect(modelId);
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        // Calculate position before opening
        calculateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  const calculateDropdownPosition = () => {
    if (triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewportHeight - triggerRect.bottom;

      // If there's more space above and not enough space below, show above
      if (spaceAbove > 300 && spaceBelow < 300) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  };

  const getModelDisplayInfo = (modelId) => {
    return {
      name: modelService.formatModelName(modelId),
      provider: modelService.getModelProvider(modelId),
      icon: modelService.getModelIcon(modelId),
      tier: modelService.getModelTier(modelId),
      description: modelService.getModelDescription(modelId)
    };
  };

  const selectedModelInfo = getModelDisplayInfo(selectedModel);

  return (
    <div className={`model-selector ${disabled ? 'model-selector--disabled' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`model-selector__trigger ${isOpen ? 'model-selector__trigger--open' : ''}`}
        onClick={toggleDropdown}
        disabled={disabled}
        title={`Current model: ${selectedModelInfo.name}`}
      >
        <div className="model-selector__current">
          <div className="model-selector__info">
            <span className="model-selector__name">{selectedModelInfo.name}</span>
            <span className="model-selector__provider">{selectedModelInfo.provider}</span>
          </div>
        </div>
        <svg
          className={`model-selector__arrow ${isOpen ? 'model-selector__arrow--up' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className={`model-selector__dropdown model-selector__dropdown--${dropdownPosition}`}>
          <div className="model-selector__header">
            <h4>Select AI Model</h4>
            <p>Choose the AI model for your conversation</p>
          </div>

          <div className="model-selector__options">
            {availableModels.map((modelId) => {
              const modelInfo = getModelDisplayInfo(modelId);
              const isSelected = modelId === selectedModel;

              return (
                <button
                  key={modelId}
                  className={`model-selector__option ${isSelected ? 'model-selector__option--selected' : ''}`}
                  onClick={() => handleModelSelect(modelId)}
                >
                  <div className="model-selector__option-main">
                    <div className="model-selector__option-info">
                      <div className="model-selector__option-name">{modelInfo.name}</div>
                      <div className="model-selector__option-provider">{modelInfo.provider}</div>
                    </div>
                    <span className={`model-selector__tier model-selector__tier--${modelInfo.tier}`}>
                      {modelInfo.tier}
                    </span>
                  </div>
                  <div className="model-selector__option-description">
                    {modelInfo.description}
                  </div>
                  {isSelected && (
                    <div className="model-selector__option-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {availableModels.length === 0 && (
            <div className="model-selector__empty">
              <p>No models available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
