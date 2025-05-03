import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your VNR Placement Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchChatbotResponse = async (query) => {
    try {
      const response = await axios.get("/chatbot/get-chatbot-answer", {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      return "I'm sorry, but I'm having trouble processing your request right now. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Get bot response
      const response = await fetchChatbotResponse(inputValue);

      // Add bot message
      // Add bot message (format object properly if needed)
      const botMessage =
        typeof response === "object" && response !== null
          ? response.answer
          : response;

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: botMessage,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "I apologize, but I'm having trouble connecting to my knowledge base. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
              <h1 className="text-2xl font-bold text-gray-900">
                AI Placement Assistant
              </h1>
              <p className="text-gray-500">
                Get instant answers to your placement-related questions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full px-4 py-6 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[80%] ${
                    msg.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-700" />
                    )}
                  </div>
                  <div
                    className={`py-3 px-4 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="text-sm prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    {/* <p className="text-sm whitespace-pre-wrap">{msg.text}</p> */}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="relative bg-white rounded-xl border border-gray-200 p-4 mt-4">
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
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl
                  hover:from-indigo-600 hover:to-purple-700 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isTyping ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
