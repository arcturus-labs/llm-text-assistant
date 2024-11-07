import React from 'react';
//TODO! make the tool uses fold
//TODO! make the anchors turn into buttons

function MessageContent({ content }) {
  // Handle string content (regular messages)
  if (typeof content === 'string') {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  }

  // Handle array content (tool usage messages)
  if (Array.isArray(content)) {
    let toolResults = new Map(); // Store tool results by ID
    
    // First pass: collect tool results
    content.forEach(item => {
      if (item.type === 'tool_result') {
        toolResults.set(item.tool_use_id, item.content);
      }
    });

    // Second pass: render content
    return content.map((item, index) => {
      if (item.type === 'text') {
        return (
          <React.Fragment key={index}>
            {item.text.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
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
            <div className="tool-output">Output: {item.output}</div>
          </div>
        );
      }
      
      return null;
    });
  }

  // If content is neither string nor array, return null
  return null;
}

export default MessageContent; 