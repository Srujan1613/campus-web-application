import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import { Send, AlertTriangle, Hash, Users, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🛑 DO NOT DEFINE SOCKET GLOBALLY HERE! 🛑

const Chat = () => {
  const [searchParams] = useSearchParams();
  const bottomRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // NEW: State to hold the local socket instance
  const [socket, setSocket] = useState(null); 

  const [msg, setMsg] = useState("");
  const [list, setList] = useState([]);
  const [room, setRoom] = useState(searchParams.get("room") || "General");
  const [banned, setBanned] = useState(false);

  // 1. CONNECTION/DISCONNECTION LIFECYCLE (THE FIX)
  useEffect(() => {
    const newSocket = io.connect("http://localhost:8080");
    setSocket(newSocket);
    
    // Disconnect on unmount (navigating away)
    return () => {
      newSocket.disconnect(); 
      setSocket(null);
    };
  }, []); // Only runs once on initial mount/unmount

  // 2. LISTENERS and ROOM JOIN
  useEffect(() => {
    if (!socket || !user) return; 

    // Setup Listeners
    const handleMsg = (d) => setList((l) => [...l, d]);
    const handleBan = () => { 
        setBanned(true); 
        setTimeout(() => { localStorage.clear(); window.location.href="/"; }, 3000); 
    };

    socket.on("receive_message", handleMsg);
    socket.on("ban_notice", handleBan);
    
    // Join the room whenever the room state or socket is ready
    socket.emit("join_room", room);
    setList([{ room, author: "System", message: `Welcome to the #${room} channel.`, time: "Now", type: 'system' }]);

    // Cleanup listeners (CRITICAL for preventing duplicate listeners)
    return () => { 
        socket.off("receive_message", handleMsg); 
        socket.off("ban_notice", handleBan); 
    };
  }, [socket, room, user]); // Reruns if socket is set, room changes

  // Auto Scroll
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [list]);

  // 3. Send Message
  const send = (e) => {
    e.preventDefault();
    if (!msg.trim() || !socket) return; 

    const data = { 
        room, 
        author: user.name, 
        userId: user._id, 
        message: msg, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    
    socket.emit("send_message", data);
    setList((l) => [...l, data]);
    setMsg("");
  };

  // 🛑 Banned View
  if (banned) return (
    <div className="h-full flex flex-col items-center justify-center bg-red-50 text-red-600 animate-pulse">
      <AlertTriangle size={80} className="mb-6"/>
      <h1 className="text-5xl font-black tracking-tighter">SUSPENDED</h1>
      <p className="mt-4 font-medium">AI Moderation Violation Detected</p>
    </div>
  );

  return (
    <div className="flex h-full bg-white rounded-3xl overflow-hidden relative z-0">
      
      {/* LEFT SIDEBAR: Room Selector */}
      <div className="w-64 bg-slate-50/80 p-4 flex flex-col gap-2 border-r border-slate-100">
        <div className="px-4 py-4 mb-2">
          <h2 className="font-black text-slate-800 flex items-center gap-2 text-lg">
            <Users size={20} className="text-blue-600"/> Forums
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1 pl-7">Select a topic</p>
        </div>
        
        {['General', 'Alumni Connect', 'Project Help', 'Announcements'].map(r => {
          const isActive = room === r;
          return (
            <motion.button
              key={r}
              whileHover={{ scale: 1.02 }}
              onClick={() => setRoom(r)}
              className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 ${
                isActive 
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-100 ring-1 ring-blue-50' 
                  : 'text-slate-500 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Hash size={16} className={isActive ? "text-blue-500" : "text-slate-300"}/>
              {r}
              {isActive && <motion.div layoutId="dot" className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto" />}
            </motion.button>
          )
        })}
        
        <div className="mt-auto px-4 py-4">
           <div className="bg-blue-100/50 p-4 rounded-2xl flex items-start gap-3">
              <Zap size={16} className="text-blue-600 mt-1" />
              <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                <strong>AI Guard Active</strong><br/>
                Messages are scanned for toxicity in real-time.
              </p>
           </div>
        </div>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Header */}
        <div className="h-20 border-b border-slate-50 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div>
            <h3 className="font-black text-2xl text-slate-800 flex items-center gap-2">
              <span className="text-slate-300 text-3xl font-light">#</span> {room}
            </h3>
            <p className="text-xs text-slate-400 font-medium ml-1">Real-time discussion</p>
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-green-100">
             <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
             Live
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
          <AnimatePresence>
          {list.map((m, i) => {
            const isMe = m.author === user?.name;
            const isSystem = m.author === "System";

            if (isSystem) return (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={i} className="flex justify-center my-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1 rounded-full">{m.message}</span>
              </motion.div>
            );

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                key={i} 
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                  {!isMe && <span className="text-[10px] font-bold text-slate-400 ml-3 mb-1">{m.author}</span>}
                  
                  <div className={`px-6 py-4 shadow-sm text-sm leading-relaxed relative transition-all hover:shadow-md ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-[24px] rounded-br-sm" 
                      : "bg-slate-50 text-slate-700 rounded-[24px] rounded-bl-sm"
                  }`}>
                    {m.message}
                  </div>
                  <span className="text-[10px] text-slate-300 mt-2 mx-2 font-medium">{m.time}</span>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
          <div ref={bottomRef}/>
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={send} className="relative shadow-xl shadow-blue-100/20 rounded-full group">
            <input 
              value={msg} 
              onChange={e=>setMsg(e.target.value)} 
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 rounded-full px-8 py-5 pr-16 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" 
              placeholder={`Type your message in #${room}...`}
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 group-hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Chat;