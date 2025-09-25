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
      // Simulate AI response with Perplexity-style formatting
      const response = await simulateAIResponse(message.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('AI Helper Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Simulate AI response (replace with actual Perplexity API call)
  const simulateAIResponse = async (query: string): Promise<{ content: string; sources: string[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Generate contextual responses based on query keywords
    let content = '';
    let sources: string[] = [];

    if (query.toLowerCase().includes('quantum')) {
      content = `# Quantum Physics for Beginners

**Quantum physics** is the study of matter and energy at the smallest scales, where particles behave very differently from our everyday experience.

## Key Concepts:

### 1. **Wave-Particle Duality**
- Particles like electrons and photons exhibit both wave and particle properties
- This depends on how we observe them

### 2. **Uncertainty Principle**
- We cannot know both the exact position and momentum of a particle simultaneously
- Formulated by Werner Heisenberg

### 3. **Superposition**
- Particles can exist in multiple states simultaneously until observed
- Famous example: Schrödinger's cat thought experiment

### 4. **Quantum Entanglement**
- Particles can be connected across vast distances
- Measuring one instantly affects the other

## Study Tips:
- Start with basic concepts before diving into mathematical formulations
- Use visual analogies and thought experiments
- Practice with simple quantum mechanics problems`;

      sources = [
        "Introduction to Quantum Mechanics - MIT OpenCourseWare",
        "Quantum Physics for Dummies - Steven Holzner",
        "The Feynman Lectures on Physics - Volume III"
      ];

    } else if (query.toLowerCase().includes('comptia') || query.toLowerCase().includes('a+')) {
      content = `# CompTIA A+ Study Plan

## Overview
The **CompTIA A+** certification validates foundational IT skills and is an excellent entry point for IT careers.

## Study Timeline (8-12 weeks)

### Weeks 1-3: Hardware Fundamentals
- **Core 1 (220-1101)**: Hardware, mobile devices, networking
- Focus areas: CPU, RAM, storage devices, motherboards
- **Practice**: Hands-on hardware identification

### Weeks 4-6: Operating Systems & Software
- Windows, macOS, Linux basics
- Installation, configuration, troubleshooting
- **Practice**: Virtual machines for OS practice

### Weeks 7-9: Security & Networking
- **Core 2 (220-1102)**: Security, software troubleshooting
- Network protocols, wireless security
- **Practice**: Network configuration labs

### Weeks 10-12: Final Review & Practice Exams
- Take multiple practice exams
- Review weak areas
- **Target**: 85%+ on practice exams before real exam

## Recommended Resources:
- Professor Messer's free videos
- Official CompTIA study guides
- Practice exams from MeasureUp or Boson`;

      sources = [
        "CompTIA A+ Official Study Guide",
        "Professor Messer's CompTIA A+ Training",
        "CompTIA Official Website - A+ Certification"
      ];

    } else if (query.toLowerCase().includes('react') && query.toLowerCase().includes('angular')) {
      content = `# React vs Angular: Key Differences

## **React** (Library)
### Pros:
- **Flexibility**: More freedom in architecture choices
- **Learning Curve**: Easier to get started
- **Performance**: Virtual DOM for efficient updates
- **Ecosystem**: Vast community and third-party libraries

### Cons:
- Requires additional libraries for full functionality
- Less opinionated structure

## **Angular** (Framework)
### Pros:
- **Complete Framework**: Built-in routing, HTTP client, forms
- **TypeScript**: First-class TypeScript support
- **Structure**: Opinionated, consistent project structure
- **Enterprise**: Great for large-scale applications

### Cons:
- **Learning Curve**: Steeper learning curve
- **Complexity**: Can be overkill for simple projects

## **When to Choose:**

### Choose React if:
- Building flexible, component-based UIs
- Want lighter weight solution
- Prefer gradual adoption
- Team prefers JavaScript flexibility

### Choose Angular if:
- Building large enterprise applications
- Want comprehensive out-of-the-box features
- Team prefers structured, opinionated approach
- TypeScript is preferred`;

      sources = [
        "React Official Documentation",
        "Angular Official Documentation",
        "State of JS Survey - Frontend Frameworks"
      ];

    } else {
      // Generic helpful response
      content = `I'd be happy to help you with that topic! 

To provide you with the most accurate and helpful information, could you please:

1. **Be more specific** about what aspect you'd like to focus on
2. **Share your current level** of knowledge on this topic
3. **Let me know** if you're preparing for a specific exam or certification

I can help with:
- 📚 **Study plans** and learning schedules
- 🧠 **Concept explanations** in simple terms  
- 📝 **Practice questions** and flashcards
- 🎯 **Exam preparation** strategies
- 💡 **Memory techniques** and study tips

What specific area would you like to explore first?`;

      sources = [
        "Evidence-based Learning Techniques - Cognitive Science",
        "Study Strategies for Academic Success",
        "Educational Psychology Research"
      ];
    }

    return { content, sources };
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