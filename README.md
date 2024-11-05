# NPC Chat Demo

A simple chat interface demo where users can interact with a non-player character (NPC). Currently, the NPC simply echoes back the user's message in uppercase.

## Project Structure 

```
adventure/
├── client/ # React frontend
├── routes.py # Flask backend routes
└── README.md # This file
```

## Running the Application

You'll need two terminal windows to run both the frontend and backend servers.

### Backend (Flask)

From the project root directory:

```bash
python app.py
```

The Flask server will run on http://localhost:5555

### Frontend (React)

From the `routes/games/adventure/client` directory:
```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The React development server will run on http://localhost:5173

## Using the Application

1. Open http://localhost:5173 in your browser
2. Type a message in the input box
3. Press Enter or click Send
4. The NPC will respond with your message in uppercase
5. Continue the conversation as desired

## Technical Details

- Frontend: React (Vite)
- Backend: Flask
- API Endpoint: `/games/adventure/npc_api`
- Message Format: 
```json
{
    "messages": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "HELLO"}
    ]
}
```

## Future Improvements

- Add actual NPC logic/AI responses
- Implement persistent chat history
- Add typing indicators
- Add character avatars
- Enhance the UI/UX