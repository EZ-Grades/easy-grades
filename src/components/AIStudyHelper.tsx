import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  X, 
  MessageSquare, 
  BookOpen, 
  Brain, 
  Lightbulb,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { getStudyAssistance, isPerplexityConfigured, getConfigurationError } from '../services/perplexityService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface AIStudyHelperProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const SUGGESTED_PROMPTS = [
  "Explain quantum physics concepts for beginners",
  "Help me create a study plan for CompTIA A+ certification",
  "What are the key differences between React and Angular?",
  "Summarize the main points of project management methodologies",
  "Create flashcards for medical terminology",
  "Explain financial ratios used in business analysis"
];

export function AIStudyHelper({ className = '', isOpen = false, onClose }: AIStudyHelperProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Study Helper. I can help you with explanations, study plans, practice questions, and more. What would you like to learn about today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (message: string = inputMessage) => {
    if (!message.trim() || isLoading) return;

    // Check if Perplexity is configured
    if (!isPerplexityConfigured()) {
      toast.error(getConfigurationError());
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Call real Perplexity API
      const { data, error } = await getStudyAssistance(
        message.trim(),
        undefined,
        conversationHistory
      );

      if (error || !data) {
        throw new Error(error || 'Failed to get AI response');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      console.error('AI Helper Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(error.message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };



  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard!');
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Study Helper. I can help you with explanations, study plans, practice questions, and more. What would you like to learn about today?",
      timestamp: new Date(),
    }]);
    toast.success('Chat cleared!');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 ${className}`}
    >
      <Card className="w-full max-w-4xl h-[80vh] glassmorphism border-0 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Bot className="w-6 h-6 text-primary-solid" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            AI Study Helper
            <Badge variant="outline" className="ml-2">
              Powered by AI
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearChat}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-solid to-secondary-solid flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary-solid text-white' : 'bg-muted/50'} rounded-lg p-4 space-y-3`}>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {message.content.split('\n').map((line, index) => {
                        if (line.startsWith('# ')) {
                          return <h1 key={index} className="text-lg font-bold mt-4 mb-2">{line.slice(2)}</h1>;
                        } else if (line.startsWith('## ')) {
                          return <h2 key={index} className="text-base font-semibold mt-3 mb-2">{line.slice(3)}</h2>;
                        } else if (line.startsWith('### ')) {
                          return <h3 key={index} className="text-sm font-semibold mt-2 mb-1">{line.slice(4)}</h3>;
                        } else if (line.startsWith('- ')) {
                          return <li key={index} className="ml-4">{line.slice(2)}</li>;
                        } else if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={index} className="font-semibold">{line.slice(2, -2)}</p>;
                        } else if (line.trim()) {
                          return <p key={index}>{line}</p>;
                        }
                        return <br key={index} />;
                      })}
                    </div>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="border-t border-muted-foreground/20 pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                              <BookOpen className="w-3 h-3 flex-shrink-0" />
                              {source}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-muted-foreground/10">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {message.type === 'assistant' && (
                          <>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary-solid to-highlight-solid flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">U</span>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-solid to-secondary-solid flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground">Try asking about:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(prompt)}
                    className="text-xs h-7"
                    disabled={isLoading}
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your studies..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            AI responses are generated and may not always be accurate. Please verify important information.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}