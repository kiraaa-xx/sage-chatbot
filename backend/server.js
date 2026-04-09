import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRouter from './routes/chat.js';
import historyRouter from './routes/history.js';
import ragRouter from './routes/rag.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/api/chat', chatRouter);
app.use('/api/history', historyRouter);
app.use('/api/rag', ragRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'meta-llama/llama-4-scout-17b-16e-instruct' });
});

app.listen(PORT, () => {
  console.log(`\n🌿 Sage backend running on http://localhost:${PORT}`);
  console.log(`🔑 Groq API: ${process.env.GROQ_API_KEY ? '✓ Connected' : '✗ Missing'}\n`);
});
