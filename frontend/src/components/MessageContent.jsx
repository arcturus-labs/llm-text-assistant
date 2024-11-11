import React from 'react';

function MessageContent({ content }) {
  // Helper function to safely render HTML content
  const createMarkup = (text) => {
    return { __html: text };
  };

  // Handle string content (regular messages)
  if (typeof content === 'string') {
    return (
      <span className="message-text">
        {content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            <span 
              style={{ display: 'inline' }} 
              dangerouslySetInnerHTML={createMarkup(line)} 
            />
            {i < content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
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
            {item.text.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                <span dangerouslySetInnerHTML={createMarkup(line)} />
                {i < item.text.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      }
      
      if (item.type === 'tool_use') {
        return (
          <div key={index} className="tool-usage-box">
            <div className="tool-header">Tool: {item.name}</div>
            <div className="tool-input">Input: {JSON.stringify(item.input)}</div>
            <div className="tool-output">
              Output: <span dangerouslySetInnerHTML={createMarkup(item.output)} />
            </div>
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