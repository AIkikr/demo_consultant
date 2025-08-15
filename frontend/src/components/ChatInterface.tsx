'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useChatStore } from '../lib/store';
import { APIClient } from '../lib/api';
import { Message, AIResponse } from '../lib/store';
import { ModeIndicator } from './ModeIndicator';
import { AIResponseDisplay } from './AIResponseDisplay';

export function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    currentSession,
    isLoading,
    error,
    addMessage,
    addAIResponse,
    setLoading,
    setError,
    createNewSession,
  } = useChatStore();

  const apiClient = APIClient.getInstance();

  useEffect(() => {
    if (!currentSession) {
      createNewSession();
    }
  }, [currentSession, createNewSession]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !currentSession || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    // Add user message to store
    addMessage(userMessage);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendMessage({
        message: inputMessage.trim(),
        sessionId: currentSession.id,
      });

      if (response.success && response.data) {
        addAIResponse(response.data);
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }

    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleActionSelect = async (actionId: string) => {
    if (!currentSession || isLoading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendMessage({
        message: '',
        sessionId: currentSession.id,
        selectedAction: actionId,
      });

      if (response.success && response.data) {
        addAIResponse(response.data);
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!currentSession) {
    return (
      <div className=\"flex items-center justify-center h-full\">
        <div className=\"text-center\">
          <Loader2 className=\"w-8 h-8 animate-spin mx-auto mb-4\" />
          <p>Initializing chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"flex flex-col h-full bg-gray-50\">
      {/* Header with Mode Indicator */}
      <div className=\"border-b bg-white p-4 shadow-sm\">
        <div className=\"flex items-center justify-between\">
          <div className=\"flex items-center space-x-3\">
            <Bot className=\"w-8 h-8 text-blue-600\" />
            <div>
              <h1 className=\"text-xl font-bold text-gray-800\">InsightSmith</h1>
              <p className=\"text-sm text-gray-600\">AI Consultant Bot</p>
            </div>
          </div>
          <ModeIndicator mode={currentSession.currentMode} />
        </div>
      </div>

      {/* Messages Area */}
      <div className=\"flex-1 overflow-y-auto p-4 space-y-4\">
        {currentSession.messages.length === 0 ? (
          <div className=\"text-center text-gray-500 mt-8\">
            <Bot className=\"w-16 h-16 mx-auto mb-4 text-gray-300\" />
            <h2 className=\"text-xl font-semibold mb-2\">Welcome to InsightSmith!</h2>
            <p className=\"mb-4\">
              I'm your AI consultant, ready to help with idea creation and execution planning.
            </p>
            <div className=\"text-sm space-y-2\">
              <p><strong>Tip:</strong> Start your message with:</p>
              <ul className=\"list-disc list-inside space-y-1 text-left max-w-md mx-auto\">
                <li><strong>\"ガイドモードで\"</strong> - for gentle guidance</li>
                <li><strong>\"ソクラテス式で\"</strong> - for question-based coaching</li>
                <li><strong>\"ハードモードで\"</strong> - for tough feedback</li>
              </ul>
            </div>
          </div>
        ) : (
          currentSession.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'user' ? (
                <div className=\"flex items-start space-x-3 max-w-3xl\">
                  <div className=\"message-bubble user-message\">
                    <p className=\"text-gray-800\">{message.content}</p>
                  </div>
                  <div className=\"w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0\">
                    <User className=\"w-4 h-4 text-white\" />
                  </div>
                </div>
              ) : (
                <div className=\"flex items-start space-x-3 max-w-4xl\">
                  <div className=\"w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0\">
                    <Bot className=\"w-4 h-4 text-white\" />
                  </div>
                  <div className=\"message-bubble ai-message\">
                    <AIResponseDisplay 
                      response={JSON.parse(message.content) as AIResponse}
                      onActionSelect={handleActionSelect}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className=\"flex justify-start\">
            <div className=\"flex items-start space-x-3 max-w-4xl\">
              <div className=\"w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0\">
                <Bot className=\"w-4 h-4 text-white\" />
              </div>
              <div className=\"message-bubble ai-message\">
                <div className=\"flex items-center space-x-2\">
                  <Loader2 className=\"w-4 h-4 animate-spin\" />
                  <span className=\"text-gray-600\">InsightSmith is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className=\"flex justify-center\">
            <div className=\"bg-red-50 border border-red-200 rounded-lg p-4 max-w-md\">
              <p className=\"text-red-800 text-sm\">{error}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className=\"border-t bg-white p-4\">
        <form onSubmit={handleSubmit} className=\"flex space-x-4\">
          <input
            ref={inputRef}
            type=\"text\"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder=\"Type your message... (try starting with 'ガイドモードで' or 'ソクラテス式で')\"
            className=\"flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
            disabled={isLoading}
          />
          <button
            type=\"submit\"
            disabled={!inputMessage.trim() || isLoading}
            className=\"bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors\"
          >
            <Send className=\"w-5 h-5\" />
          </button>
        </form>
      </div>
    </div>
  );
}