import express from 'express';
import multer from 'multer';
import { chatWithGroq, analyzeImageWithGroq, generateTitle } from '../services/groqService.js';
import { addToRAG, retrieveContext } from '../services/ragService.js';
import { addMessage, getChat, createChat, updateChatTitle } from '../services/historyService.js';

const router = express.Router();

// Memory storage for image uploads (base64 inline)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/chat/send
router.post('/send', upload.single('image'), async (req, res) => {
  try {
    const { chatId, message, conversationHistory } = req.body;
    const imageFile = req.file;

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    // Parse conversation history
    let history = [];
    try {
      history = JSON.parse(conversationHistory || '[]');
    } catch { history = []; }

    // Build user message content
    let userContent = message || '';
    let isVision = false;
    let base64Image = null;
    let imageMime = null;

    if (imageFile) {
      isVision = true;
      base64Image = imageFile.buffer.toString('base64');
      imageMime = imageFile.mimetype;
    }

    // ── RAG: retrieve context from previous messages ──
    const ragContext = retrieveContext(chatId, userContent, 3);

    let assistantReply;

    if (isVision) {
      // Use vision model
      const textHistory = history
        .filter(m => typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content }));
      
      assistantReply = await analyzeImageWithGroq(base64Image, imageMime, userContent, textHistory);
    } else {
      // Use text model with RAG context
      const groqMessages = history.slice(-20).map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : 
                 (m.content.find?.(c => c.type === 'text')?.text || '')
      })).filter(m => m.content);

      groqMessages.push({ role: 'user', content: userContent });
      assistantReply = await chatWithGroq(groqMessages, ragContext);
    }

    // ── RAG: add both messages to vector store ──
    const msgId = Date.now().toString();
    if (userContent) addToRAG(chatId, `u-${msgId}`, userContent, 'user');
    addToRAG(chatId, `a-${msgId}`, assistantReply, 'assistant');

    // ── Persist to history ──
    const userMsg = await addMessage(chatId, {
      role: 'user',
      content: userContent,
      hasImage: !!imageFile,
      imageName: imageFile?.originalname,
      imageData: base64Image ? `data:${imageMime};base64,${base64Image}` : null,
      imageMime
    });

    const assistantMsg = await addMessage(chatId, {
      role: 'assistant',
      content: assistantReply,
      ragUsed: ragContext.length > 0,
      ragChunks: ragContext.length
    });

    // Auto-generate better title after first exchange
    const chat = await getChat(chatId);
    if (chat.messages.length === 2 && userContent) {
      try {
        const title = await generateTitle(userContent);
        await updateChatTitle(chatId, title);
      } catch { /* non-critical */ }
    }

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      ragUsed: ragContext.length > 0,
      ragChunks: ragContext.length
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
