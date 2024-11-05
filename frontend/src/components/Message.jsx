const Message = ({ message }) => {
    const messageClass = message.role === 'user' ? 'user-message' : 'npc-message';
    
    return (
      <div className={`message ${messageClass}`}>
        {message.content}
      </div>
    );
  };
  
  export default Message;
  