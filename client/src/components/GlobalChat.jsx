import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Square, X, Image as ImageIcon, FileText, Camera, Activity, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const GlobalChat = ({ employeeId, roomLabel, recipient }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const isFetchingRef = useRef(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        setMessages([]); // Clear previous chat context immediately
        if (employeeId) {
            fetchMessages();
            // Faster polling for better responsiveness (3 seconds)
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
            console.log(`[ChatDebug] Polling messages for room: ${employeeId}`);
            const res = await api.get(`chat/${employeeId}`);
            setMessages(prev => {
                // Only update if message count changed or if loading for the first time
                if (loading || res.data.length !== prev.length) {
                    console.log(`[ChatDebug] Syncing ${res.data.length} messages`);
                    return res.data;
                }
                return prev;
            });

            if (loading) {
                setTimeout(scrollToBottom, 100);
            }
            setLoading(false);
        } catch (error) {
            console.error('[GlobalChat] Fetch Error:', error);
            if (loading) toast.error('Failed to load chat history');
            setLoading(false);
        } finally {
            isFetchingRef.current = false;
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setAudioBlob(null);
        }
    };

    const clearAttachment = () => {
        setSelectedFile(null);
        setAudioBlob(null);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlobData = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlobData);
                setSelectedFile(null);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            toast.error('Microphone access denied or unavailable.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() && !selectedFile && !audioBlob) return;

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('content', newMessage.trim());

            if (selectedFile) {
                formData.append('attachment', selectedFile);
            } else if (audioBlob) {
                formData.append('attachment', audioBlob, 'voicenote.webm');
                formData.append('attachmentType', 'voice');
            }

            if (recipient) {
                formData.append('recipient', recipient);
            }

            const res = await api.post(`chat/${employeeId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessages([...messages, res.data]);
            setNewMessage('');
            setSelectedFile(null);
            setAudioBlob(null);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Ensure leading slash for server static route
        return url.startsWith('/') ? url : `/uploads/${url}`;
    };

    if (!employeeId) {
        return <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 h-full flex items-center justify-center">Select an employee to start chatting</div>;
    }

    if (loading) {
        return <div className="p-4 text-center text-slate-500 text-sm animate-pulse h-full flex flex-col items-center justify-center">Loading chat...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[#efeae2] border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl relative">
            {/* WhatsApp Pattern Background Overlay */}
            <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
                style={{
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")`,
                    backgroundColor: '#efeae2'
                }}
            />

            {/* Header */}
            <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 p-5 shrink-0 shadow-sm z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-200">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-800 uppercase tracking-tight leading-tight">Comms Channel</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{roomLabel || 'Secure Node'}</p>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => { fetchMessages(); toast.success('Syncing Node...'); }}
                    className="p-3 hover:bg-sky-50 rounded-2xl text-slate-400 hover:text-sky-500 transition-all shrink-0 active:scale-90"
                    title="Force Sync"
                >
                    <Activity size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 custom-scrollbar scroll-smooth">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-white/50 backdrop-blur-sm rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-white">
                            <Send size={32} className="text-sky-300" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.2em]">Initiate Encrypted Transmission</p>
                    </div>
                ) : (
                    messages.reduce((acc, msg, idx) => {
                        const senderIdStr = String(msg.sender?._id || msg.sender).toLowerCase();
                        const userIdStr = String(user?._id || user?.id).toLowerCase();
                        const isMe = senderIdStr === userIdStr;
                        
                        // Grouping logic (simplified)
                        const prevMsg = idx > 0 ? messages[idx-1] : null;
                        const prevSender = prevMsg ? String(prevMsg.sender?._id || prevMsg.sender).toLowerCase() : null;
                        const isGrouped = prevSender === senderIdStr;

                        acc.push(
                            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isGrouped ? 'mt-1' : 'mt-4 animate-in fade-in slide-in-from-bottom-2'}`}>
                                <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%]`}>
                                    {!isMe && !isGrouped && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center shrink-0 mb-1 shadow-md border-2 border-white">
                                            <span className="text-[10px] font-black text-white">
                                                {msg.senderName?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${!isMe && isGrouped ? 'ml-10' : ''}`}>
                                        {!isMe && !isGrouped && (
                                            <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-1 ml-2">{msg.senderName}</span>
                                        )}

                                        <div className={`relative px-4 py-2.5 shadow-sm ${isMe
                                            ? 'bg-[#dcf8c6] text-slate-800 rounded-2xl rounded-tr-none border border-[#c6e9a7]'
                                            : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100'
                                            }`}>
                                            {/* Tale for bubbles */}
                                            {!isGrouped && (
                                                <div className={`absolute top-0 w-3 h-3 ${isMe 
                                                    ? 'right-[-6px] bg-[#dcf8c6] rotate-45 border-r border-t border-[#c6e9a7]' 
                                                    : 'left-[-6px] bg-white rotate-45 border-l border-t border-slate-100'}`} 
                                                />
                                            )}

                                            {msg.content && <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>}

                                            {/* Attachments */}
                                            {msg.attachmentUrl && (
                                                <div className={`mt-2 ${msg.content ? 'pt-2 border-t border-black/5' : ''}`}>
                                                    {msg.attachmentType === 'image' && (
                                                        <a href={getFullUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border border-black/5">
                                                            <img src={getFullUrl(msg.attachmentUrl)} alt="Attachment" className="max-w-full max-h-[300px] object-cover transition-transform group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <ImageIcon size={24} className="text-white drop-shadow-md" />
                                                            </div>
                                                        </a>
                                                    )}
                                                    {msg.attachmentType === 'voice' && (
                                                        <div className="bg-black/5 p-2 rounded-xl flex items-center gap-3">
                                                            <Mic size={16} className="text-sky-500" />
                                                            <audio controls src={getFullUrl(msg.attachmentUrl)} className="max-w-[180px] h-8" />
                                                        </div>
                                                    )}
                                                    {msg.attachmentType === 'document' && (
                                                        <a href={getFullUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-black/5 rounded-xl hover:bg-black/10 transition-all border border-black/10">
                                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                                <FileText size={20} className="text-sky-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-black text-slate-700 truncate">DOCUMENT.NODE</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Secure Download</p>
                                                            </div>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                <span className="text-[8px] font-black tabular-nums">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && <Activity size={8} className="animate-pulse" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                        return acc;
                    }, [])
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f2f5] p-3 shrink-0 z-10 border-t border-slate-200">
                {(selectedFile || audioBlob) && (
                    <div className="flex items-center justify-between p-3 mb-3 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
                                {selectedFile ? (
                                    selectedFile.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />
                                ) : (
                                    <Mic size={20} className="text-rose-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-slate-800 truncate">{selectedFile ? selectedFile.name : 'VOICE_TRANSCRIPT.node'}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : 'Ready for Transmission'}</p>
                            </div>
                        </div>
                        <button onClick={clearAttachment} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90">
                            <X size={18} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-6xl mx-auto">
                    <div className="flex gap-1">
                        <label className="p-3 text-slate-500 hover:text-sky-600 hover:bg-white rounded-full cursor-pointer transition-all active:scale-90">
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                            <Paperclip size={22} />
                        </label>
                        <label className="p-3 text-slate-500 hover:text-sky-600 hover:bg-white rounded-full cursor-pointer transition-all active:scale-90">
                            <input type="file" capture="environment" className="hidden" onChange={handleFileChange} accept="image/*" />
                            <Camera size={22} />
                        </label>
                    </div>

                    <div className="flex-1 bg-white rounded-[2rem] flex items-center px-4 py-1.5 shadow-sm border border-slate-200 focus-within:border-sky-500 transition-colors">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isRecording ? "Recording encrypted audio..." : "Type a message..."}
                            disabled={isRecording}
                            className={`flex-1 bg-transparent border-none py-2 px-1 focus:ring-0 text-[13px] font-medium ${isRecording ? 'text-rose-500 italic' : 'text-slate-800'}`}
                        />
                        
                        {!newMessage.trim() && !selectedFile && !audioBlob ? (
                            <button
                                type="button"
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onMouseLeave={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                className={`p-2 rounded-full transition-all ${isRecording ? 'text-rose-500 animate-pulse bg-rose-50' : 'text-slate-400 hover:text-sky-500'}`}
                                title="Hold to record"
                            >
                                {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                            </button>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={sending || (!newMessage.trim() && !selectedFile && !audioBlob)}
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-90 ${
                            sending || (!newMessage.trim() && !selectedFile && !audioBlob)
                            ? 'bg-slate-300 text-slate-100 cursor-not-allowed'
                            : 'bg-[#128c7e] text-white hover:bg-[#075e54] shadow-[#128c7e]/20'
                        }`}
                    >
                        <Send size={22} className={sending ? 'animate-pulse' : ''} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GlobalChat;
