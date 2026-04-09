import express from 'express';
import { getRAGStats } from '../services/ragService.js';

const router = express.Router();

router.get('/stats/:chatId', (req, res) => {
  const stats = getRAGStats(req.params.chatId);
  res.json(stats);
});

export default router;
