# 🌿 Sage — AI Chat Assistant (v2)

> Full-stack AI chat: Llama 4 Scout Vision + RAG + Supabase Auth + Font Awesome + Intro Animation + Favicon

---

## 🔧 VISION MODEL FIX
Old model (decommissioned): llama-3.2-11b-vision-preview
New model (working):        meta-llama/llama-4-scout-17b-16e-instruct
Already updated in backend/services/groqService.js ✓

---

## 🔑 Step 1 — Groq API Key (FREE)
1. Go to https://console.groq.com
2. Sign up → click "API Keys" → "Create API Key"
3. Copy key (starts with gsk_...)
4. Paste into backend/.env:
   GROQ_API_KEY=gsk_your_key_here

---

## 🔐 Step 2 — Supabase Setup (FREE login system)

### Create Project:
1. Go to https://supabase.com → "Start your project"
2. Sign up with GitHub/Google
3. Click "New project" → fill in name + password → "Create new project"
4. Wait ~1 minute

### Get API Keys:
1. Settings (gear icon) → API
2. Copy "Project URL" and "anon public" key
3. Paste into frontend/.env:
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...

### Optional — disable email confirmation for testing:
Authentication → Settings → turn off "Enable email confirmations"

---

## 🖼️ Step 3 — Add Logo & Favicon

### Your Logo:
- Name your logo file: logo.png
- Copy it to: frontend/public/logo.png

### Favicon files (from your favicon_io folder):
Copy ALL these files into frontend/public/:
  favicon.ico
  favicon-16x16.png
  favicon-32x32.png
  apple-touch-icon.png
  android-chrome-192x192.png
  android-chrome-512x512.png
  site.webmanifest

---

## 🚀 Step 4 — Run the App

Install Node.js from https://nodejs.org (LTS version)

Terminal 1 (Backend):
  cd sage/backend
  cp .env.example .env     ← then edit and add GROQ_API_KEY
  npm install
  npm run dev

Terminal 2 (Frontend):
  cd sage/frontend
  cp .env.example .env     ← then edit and add Supabase keys
  npm install
  npm run dev

Open browser: http://localhost:5173

---

## ✨ Logo Prompt for AI Image Generators
Use this in Midjourney, DALL-E, Ideogram, or Adobe Firefly:

"A minimalist premium logo for an AI assistant called Sage.
A stylized botanical leaf or sacred-geometry mandala of flowing organic lines,
evoking wisdom and nature. Colors: #84B179, #A2CB8B, #C7EABB, #E8F5BD.
Clean vector emblem, no text, soft radial glow, white/transparent background,
circular composition. Nature-meets-technology. App icon style."

---

## 🗂️ File Structure
sage/
├── backend/
│   ├── .env                     GROQ_API_KEY here
│   └── services/groqService.js  Vision model fixed ✓
└── frontend/
    ├── .env                     Supabase keys here
    ├── public/
    │   ├── logo.png             YOUR LOGO HERE
    │   ├── favicon.ico          from favicon_io
    │   └── ...other favicon files
    └── src/
        ├── components/
        │   ├── IntroAnimation.jsx
        │   ├── LoginPage.jsx
        │   ├── Sidebar.jsx      (Font Awesome icons)
        │   ├── ChatArea.jsx
        │   ├── Message.jsx      (Font Awesome icons)
        │   ├── InputBar.jsx     (Font Awesome icons)
        │   └── WelcomeScreen.jsx
        ├── stores/
        │   ├── chatStore.js
        │   └── authStore.js     (Supabase auth)
        └── utils/supabase.js
