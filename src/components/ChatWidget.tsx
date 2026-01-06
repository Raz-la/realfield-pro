'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, AlertTriangle, Building2, Paperclip } from 'lucide-react';
import { useParams, usePathname } from 'next/navigation';
import { useProject } from '@/hooks/useFirestore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string | null;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Context Awareness Logic
    const params = useParams();
    const pathname = usePathname();
    const projectId = params?.id as string | undefined;
    const isProjectPage = pathname?.includes('/projects/') && !!projectId;

    // Fetch project data if on a project page
    const { project } = useProject(projectId || '');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMessage = input.trim();
        const imageToSend = selectedImage;

        setInput('');
        setSelectedImage(null);
        setError(null);

        // Add user message
        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            image: imageToSend
        }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    image: imageToSend,
                    projectContext: isProjectPage && project ? project : null
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            // Add AI response
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
            console.error('Chat error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Bubble Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-bronze to-[#cd5c0e] shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                    >
                        <MessageCircle className="w-8 h-8 text-white" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-magma rounded-full animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] flex flex-col glass rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-bronze to-[#cd5c0e] px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">RealField Expert</h3>
                                    <p className="text-xs text-white/80">
                                        {isProjectPage && project ? `Project: ${project.name}` : 'Construction AI Assistant'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-zinc-400 mt-8">
                                    {isProjectPage && project ? (
                                        <>
                                            <Building2 className="w-16 h-16 mx-auto mb-4 text-bronze opacity-80" />
                                            <p className="text-sm font-semibold text-zinc-300">
                                                Context Active: {project.name}
                                            </p>
                                            <p className="text-xs mt-2 max-w-[200px] mx-auto">
                                                שאל אותי על תאריכים, תקציב, או חריגות בפרויקט זה.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-sm">שלום! אני העוזר החכם שלך.</p>
                                            <p className="text-xs mt-2">
                                                שאל אותי על תקנים, בטיחות, או נהלי בנייה.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-bronze text-white'
                                            : 'bg-basalt/80 text-gray-100'
                                            }`}
                                    >
                                        {/* Check for safety warnings */}
                                        {message.role === 'assistant' && message.content.toLowerCase().includes('stop work') && (
                                            <div className="flex items-center gap-2 mb-2 text-red-400 font-semibold">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span className="text-xs">CRITICAL SAFETY ALERT</span>
                                            </div>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-basalt/80 rounded-2xl px-4 py-3">
                                        <Loader2 className="w-5 h-5 text-bronze animate-spin" />
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-bronze/20">

                            {/* Image Preview in Input */}
                            {selectedImage && (
                                <div className="relative inline-block mb-2">
                                    <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-bronze/50" />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute -top-2 -right-2 bg-basalt rounded-full p-1 border border-white/20 hover:bg-red-500/80 transition-colors"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-12 h-12 rounded-lg bg-basalt/50 border border-bronze/30 hover:bg-bronze/20 transition-colors flex items-center justify-center group"
                                    title="Add Photo"
                                >
                                    <Paperclip className="w-5 h-5 text-gray-400 group-hover:text-bronze transition-colors" />
                                </button>

                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={selectedImage ? "Describe this photo..." : (isProjectPage ? "שאל על הפרויקט (תקציב, לו״ז)..." : "שאל על תקני בנייה ובטיחות...")}
                                    className="flex-1 bg-basalt/50 border border-bronze/30 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-bronze transition-colors"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSend()} // Wrap to match signature
                                    disabled={(!input.trim() && !selectedImage) || isLoading}
                                    className="w-12 h-12 rounded-lg bg-bronze hover:bg-[#cd5c0e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
