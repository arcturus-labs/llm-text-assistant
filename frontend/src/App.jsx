import { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [echo, setEcho] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      });
      const result = await response.json();
      setEcho(result);
    } catch (error) {
      console.error('Error:', error);
      setEcho('Error occurred');
    }
  };

  return (
    <div className="app">
      <h1>Echo Demo</h1>
      <div className="echo-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something..."
          />
          <button type="submit">Echo</button>
        </form>
        <div className="echo-box">
          {echo}
        </div>
      </div>
    </div>
  );
}

export default App;
