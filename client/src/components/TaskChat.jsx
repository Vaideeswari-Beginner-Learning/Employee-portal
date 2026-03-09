import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Square, X, Image as ImageIcon, FileText } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TaskChat = ({ taskId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        if (taskId) {
            fetchMessages();
            // Polling for new messages every 10 seconds could be added here,
            // or we just rely on manual refresh/re-open for now to keep it simple.
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
        }
    }, [taskId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/chat/${taskId}`);
            setMessages(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            // Don't toast on polling errors to avoid spam
            if (loading) toast.error('Failed to load chat history');
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setAudioBlob(null); // Clear audio if file is selected
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
                setSelectedFile(null); // Clear file if audio is recorded
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
                // Need to append with a filename so Express/Multer processes it correctly
                formData.append('attachment', audioBlob, 'voicenote.webm');
                formData.append('attachmentType', 'voice');
            }

            const res = await api.post(`/chat/${taskId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessages([...messages, res.data]);
            setNewMessage('');
            setSelectedFile(null);
            setAudioBlob(null);

            // Note: If using a real-time socket, emitting here would be ideal.
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
        // In local dev, points to 5001. In production, assumes same origin or proxy handles it.
        return `/uploads/${url}`;
    };

    if (loading) {
        return <div className="p-4 text-center text-slate-500 text-sm animate-pulse">Loading chat...</div>;
    }

    return (
        <div className="flex flex-col h-[500px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mt-6 shadow-sm">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 shrink-0">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Internal Chat & Support</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Communicate directly regarding this task.</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                            <Send size={24} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium">No messages yet.</p>
                        <p className="text-xs text-slate-400">Send a message to start the conversation.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                        return (
                            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-end gap-2 max-w-[85%]">
                                    {!isMe && (
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mb-1">
                                            <span className="text-[10px] font-bold text-blue-700">
                                                {msg.senderName.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {!isMe && <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1">{msg.senderName}</span>}

                                        <div className={`p-3 rounded-2xl ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-sm shadow-md shadow-blue-500/20'
                                                : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm'
                                            }`}>
                                            {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}

                                            {/* Attachments */}
                                            {msg.attachmentUrl && (
                                                <div className={`mt-2 ${msg.content ? 'pt-2 border-t border-white/20' : ''}`}>
                                                    {msg.attachmentType === 'image' && (
                                                        <a href={getFullUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer">
                                                            <img src={getFullUrl(msg.attachmentUrl)} alt="Attachment" className="max-w-[200px] max-h-[200px] rounded-xl object-cover" />
                                                        </a>
                                                    )}
                                                    {msg.attachmentType === 'voice' && (
                                                        <audio controls src={getFullUrl(msg.attachmentUrl)} className="max-w-[250px] h-10 mt-1" />
                                                    )}
                                                    {msg.attachmentType === 'document' && (
                                                        <a href={getFullUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/10 rounded-xl hover:bg-black/20 transition-colors">
                                                            <FileText size={16} />
                                                            <span className="text-xs font-medium underline underline-offset-2">View Document</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-bold text-slate-400 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-3 shrink-0">
                {/* Attachment Preview Container */}
                {(selectedFile || audioBlob) && (
                    <div className="flex items-center justify-between p-2 mb-2 bg-blue-50/50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {selectedFile ? (
                                <>
                                    {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} className="text-blue-500" /> : <FileText size={16} className="text-blue-500" />}
                                    <span className="text-xs font-medium text-blue-800 truncate">{selectedFile.name}</span>
                                </>
                            ) : (
                                <>
                                    <Mic size={16} className="text-red-500" />
                                    <span className="text-xs font-bold text-red-600">Voice Note Recorded ({Math.round(audioBlob.size / 1024)} KB)</span>
                                    <audio src={URL.createObjectURL(audioBlob)} controls className="h-6 w-32 ml-2" />
                                </>
                            )}
                        </div>
                        <button onClick={clearAttachment} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="flex-1 bg-slate-100 rounded-2xl flex items-center p-1 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <label className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors shrink-0">
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                            <Paperclip size={18} />
                        </label>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isRecording ? "Recording audio..." : "Type a message..."}
                            disabled={isRecording}
                            className={`flex-1 bg-transparent border-none p-2 focus:ring-0 text-sm ${isRecording ? 'placeholder:text-red-500 font-medium' : 'text-slate-800'}`}
                        />

                        {!newMessage.trim() && !selectedFile && !audioBlob ? (
                            <button
                                type="button"
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onMouseLeave={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                className={`p-2.5 rounded-xl transition-all shrink-0 ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                                title="Hold to record"
                            >
                                {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                            </button>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={sending || (!newMessage.trim() && !selectedFile && !audioBlob)}
                        className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
                    >
                        <Send size={20} className={sending ? 'animate-pulse' : ''} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TaskChat;
