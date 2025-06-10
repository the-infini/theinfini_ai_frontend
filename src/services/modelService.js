import apiClient from './apiClient';

class ModelService {
  // Get available LLM models
  async getAvailableModels() {
    try {
      const response = await apiClient.get('/chat/models');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to format model names for display
  formatModelName(modelId) {
    const modelNames = {
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-4': 'GPT-4',
      'gpt-4-turbo-preview': 'GPT-4 Turbo',
      'claude-3-haiku-20240307': 'Claude 3 Haiku',
      'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
      'claude-3-opus-20240229': 'Claude 3 Opus'
    };

    return modelNames[modelId] || modelId;
  }

  // Get model provider (OpenAI, Anthropic, etc.)
  getModelProvider(modelId) {
    if (modelId.startsWith('gpt-')) {
      return 'OpenAI';
    } else if (modelId.startsWith('claude-')) {
      return 'Anthropic';
    }
    return 'Unknown';
  }

  // Get model icon based on provider
  getModelIcon(modelId) {
    const provider = this.getModelProvider(modelId);
    switch (provider) {
      case 'OpenAI':
        return '🤖';
      case 'Anthropic':
        return '🧠';
      default:
        return '💬';
    }
  }

  // Get model tier (basic, advanced, premium)
  getModelTier(modelId) {
    const tiers = {
      'gpt-3.5-turbo': 'basic',
      'gpt-4': 'advanced',
      'gpt-4-turbo-preview': 'premium',
      'claude-3-haiku-20240307': 'basic',
      'claude-3-sonnet-20240229': 'advanced',
      'claude-3-opus-20240229': 'premium'
    };

    return tiers[modelId] || 'basic';
  }

  // Get model description
  getModelDescription(modelId) {
    const descriptions = {
      'gpt-3.5-turbo': 'Fast and efficient for most tasks',
      'gpt-4': 'More capable, better reasoning',
      'gpt-4-turbo-preview': 'Latest GPT-4 with improved performance',
      'claude-3-haiku-20240307': 'Quick and responsive',
      'claude-3-sonnet-20240229': 'Balanced performance and capability',
      'claude-3-opus-20240229': 'Most capable Claude model'
    };

    return descriptions[modelId] || 'AI language model';
  }

  // Helper method to handle errors
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}

const modelService = new ModelService();
export default modelService;
