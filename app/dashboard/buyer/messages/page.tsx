'use client';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/utils/helpers';

export default function MessagesPage() {
  const { request } = useApi();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    request('/api/chat').then((res: any) => {
      setConversations(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeConv) {
      request(`/api/chat?userId=${activeConv.otherUserId}`).then((res: any) => {
        setMessages(Array.isArray(res) ? res : []);
      });
    }
  }, [activeConv]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    const res = await request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ receiverId: activeConv.otherUserId, message: newMsg }),
    });
    setSending(false);
    if (res) { setMessages(prev => [...prev, res]); setNewMsg(''); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm">Chat with buyers and sellers</p>
      </div>

      <div className="card p-0 overflow-hidden flex" style={{ height: '70vh' }}>
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <input className="input text-sm py-2" placeholder="Search conversations..." />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm px-4">No conversations yet</div>
            ) : conversations.map((conv: any) => (
              <button key={conv.otherUserId} onClick={() => setActiveConv(conv)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeConv?.otherUserId === conv.otherUserId ? 'bg-brand-50 border-l-2 border-l-brand-500' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-600 font-semibold text-sm">{getInitials(conv.otherUser?.name || 'U')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm truncate">{conv.otherUser?.name}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{conv.unreadCount}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="text-brand-600 font-semibold text-sm">{getInitials(activeConv.otherUser?.name || 'U')}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{activeConv.otherUser?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{activeConv.otherUser?.role?.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg: any) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={handleKeyDown}
                    rows={1} className="input flex-1 resize-none py-2.5 text-sm" placeholder="Type a message... (Enter to send)" />
                  <button onClick={sendMessage} disabled={sending || !newMsg.trim()}
                    className="btn-primary px-4 py-2.5 disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
