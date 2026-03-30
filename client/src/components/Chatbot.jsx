import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Karina. How are your habits today? ✨", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newContext = [...messages, { text: userText, isBot: false }];
    setMessages(newContext);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newContext })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Oops, couldn't connect to server.", isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="chatbot-fab animate-slide-up"
          onClick={() => setIsOpen(true)}
          title="Open Chat"
          style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'transparent' }}
        >
          <img src="/karina_avatar.jpg?v=new" alt="Karina" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window glass animate-slide-up">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/karina_avatar.jpg?v=new" alt="Karina" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
              <h4>Karina</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn-icon" style={{ padding: '0.2rem' }}>
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-message ${m.isBot ? 'bot' : 'user'}`}>
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-message bot typing">
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chatbot-input">
            <input
              type="text"
              placeholder="Ask for advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={isTyping || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
