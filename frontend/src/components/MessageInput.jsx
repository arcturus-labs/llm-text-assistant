import { useState } from 'react';  // Add this import at the top
const MessageInput = ({ onSendMessage }) => {
    const [input, setInput] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!input.trim()) return;
      
      onSendMessage(input);
      setInput('');
    };
  
    return (
      <form className="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    );
  };
  
  export default MessageInput;
  