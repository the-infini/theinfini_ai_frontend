import { useState, useEffect } from 'react';
import chatService from '../services/chatService';

/**
 * Custom hook to load files with authentication
 * Creates blob URLs for authenticated file access
 */
export const useAuthenticatedFile = (fileUrl) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileUrl) {
      setBlobUrl(null);
      setError(null);
      return;
    }

    const loadFile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if it's already a full HTTP URL (external file)
        if (fileUrl.startsWith('http')) {
          setBlobUrl(fileUrl);
          return;
        }

        // For API file URLs, fetch with authentication
        const blob = await chatService.getFile(fileUrl);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        console.error('Failed to load authenticated file:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    // Cleanup blob URL when component unmounts or URL changes
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fileUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);

  return { blobUrl, loading, error };
};

/**
 * Component wrapper for authenticated images
 */
export const AuthenticatedImage = ({ 
  src, 
  alt, 
  className, 
  style, 
  onClick, 
  onError,
  ...props 
}) => {
  const { blobUrl, loading, error } = useAuthenticatedFile(src);

  if (loading) {
    return (
      <div 
        className={`${className} authenticated-image-loading`} 
        style={{ 
          ...style, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666'
        }}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`${className} authenticated-image-error`} 
        style={{ 
          ...style, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#ffebee',
          color: '#c62828'
        }}
      >
        Failed to load image
      </div>
    );
  }

  if (!blobUrl) {
    return null;
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      onError={onError}
      {...props}
    />
  );
};

export default useAuthenticatedFile;
