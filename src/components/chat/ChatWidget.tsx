"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { XMarkIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import swal from "@/lib/swal";

type Message = {
    id: string;
    sender: "USER" | "ADMIN";
    content: string;
    createdAt: string;
}

type Ticket = {
    id: string;
    topic: string;
    discordThreadId: string;
    status: string;
    messages: Message[];
}

const TOPICS = [
    { id: "payment", label: "Payment Issues (ชำระเงินไม่ได้)", icon: "💳" },
    { id: "credit", label: "Credit not received (เครดิตไม่เข้า)", icon: "💰" },
    { id: "download", label: "Download Issues (Download ไม่ได้)", icon: "📥" },
    { id: "login", label: "Login Issues (Login ไม่ได้)", icon: "🔐" },
    { id: "register", label: "Registration Issues (สมัครสมาชิกไม่ได้)", icon: "📝" },
    { id: "general", label: "General Inquiries (ติดต่อสอบถาม)", icon: "💬" },
];

export function ChatWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<"TOPICS" | "CHAT">("TOPICS");
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Poll for updates if chat is open and ticket exists
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && session?.user) {
            fetchTicket(); // Initial fetch
            interval = setInterval(fetchTicket, 3000); // Poll every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isOpen, session]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket?.messages]);

    const fetchTicket = async () => {
        try {
            const res = await fetch("/api/chat");
            const data = await res.json();
            if (data.ticket) {
                setTicket(data.ticket);
                // If ticket exists, jump to chat view, unless we want to allow starting NEW ticket explicitly?
                // For now, if active ticket exists, show it.
                setView("CHAT");
            }
        } catch (error) {
            console.error("Failed to fetch ticket", error);
        }
    };

    const handleTopicSelect = (topicLabel: string) => {
        setSelectedTopic(topicLabel);
        setView("CHAT");
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim()) return;

        // If no topic selected and no existing ticket, user must select topic
        if (!ticket && !selectedTopic) {
            setView("TOPICS");
            return;
        }

        const currentMessage = message;
        setMessage(""); // Optimistic clear
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: currentMessage,
                    topic: selectedTopic || ticket?.topic, // Use selected or existing
                    ticketId: ticket?.id
                }),
            });

            if (res.ok) {
                const newMessage = await res.json();
                // We'll let the poll update the list, or optimistic update:
                fetchTicket();
            } else {
                // Handle error (maybe restore message)
                console.error("Send failed");
                setMessage(currentMessage);
            }
        } catch (error) {
             console.error("Send error", error);
             setMessage(currentMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndChat = async () => {
        const confirmed = await swal.confirm("ยืนยันจบการสนทนา", "คุณต้องการปิดแชทนี้ใช่หรือไม่?");
        if (!confirmed) return;
        
        try {
            await fetch("/api/chat/close", { method: "POST" });
            swal.success("จบการสนทนาเรียบร้อย");
            setTicket(null);
            setSelectedTopic(null);
            setView("TOPICS");
        } catch (error) {
            console.error("Failed to close chat", error);
            swal.error("เกิดข้อผิดพลาดในการปิดแชท");
        }
    };

    if (!session?.user) return null; // Only for logged-in users

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {view === "CHAT" && !ticket && (
                                <button onClick={() => setView("TOPICS")} className="text-gray-400 hover:text-white mr-1">
                                    <ArrowLeftIcon className="w-4 h-4" />
                                </button>
                            )}
                            <h3 className="font-semibold text-white">
                                {ticket ? `Ticket #${ticket.id.slice(-4)}` : "Support Chat"}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                             {ticket && view === "CHAT" && (
                                <button 
                                    onClick={handleEndChat}
                                    className="text-xs bg-red-600/20 text-red-500 px-2 py-1 rounded hover:bg-red-600/30 transition border border-red-600/30"
                                >
                                    End Chat
                                </button>
                             )}
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-950/50 relative scrollbar-hide">
                        {view === "TOPICS" ? (
                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm mb-4 text-center">Please select a topic to start chatting</p>
                                {TOPICS.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTopicSelect(t.label)}
                                        className="w-full text-left p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 transition flex items-center gap-3 group"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">{t.icon}</span>
                                        <span className="text-sm font-medium text-gray-200">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* System Message */}
                                <div className="flex justify-center">
                                    <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded-full">
                                        {ticket ? `Topic: ${ticket.topic}` : `Starting chat: ${selectedTopic}`}
                                    </span>
                                </div>

                                {ticket?.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                                msg.sender === "USER"
                                                    ? "bg-indigo-600 text-white rounded-tr-sm"
                                                    : "bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700"
                                            }`}
                                        >
                                            <p>{msg.content}</p>
                                            <div
                                                className={`text-[10px] mt-1 opacity-50 ${
                                                    msg.sender === "USER" ? "text-right" : "text-left"
                                                }`}
                                            >
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area (Only in Chat View) */}
                    {view === "CHAT" && (
                        <form onSubmit={handleSendMessage} className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={ticket?.status === 'CLOSED' ? "This chat is closed." : "Type a message..."}
                                className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                                disabled={isLoading || ticket?.status === 'CLOSED'}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !message.trim() || ticket?.status === 'CLOSED'}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105"
            >
                {isOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                ) : (
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                )}
                {/* Notification Badge (Optional - can be added later) */}
            </button>
        </div>
    );
}
