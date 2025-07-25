"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { MessageSquare, Send, X, Bot, User, LoaderCircle, Map, Sparkles } from 'lucide-react';
import { gbalaChatbot, GbalaChatbotOutput } from '@/ai/flows/gbala-chatbot-flow';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  action?: GbalaChatbotOutput['action'];
}

const suggestions = [
    "What's the flood risk today?",
    "Find plastic recycling near me",
    "Where can I dump e-waste?",
    "What can be recycled?",
];

export function Chatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = async (messageOverride?: string) => {
    const query = messageOverride || input;
    if (query.trim() === '' || isLoading) return;

    const userMessage: Message = { text: query, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
       const history = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'model' as const,
          content: msg.text,
        }));
        
      const result = await gbalaChatbot({ history: history, query: query });
      const botMessage: Message = { text: result.response, sender: 'bot', action: result.action };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        text: "I'm having a little trouble right now. Please try again later.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleSend();
    }
  };

  const handleActionClick = (action: Message['action']) => {
    if (!action) return;

    if (action.type === 'VIEW_DUMP_SITES') {
      router.push(`/dump-sites?filter=${action.filter}`);
      setIsOpen(false);
    }
  }


  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {isOpen ? (
                 <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                 >
                    <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-lg">Gbala Assistant</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-grow p-0 overflow-y-auto">
                        <ScrollArea className="h-full" ref={scrollAreaRef}>
                            <div className="p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                                           <Sparkles className="w-8 h-8"/>
                                           <p className="text-sm font-medium">What can I help you with today?</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {suggestions.map((s, i) => (
                                                <Button 
                                                    key={i} 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-auto text-wrap"
                                                    onClick={() => handleSend(s)}
                                                >
                                                    {s}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                      <div className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                          {msg.sender === 'bot' && (
                                              <Avatar className="w-6 h-6">
                                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs"><Bot size={14}/></AvatarFallback>
                                              </Avatar>
                                          )}
                                          <div className={`p-3 rounded-xl max-w-[80%] text-sm break-words whitespace-pre-wrap ${
                                              msg.sender === 'user' 
                                              ? 'bg-primary text-primary-foreground rounded-br-none'
                                              : 'bg-secondary rounded-bl-none'
                                          }`}>
                                              {msg.text}
                                          </div>
                                          {msg.sender === 'user' && (
                                              <Avatar className="w-6 h-6">
                                                  <AvatarFallback><User size={14} /></AvatarFallback>
                                              </Avatar>
                                          )}
                                      </div>
                                       {msg.sender === 'bot' && msg.action && (
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="ml-9"
                                            onClick={() => handleActionClick(msg.action)}
                                          >
                                            <Map className="mr-2 h-4 w-4" />
                                            View on Map
                                          </Button>
                                      )}
                                    </div>
                                ))}
                                {isLoading && (
                                     <div className="flex items-start gap-3">
                                         <Avatar className="w-6 h-6">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs"><Bot size={14}/></AvatarFallback>
                                        </Avatar>
                                        <div className="p-3 rounded-xl max-w-[80%] bg-secondary rounded-bl-none">
                                            <LoaderCircle className="w-4 h-4 animate-spin"/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                        <div className="relative w-full">
                            <Textarea 
                                placeholder="Ask about flood risk..." 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isLoading}
                                className="pr-12 resize-none"
                                rows={1}
                            />
                            <Button size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={() => handleSend()} disabled={isLoading}>
                                <Send className="h-4 w-4"/>
                            </Button>
                        </div>
                    </CardFooter>
                    </Card>
                 </motion.div>
            ) : (
                <Button className="rounded-full w-16 h-16 shadow-lg" onClick={() => setIsOpen(true)}>
                    <MessageSquare className="w-8 h-8"/>
                </Button>
            )}
        </AnimatePresence>
      </div>
    </>
  );
}
