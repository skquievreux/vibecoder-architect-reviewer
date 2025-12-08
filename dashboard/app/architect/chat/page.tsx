'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, Title, Text, Button } from "@tremor/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    html?: string;
    type?: 'text' | 'adr' | 'question';
};

export default function ArchitectChatPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm your AI Architect Advisor. Describe your new project idea, and I'll help you define the best architecture based on our portfolio standards.",
            type: 'text'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/ai/architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages
                })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                html: data.content, // Capture the HTML content
                type: data.type || 'text'
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I encountered an error analyzing your request. Please try again.",
                type: 'text'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-4 md:p-10 bg-slate-950 min-h-screen flex flex-col">
            <div className="mb-6">
                <Title className="text-3xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="text-violet-500" /> AI Architect Advisor
                </Title>
                <Text className="text-slate-400">
                    Define new projects compliant with our "Golden Paths" and portfolio standards.
                </Text>
            </div>

            <Card className="glass-card flex-1 flex flex-col min-h-[600px] relative overflow-hidden border-slate-800">
                <div className="flex-1 overflow-y-auto p-4 space-y-6 mb-20 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-violet-600' : 'bg-slate-600'
                                }`}>
                                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                            </div>

                            <div className={`max-w-[85%] md:max-w-3xl rounded-2xl p-5 ${msg.role === 'assistant'
                                ? 'bg-slate-800/50 border border-slate-700 text-slate-200'
                                : 'bg-violet-600 text-white'
                                }`}>
                                <div className="mb-2 prose prose-invert prose-sm max-w-none text-slate-200">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-1 mt-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                            code: ({ node, ...props }) => <code className="bg-slate-700/50 rounded px-1 py-0.5 text-sm font-mono text-violet-200" {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                {msg.type === 'adr' && msg.html && (
                                    <div className="prose prose-invert prose-sm max-w-none mt-4 pt-4 border-t border-slate-700">
                                        <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold">
                                            <FileText size={16} /> Architecture Decision Record
                                        </div>
                                        <div dangerouslySetInnerHTML={{ __html: msg.html }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Bot size={18} />
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800">
                    <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your project (e.g., 'I need a background worker for video processing')..."
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </Card>
        </main>
    );
}
