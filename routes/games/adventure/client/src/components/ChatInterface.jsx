import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
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
      const response = await fetch('/games/adventure/npc_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      const npcMessage = await response.json();
      
      // Add NPC response
      setMessages(prev => [...prev, npcMessage]);

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
