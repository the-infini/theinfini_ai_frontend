import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './MarkdownRenderer.css';

const MarkdownRenderer = ({ content, className = '' }) => {
  // Custom components for better styling
  const components = {
    // Code blocks
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (inline) {
        return (
          <code className="markdown-inline-code" {...props}>
            {children}
          </code>
        );
      }
      
      return (
        <div className="markdown-code-block">
          {language && (
            <div className="markdown-code-header">
              <span className="markdown-code-language">{language}</span>
              <button
                className="markdown-code-copy"
                onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                title="Copy code"
              >
                Copy
              </button>
            </div>
          )}
          <pre className="markdown-code-pre">
            <code className={`markdown-code ${className || ''}`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    
    // Blockquotes
    blockquote({ children }) {
      return <blockquote className="markdown-blockquote">{children}</blockquote>;
    },
    
    // Tables
    table({ children }) {
      return (
        <div className="markdown-table-wrapper">
          <table className="markdown-table">{children}</table>
        </div>
      );
    },
    
    // Lists
    ul({ children }) {
      return <ul className="markdown-list markdown-list--unordered">{children}</ul>;
    },
    
    ol({ children }) {
      return <ol className="markdown-list markdown-list--ordered">{children}</ol>;
    },
    
    // Headings
    h1({ children }) {
      return <h1 className="markdown-heading markdown-heading--1">{children}</h1>;
    },
    
    h2({ children }) {
      return <h2 className="markdown-heading markdown-heading--2">{children}</h2>;
    },
    
    h3({ children }) {
      return <h3 className="markdown-heading markdown-heading--3">{children}</h3>;
    },
    
    h4({ children }) {
      return <h4 className="markdown-heading markdown-heading--4">{children}</h4>;
    },
    
    h5({ children }) {
      return <h5 className="markdown-heading markdown-heading--5">{children}</h5>;
    },
    
    h6({ children }) {
      return <h6 className="markdown-heading markdown-heading--6">{children}</h6>;
    },
    
    // Links
    a({ href, children }) {
      return (
        <a 
          href={href} 
          className="markdown-link" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
    
    // Paragraphs
    p({ children }) {
      return <p className="markdown-paragraph">{children}</p>;
    },
    
    // Strong/Bold
    strong({ children }) {
      return <strong className="markdown-strong">{children}</strong>;
    },
    
    // Emphasis/Italic
    em({ children }) {
      return <em className="markdown-emphasis">{children}</em>;
    }
  };

  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
