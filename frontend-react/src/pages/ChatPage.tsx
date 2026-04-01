import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, FileText, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { courseAPI, qaAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

interface Course {
  id: number;
  name: string;
  description: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.list();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedCourse || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await qaAPI.askSimple(selectedCourse, userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get response');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-8">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-700/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AcadAI</h1>
            <p className="text-dark-400">Ask anything about your course materials</p>
          </div>
        </div>
        
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-neon-blue/50 outline-none min-w-[200px]"
        >
          <option value="" disabled>Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-3xl flex items-center justify-center mb-6 animate-float">
                <Bot className="w-10 h-10 text-neon-blue" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">How can I help you today?</h2>
              <p className="text-dark-400 max-w-md mb-8">
                Ask me anything about your course materials. I'll search through your documents 
                and provide accurate, helpful answers.
              </p>
              
              {/* Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {[
                  "Explain the key concepts",
                  "Summarize the main topics",
                  "What are the important formulas?",
                  "Help me understand this theory"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="glass rounded-xl px-4 py-3 text-left text-dark-200 hover:text-white hover:border-neon-blue/30 transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 message-appear",
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-neon-purple to-neon-pink'
                        : 'bg-gradient-to-br from-neon-blue to-cyan-400'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-5 py-4",
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 rounded-tr-sm'
                        : 'bg-dark-800/80 border border-dark-700/50 rounded-tl-sm'
                    )}
                  >
                    <p className="text-dark-100 whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-dark-600/50">
                        <p className="text-xs text-dark-400 mb-2 font-medium">📚 Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.sources.map((source, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 text-xs bg-dark-700/50 text-dark-300 px-3 py-1.5 rounded-lg"
                            >
                              <FileText className="w-3 h-3" />
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-4 message-appear">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-cyan-400 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-dark-800/80 border border-dark-700/50 rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-neon-blue rounded-full typing-dot"></div>
                        <div className="w-2.5 h-2.5 bg-neon-blue rounded-full typing-dot"></div>
                        <div className="w-2.5 h-2.5 bg-neon-blue rounded-full typing-dot"></div>
                      </div>
                      <span className="text-dark-400 text-sm ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl message-appear">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-dark-700/50 p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedCourse ? "Ask a question..." : "Select a course first"}
              rows={1}
              className="input-chat pr-14 resize-none"
              disabled={!selectedCourse || isLoading}
              style={{ minHeight: '60px', maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || !selectedCourse || isLoading}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                input.trim() && selectedCourse && !isLoading
                  ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-glow hover:shadow-glow-lg"
                  : "bg-dark-700 text-dark-500"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-center text-dark-500 text-xs mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
