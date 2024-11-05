class ChatInterface {
    constructor() {
        this.messageHistory = [];
        this.chatHistory = document.getElementById('chat-history');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    async sendMessage() {
        const messageContent = this.userInput.value.trim();
        if (!messageContent) return;

        // Create message object and add to history
        const userMessage = {
            role: 'user',
            content: messageContent
        };
        
        // Add user message to chat
        this.addMessageToChat(userMessage);
        this.messageHistory.push(userMessage);

        // Clear input
        this.userInput.value = '';

        try {
            // Send to API and get response
            const response = await fetch('/games/adventure/npc_api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: this.messageHistory
                })
            });

            const npcMessage = await response.json();
            
            // Add NPC response to chat
            this.addMessageToChat(npcMessage);
            this.messageHistory.push(npcMessage);

        } catch (error) {
            console.error('Error:', error);
            this.addMessageToChat({
                role: 'assistant',
                content: 'Sorry, there was an error processing your message.'
            });
        }
    }

    addMessageToChat(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        
        // Add appropriate class based on role
        if (message.role === 'user') {
            messageDiv.classList.add('user-message');
        } else {
            messageDiv.classList.add('npc-message');
        }
        
        messageDiv.textContent = message.content;
        this.chatHistory.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();
}); 