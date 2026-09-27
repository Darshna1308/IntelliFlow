function MessageCard({
  message,
}) {
  if (!message) {
    return null;
  }

  return (
    <div className="message-card">
      {message}
    </div>
  );
}


export default MessageCard;