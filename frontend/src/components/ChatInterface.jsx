import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content) => {
    const userMessage = {
      role: 'user',
      content: content
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send to API
      const response = await fetch('/api/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
      });

      const echoedContent = await response.json();
      
      // Add echo response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: echoedContent
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.'
      }]);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-history" ref={chatHistoryRef}>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatInterface;
