import React from 'react';

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

  // Create a map of tool calls and their responses
  const toolResponses = content.reduce((acc, item) => {
    if (item.type === 'tool_result') {
      acc[item.tool_use_id] = item.content;
    }
    return acc;
  }, {});

  // Handle array content
  return content.map((item, index) => {
    switch (item.type) {
      case 'text':
        return <div key={index} className="message-text">{item.text}</div>;
      
      case 'tool_use': {
        const response = toolResponses[item.id];
        return (
          <div key={index} className="tool-block">
            <div className="tool-call">
              <div className="tool-header">🔧 Tool Called: {item.name}</div>
              <div className="tool-args">
                Arguments: {JSON.stringify(item.input, null, 2)}
              </div>
            </div>
            {response && (
              <div className="tool-result">
                <div className="tool-header">📎 Response:</div>
                <div className="tool-content" dangerouslySetInnerHTML={{ __html: response }} />
              </div>
            )}
          </div>
        );
      }
      
      case 'tool_result':
        // Skip tool_result items as they're handled with their corresponding tool_use
        return null;
      
      default:
        return null;
    }
  });
}

export default MessageContent; 