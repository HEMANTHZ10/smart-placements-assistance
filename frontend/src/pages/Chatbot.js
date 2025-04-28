import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Sparkles, HelpCircle, TrendingUp, Building2, GraduationCap } from 'lucide-react';

const predefinedQA = [
  {
    question: "What companies hire the most students?",
    answer: "TCS, Infosys, and Wipro consistently hire the most students. This year, TCS hired 45, Infosys 38, and Wipro 32."
  },
  {
    question: "Which sector has the highest placement rate?",
    answer: "The IT sector has the highest placement rate at 45%, followed by Finance at 20%."
  },
  {
    question: "How to prepare for interviews?",
    answer: "Focus on core subjects, practice coding problems, work on communication skills, and prepare for behavioral questions. Mock interviews can be very helpful."
  },
  {
    question: "What is the average package?",
    answer: "The average package for this year is 8.5 LPA. The highest package offered is 45 LPA."
  }
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your VNR Placement Assistant. How can I help you today?", 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage = { id: messages.length + 1, text: inputValue, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(inputValue);
      setMessages(prev => [...prev, { id: prev.length + 1, text: response, sender: 'bot', timestamp: new Date() }]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    for (const qa of predefinedQA) {
      if (lowerQuery.includes(qa.question.toLowerCase())) {
        return qa.answer;
      }
    }
    return "I'm not sure about that. Could you try asking something else? You can also check out the suggested questions below.";
  };

  const handleQuickQuestionClick = (question) => {
    setInputValue(question);
    const inputElement = document.getElementById('chat-input');
    if (inputElement) inputElement.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Placement Assistant</h1>
              <p className="text-gray-500">Get instant answers to your placement-related questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full px-4 py-6 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map(msg => (
              <div key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}
                  >
                    {msg.sender === 'user' 
                      ? <User className="h-4 w-4 text-white" />
                      : <Bot className="h-4 w-4 text-gray-700" />
                    }
                  </div>
                  <div className={`py-3 px-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="py-4 border-t border-gray-200 bg-white rounded-t-xl mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 px-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Suggested Questions
            </h3>
            <div className="flex flex-wrap gap-2">
              {predefinedQA.map((qa, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestionClick(qa.question)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                    hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    border border-gray-200 text-gray-700"
                >
                  {idx === 0 && <Building2 className="h-4 w-4" />}
                  {idx === 1 && <TrendingUp className="h-4 w-4" />}
                  {idx === 2 && <HelpCircle className="h-4 w-4" />}
                  {idx === 3 && <GraduationCap className="h-4 w-4" />}
                  {qa.question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="relative bg-white rounded-b-xl border-t border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  id="chat-input"
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl
                  hover:from-indigo-600 hover:to-purple-700 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;