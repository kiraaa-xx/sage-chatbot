// Lightweight in-memory RAG service using cosine similarity
// No native dependencies needed — pure JS vector store

const vectorStore = new Map(); // chatId -> [{id, text, embedding, metadata}]

// Simple TF-IDF style embedding (works without external API)
function computeEmbedding(text) {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return freq;
}

function cosineSimilarity(a, b) {
  const keysA = Object.keys(a);
  let dot = 0, normA = 0, normB = 0;
  keysA.forEach(k => {
    dot += (a[k] || 0) * (b[k] || 0);
    normA += a[k] ** 2;
  });
  Object.values(b).forEach(v => { normB += v ** 2; });
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Add message to RAG store for a chat session
export function addToRAG(chatId, messageId, text, role) {
  if (!vectorStore.has(chatId)) vectorStore.set(chatId, []);
  const store = vectorStore.get(chatId);
  
  // Chunk text into ~200 word pieces
  const words = text.split(/\s+/);
  const chunkSize = 200;
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    store.push({
      id: `${messageId}-${i}`,
      text: chunk,
      embedding: computeEmbedding(chunk),
      metadata: { role, messageId, timestamp: Date.now() }
    });
  }
}

// Retrieve top-k relevant chunks for a query
export function retrieveContext(chatId, query, topK = 3) {
  if (!vectorStore.has(chatId)) return [];
  const store = vectorStore.get(chatId);
  if (store.length === 0) return [];

  const queryEmb = computeEmbedding(query);
  
  const scored = store.map(item => ({
    ...item,
    score: cosineSimilarity(queryEmb, item.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);
  
  const top = scored.slice(0, topK).filter(s => s.score > 0);
  return top.map(s => s.text);
}

// Clear RAG store for a chat
export function clearRAG(chatId) {
  vectorStore.delete(chatId);
}

// Get store stats
export function getRAGStats(chatId) {
  const store = vectorStore.get(chatId) || [];
  return { chunks: store.length, chatId };
}
