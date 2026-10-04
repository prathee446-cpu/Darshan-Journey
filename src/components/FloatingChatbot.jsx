import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './FloatingChatbot.css';

const INITIAL_MESSAGE = "🙏 Welcome to Darshan Journey!\nHow can I help you today?";

const QUICK_ACTIONS = [
  "Explore Temples",
  "Book Darshan",
  "Darshan Timings",
  "Pooja & Seva",
  "Prasadam",
  "Booking Help"
];

// Map all possible chatbot quick-actions and options to exact existing routes
const ACTION_ROUTE_MAP = {
  "Explore Temples": "/explore",
  "Find a Temple": "/explore",
  "Explore All Temples": "/explore",
  "Browse Temple Directory": "/explore",
  "Meenakshi Amman": "/explore",
  "Brihadeeswarar": "/explore",
  "Tiruchendur": "/explore",
  "Palani": "/explore",
  "Srirangam": "/explore",
  "Rameswaram": "/explore",
  "Book Darshan": "/quick-booking",
  "Book Darshan Now": "/quick-booking",
  "Quick Booking": "/quick-booking",
  "Start Quick Booking": "/quick-booking",
  "Darshan Timings": "/explore",
  "Temple Timings": "/explore",
  "Timings": "/explore",
  "Check Temple Calendar": "/home",
  "Pooja & Seva": "/services",
  "Pooja Services": "/services",
  "View All Pooja Services": "/services",
  "View Pooja & Seva Services": "/services",
  "Pooja Essentials": "/services/category/pooja-essentials",
  "Prasadam": "/services/category/temple-prasadam",
  "Temple Prasadam": "/services/category/temple-prasadam",
  "Order Prasadam & Essentials": "/services/category/temple-prasadam",
  "Order Temple Prasadam": "/services/category/temple-prasadam",
  "Booking Help": "/quick-booking",
  "Help": "/quick-booking",
  "Payment Info": "/dashboard",
  "Devotee Dashboard": "/dashboard",
  "Go to Devotee Dashboard": "/dashboard",
  "Contact Support": "/contact",
  "Contact Us": "/contact",
  "About": "/about",
  "About Us": "/about"
};

function getRouteForAction(action) {
  if (!action) return '/explore';
  if (ACTION_ROUTE_MAP[action]) {
    return ACTION_ROUTE_MAP[action];
  }
  const lower = action.toLowerCase();
  if (lower.includes('explore') || lower.includes('temple') || lower.includes('shrine') || 
      lower.includes('meenakshi') || lower.includes('brihadeeswarar') || lower.includes('tiruchendur') || 
      lower.includes('palani') || lower.includes('srirangam') || lower.includes('rameswaram')) {
    return '/explore';
  }
  if (lower.includes('book') || lower.includes('ticket') || lower.includes('slot') || lower.includes('pass')) {
    return '/quick-booking';
  }
  if (lower.includes('timing') || lower.includes('schedule') || lower.includes('hour')) {
    return '/explore';
  }
  if (lower.includes('prasad') || lower.includes('laddu') || lower.includes('panchamirtham')) {
    return '/services/category/temple-prasadam';
  }
  if (lower.includes('pooja') || lower.includes('puja') || lower.includes('seva') || lower.includes('archana') || lower.includes('service')) {
    return '/services';
  }
  if (lower.includes('help') || lower.includes('guide')) {
    return '/quick-booking';
  }
  if (lower.includes('contact') || lower.includes('support')) {
    return '/contact';
  }
  if (lower.includes('payment') || lower.includes('dashboard') || lower.includes('profile')) {
    return '/dashboard';
  }
  return '/explore';
}

