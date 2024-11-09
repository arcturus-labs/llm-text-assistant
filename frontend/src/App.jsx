import React from 'react';
import { useState, useRef } from 'react';
import ArtifactPanel from './components/ArtifactPanel';
import MessageContent from './components/MessageContent';
import SubscriptionCheck from './components/SubscriptionCheck';
import './App.css';
//TODO! add spinner while waiting for response
//TODO! pull the user's email and auth status from cookies
//- if they are authed, then run future commands
//- if they have an email but are not authed, then prompt them make sure it's correct and make sure they've checked their email for confirmation, and once they submit, re-run the auth check
//- if they don't have an email, then prompt them for their email and run the auth check, and return with an "auth ok" or the above dialog


function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const subscriptionCheckRef = useRef();

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

    if (!subscriptionCheckRef.current.checkSubscription()) {
      return;
    }

    const newMessages = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          artifacts: artifacts
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
    }
  };

  return (
    <div className="app">
      <SubscriptionCheck
        ref={subscriptionCheckRef}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        authorized={authorized}
        setAuthorized={setAuthorized}
      />
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
          />
          <button type="submit" className="chat-submit">Send</button>
        </form>
      </div>
      <div className="right-panel">
        <ArtifactPanel 
          artifacts={artifacts} 
          onArtifactChange={handleArtifactChange}
        />
      </div>
    </div>
  );
}

export default App;
