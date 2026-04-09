import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');
const CHATS_FILE = join(DATA_DIR, 'chats.json');

await fs.ensureDir(DATA_DIR);
if (!await fs.pathExists(CHATS_FILE)) {
  await fs.writeJson(CHATS_FILE, { chats: {} });
}

async function readData() {
  try {
    return await fs.readJson(CHATS_FILE);
  } catch {
    return { chats: {} };
  }
}

async function writeData(data) {
  await fs.writeJson(CHATS_FILE, data, { spaces: 2 });
}

export async function createChat(title = 'New Chat') {
  const data = await readData();
  const id = uuidv4();
  data.chats[id] = {
    id,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  await writeData(data);
  return data.chats[id];
}

export async function getAllChats() {
  const data = await readData();
  return Object.values(data.chats)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getChat(chatId) {
  const data = await readData();
  return data.chats[chatId] || null;
}

export async function addMessage(chatId, message) {
  const data = await readData();
  if (!data.chats[chatId]) throw new Error('Chat not found');
  
  const msg = {
    id: uuidv4(),
    ...message,
    timestamp: new Date().toISOString()
  };
  
  data.chats[chatId].messages.push(msg);
  data.chats[chatId].updatedAt = new Date().toISOString();
  
  // Auto-title from first user message
  if (data.chats[chatId].messages.filter(m => m.role === 'user').length === 1 
      && message.role === 'user') {
    const content = typeof message.content === 'string' 
      ? message.content 
      : message.content.find(c => c.type === 'text')?.text || 'New Chat';
    data.chats[chatId].title = content.slice(0, 50) + (content.length > 50 ? '…' : '');
  }
  
  await writeData(data);
  return msg;
}

export async function deleteChat(chatId) {
  const data = await readData();
  delete data.chats[chatId];
  await writeData(data);
}

export async function updateChatTitle(chatId, title) {
  const data = await readData();
  if (!data.chats[chatId]) throw new Error('Chat not found');
  data.chats[chatId].title = title;
  data.chats[chatId].updatedAt = new Date().toISOString();
  await writeData(data);
  return data.chats[chatId];
}
