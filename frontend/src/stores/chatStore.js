import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const useChatStore = create((set, get) => ({
  // State
  chats: [],
  activeChatId: null,
  activeMessages: [],
  loading: false,
  sending: false,
  sidebarOpen: true,
  theme: localStorage.getItem('sage-theme') || 'light',
  error: null,

  // Theme
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sage-theme', next);
    set({ theme: next });
  },

  initTheme: () => {
    const t = localStorage.getItem('sage-theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
    set({ theme: t });
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

  // Load all chats
  loadChats: async () => {
    try {
      const { data } = await api.get('/history');
      set({ chats: data });
    } catch (e) {
      set({ error: 'Failed to load chats' });
    }
  },

  // Create new chat
  newChat: async () => {
    try {
      const { data } = await api.post('/history/new');
      set(s => ({ chats: [data, ...s.chats], activeChatId: data.id, activeMessages: [] }));
      return data.id;
    } catch (e) {
      set({ error: 'Failed to create chat' });
    }
  },

  // Select a chat
  selectChat: async (chatId) => {
    if (get().activeChatId === chatId) return;
    set({ loading: true, activeChatId: chatId, activeMessages: [] });
    try {
      const { data } = await api.get(`/history/${chatId}`);
      set({ activeMessages: data.messages, loading: false });
    } catch (e) {
      set({ error: 'Failed to load chat', loading: false });
    }
  },

  // Delete chat
  deleteChat: async (chatId) => {
    await api.delete(`/history/${chatId}`);
    const { activeChatId, chats } = get();
    const newChats = chats.filter(c => c.id !== chatId);
    const newActive = activeChatId === chatId ? (newChats[0]?.id || null) : activeChatId;
    set({ chats: newChats, activeChatId: newActive });
    if (newActive && newActive !== activeChatId) {
      await get().selectChat(newActive);
    } else if (!newActive) {
      set({ activeMessages: [] });
    }
  },

  // Rename chat
  renameChat: async (chatId, title) => {
    await api.patch(`/history/${chatId}/title`, { title });
    set(s => ({ chats: s.chats.map(c => c.id === chatId ? { ...c, title } : c) }));
  },

  // Send message (with optional image)
  sendMessage: async (text, imageFile) => {
    const { activeChatId, activeMessages } = get();
    if (!activeChatId) return;
    if (!text.trim() && !imageFile) return;

    set({ sending: true, error: null });

    // Optimistic: add user message immediately
    const tempUserMsg = {
      id: 'temp-user-' + Date.now(),
      role: 'user',
      content: text,
      hasImage: !!imageFile,
      imageName: imageFile?.name,
      imageData: imageFile ? URL.createObjectURL(imageFile) : null,
      timestamp: new Date().toISOString(),
      pending: true
    };

    const tempAiMsg = {
      id: 'temp-ai-' + Date.now(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      pending: true,
      typing: true
    };

    set({ activeMessages: [...activeMessages, tempUserMsg, tempAiMsg] });

    try {
      const formData = new FormData();
      formData.append('chatId', activeChatId);
      formData.append('message', text);
      formData.append('conversationHistory', JSON.stringify(
        activeMessages.slice(-20).map(m => ({ role: m.role, content: m.content }))
      ));
      if (imageFile) formData.append('image', imageFile);

      const { data } = await api.post('/chat/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Replace temp messages with real ones
      set(s => ({
        activeMessages: [
          ...s.activeMessages.filter(m => !m.pending),
          data.userMessage,
          data.assistantMessage
        ],
        sending: false
      }));

      // Update chat list (title may have changed)
      await get().loadChats();

    } catch (e) {
      set(s => ({
        activeMessages: s.activeMessages.filter(m => !m.pending),
        sending: false,
        error: e.response?.data?.error || 'Failed to send message. Is the backend running?'
      }));
    }
  }
}));