function getOrCreateSessionId() {
  try {
    let sid = localStorage.getItem('darshan_chat_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('darshan_chat_session_id', sid);
    }
    return sid;
  } catch (e) {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-init-1',
      sender: 'bot',
      text: INITIAL_MESSAGE,
      time: getCurrentTime(),
      quickActions: QUICK_ACTIONS
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const historyFetchedRef = useRef(false);
  const navigate = useNavigate();

  let authUser = null;
  try {
    const auth = useAuth();
    authUser = auth?.user || null;
  } catch (e) {
    authUser = null;
  }

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Load chat history from MongoDB Atlas via backend API
  const loadChatHistory = useCallback(async (currentSessionId) => {
    try {
      const activeSession = currentSessionId || sessionId;
      const userId = authUser?.id || authUser?._id || '';
      const params = new URLSearchParams();
      if (activeSession) params.append('sessionId', activeSession);
      if (userId) params.append('userId', userId);

      const res = await fetch(`/api/chat/history?${params.toString()}`);
      if (!res.ok) {
        console.warn('Could not fetch chat history, status:', res.status);
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        const mapped = data.messages.map((m, idx) => ({
          id: `msg-${idx}-${new Date(m.timestamp || Date.now()).getTime()}`,
          sender: (m.role === 'user') ? 'user' : 'bot',
          text: m.content || m.text || '',
          time: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          navAction: m.navAction || null,
          quickActions: (m.quickActions && m.quickActions.length > 0) ? m.quickActions : null
        }));

        setMessages(mapped);
      }
    } catch (err) {
      console.warn('Notice loading chat history from MongoDB:', err.message);
    }
  }, [sessionId, authUser]);

  // Fetch history on initial component mount and when opening chat
  useEffect(() => {
    if (!historyFetchedRef.current) {
      historyFetchedRef.current = true;
      loadChatHistory();
    }
  }, [loadChatHistory]);

  // Scroll to bottom when messages update or bot is typing
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input and refresh history when chatbot opens
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      loadChatHistory();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen, loadChatHistory]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleResetChat = async () => {
    const prevSession = sessionId;
    const newSession = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    try {
      localStorage.setItem('darshan_chat_session_id', newSession);
    } catch (e) {
      /* ignore */
    }
    setSessionId(newSession);

    try {
      await fetch('/api/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: prevSession,
          userId: authUser?.id || authUser?._id || null
        })
      });
    } catch (e) {
      console.warn('Notice resetting server history:', e.message);
    }

    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: INITIAL_MESSAGE,
        time: getCurrentTime(),
        quickActions: QUICK_ACTIONS
      }
    ]);
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: text,
        time: getCurrentTime()
      }
    ];

    setMessages(newMessages);
    if (!textToSend) {
      setInputValue('');
    }
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          userId: authUser?.id || authUser?._id || null
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.reply) {
        const botReply = data.reply;
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: botReply.content || botReply.text,
            time: new Date(botReply.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            navAction: botReply.navAction || null,
            quickActions: (botReply.quickActions && botReply.quickActions.length > 0) ? botReply.quickActions : null
          }
        ]);
      } else {
        throw new Error(data.error || 'Failed to get bot reply');
      }
    } catch (error) {
      console.error('Chatbot API communication error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: '🙏 I am temporarily unable to reach the temple servers. Please check your connection or try again in a moment.',
          time: getCurrentTime(),
          quickActions: ['Explore Temples', 'Darshan Timings', 'Book Darshan']
        }
      ]);
    } finally {
      setIsTyping(false);
      if (!isOpen) {
        setHasUnread(true);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAction = (action) => {
    const route = getRouteForAction(action);
    handleNavigate(route);
  };

  return (
    <div className="dj-chatbot-root">
      {/* Floating Chatbot Launcher Button */}
      <div className="dj-chatbot-launcher-container">
        {!isOpen && (
          <div className="dj-launcher-tooltip">
            <span>Ask Darshan Assistant</span>
          </div>
        )}

        <button
          className={`dj-chatbot-launcher-btn ${isOpen ? 'is-open' : ''}`}
          onClick={handleToggle}
          aria-label={isOpen ? "Close Darshan Assistant" : "Open Darshan Assistant"}
          title="Darshan Journey Assistant"
        >
          <div className="dj-launcher-pulse" />
          
          <div className="dj-launcher-icon-wrapper">
            {isOpen ? (
              <X size={24} strokeWidth={2.5} />
            ) : (
              <MessageSquare size={24} strokeWidth={2} />
            )}
          </div>

          {hasUnread && !isOpen && (
            <span className="dj-launcher-badge">1</span>
          )}
        </button>
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="dj-chatbot-window" role="dialog" aria-label="Darshan Journey Assistant Chat">
          {/* Header */}
          <div className="dj-chatbot-header">
            <div className="dj-chatbot-header-left">
              <div className="dj-chatbot-avatar">
                <Sparkles size={18} />
              </div>
              <div className="dj-chatbot-title-info">
                <span className="dj-chatbot-title">Darshan Journey Assistant</span>
                <span className="dj-chatbot-subtitle">Your spiritual journey, simplified</span>
              </div>
            </div>

            <div className="dj-chatbot-header-actions">
              <button 
                className="dj-chatbot-icon-btn" 
                onClick={handleResetChat}
                title="Restart Conversation"
                aria-label="Restart Conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                className="dj-chatbot-icon-btn" 
                onClick={handleClose}
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="dj-chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`dj-message-group ${msg.sender}`}>
                <div className="dj-message-bubble">
                  <div className="dj-message-text">{msg.text}</div>

                  {/* Optional Navigation Action button inside bot message */}
                  {msg.navAction && (
                    <button 
                      className="dj-nav-link-btn"
                      onClick={() => handleNavigate(msg.navAction.path)}
                    >
                      <span>{msg.navAction.label}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>

                <span className="dj-message-time">{msg.time}</span>

                {/* Quick Action Chips */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="dj-action-chips-container">
                    {msg.quickActions.map((action, idx) => (
                      <button
                        key={`action-${idx}`}
                        className="dj-chip-btn"
                        onClick={() => handleQuickAction(action)}
                      >
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="dj-typing-indicator" aria-label="Assistant is typing...">
                <div className="dj-typing-dot" />
                <div className="dj-typing-dot" />
                <div className="dj-typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="dj-chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              className="dj-chatbot-input"
              placeholder="Ask about temples, timings, pooja..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message Input"
            />
            <button
              className="dj-chatbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
