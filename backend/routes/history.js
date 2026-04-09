import express from 'express';
import { createChat, getAllChats, getChat, deleteChat, updateChatTitle } from '../services/historyService.js';
import { clearRAG } from '../services/ragService.js';

const router = express.Router();

// GET all chats
router.get('/', async (req, res) => {
  try {
    const chats = await getAllChats();
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new chat
router.post('/new', async (req, res) => {
  try {
    const chat = await createChat('New Chat');
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET specific chat with messages
router.get('/:chatId', async (req, res) => {
  try {
    const chat = await getChat(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE chat
router.delete('/:chatId', async (req, res) => {
  try {
    await deleteChat(req.params.chatId);
    clearRAG(req.params.chatId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH rename chat
router.patch('/:chatId/title', async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await updateChatTitle(req.params.chatId, title);
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
