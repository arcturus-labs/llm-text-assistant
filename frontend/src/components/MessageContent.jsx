import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

function MessageContent({ content }) {
  // Helper function to safely render HTML content
  const createMarkup = (text) => {
    return { __html: text };
  };

  // Add state for tracking expanded tool calls
  const [expandedTools, setExpandedTools] = useState(new Set());

  // Add toggle handler
  const toggleTool = (index) => {
    setExpandedTools(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Handle string content (regular messages)
  if (typeof content === 'string') {
    return (
      <span className="message-text">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({children}) => <span style={{ display: 'inline' }}>{children}</span>
          }}
        >
          {content}
        </ReactMarkdown>
      </span>
    );
  }

  // Handle array content (tool usage messages)
  if (Array.isArray(content)) {
    let toolResults = new Map();
    
    content.forEach(item => {
      if (item.type === 'tool_result') {
        toolResults.set(item.tool_use_id, item.content);
      }
    });

    return content.map((item, index) => {
      if (item.type === 'text') {
        return (
          <React.Fragment key={index}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                p: ({children}) => <span style={{ display: 'inline' }}>{children}</span>
              }}
            >
              {item.text}
            </ReactMarkdown>
          </React.Fragment>
        );
      }
      
      if (item.type === 'tool_use') {
        const isExpanded = expandedTools.has(index);
        return (
          <div key={index} className="tool-usage-box">
            <div 
              className="tool-header" 
              onClick={() => toggleTool(index)}
              style={{ cursor: 'pointer' }}
            >
              <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              Tool: {item.name}
            </div>
            {isExpanded && (
              <>
                <div className="tool-input">Input: {JSON.stringify(item.input)}</div>
                <div className="tool-output">
                  Output: <span dangerouslySetInnerHTML={createMarkup(item.output)} />
                </div>
              </>
            )}
          </div>
        );
      }
      
      return null;
    });
  }

  // When rendering loading state
  if (content === '') {
    return <span className="loading-dots">&nbsp;</span>;
  }

  return null;
}

export default MessageContent; 