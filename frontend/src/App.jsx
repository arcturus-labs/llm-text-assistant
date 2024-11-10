import React from 'react';
import { useState, useRef } from 'react';
import ArtifactPanel from './components/ArtifactPanel';
import MessageContent from './components/MessageContent';
import SubscriptionCheck from './components/SubscriptionCheck';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const subscriptionCheckRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = [
    "I'm I want to put together an email for a client about the home listed at 192 Oak St. Can you pull the listing?",
    "What are the comps for that property?",
    "Can you pull the email template and draft a new email?",
    "Oh, I forgot to tell you. His name is Tim Sircy and my company name is Arcturus Real Estate."
  ];

  const handleArtifactChange = (identifier, newContent) => {
    setArtifacts(artifacts.map(artifact => 
      artifact.identifier === identifier 
        ? { ...artifact, content: newContent }
        : artifact
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    if (!subscriptionCheckRef.current.checkSubscription()) return;

    setIsLoading(true);
    const newMessages = [...messages, { role: 'user', content: inputMessage }];
    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setInputMessage('');

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const conversationType = urlParams.has('dumb') ? 'dumb' : 'smart';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          artifacts: artifacts,
          conversation_type: conversationType
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setMessages(result.messages);
        if (result.artifacts) {
          setArtifacts(result.artifacts);
        }
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Error: Failed to get response' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Error: Failed to send message' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="app">
      <SubscriptionCheck ref={subscriptionCheckRef} />
      <div className="chat-container">
        <div className="chat-history">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                <MessageContent content={message.content} />
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="chat-submit"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
      <div className="right-panel">
        <ArtifactPanel 
          artifacts={artifacts} 
          onArtifactChange={handleArtifactChange}
        />
      </div>
      {showSuggestions && (
        <div className="suggestions-panel">
          <div className="suggestions-title">Suggested Messages</div>
          <button 
            className="close-suggestions"
            onClick={() => setShowSuggestions(false)}
          >
            ×
          </button>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <button 
                  className="suggestion-button"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  ←
                </button>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
