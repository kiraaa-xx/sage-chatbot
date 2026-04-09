# 🌿 Sage — AI Chat Assistant (v2)

> Full-stack AI chat: Llama 4 Scout Vision + RAG + Supabase Auth + Font Awesome + Intro Animation + Favicon

---
## 🔧 Vision Model Update
- **Old model:** llama-3.2-11b-vision-preview  
- **New model:** meta-llama/llama-4-scout-17b-16e-instruct  
- Fixed in `backend/services/groqService.js` ✓

---

## 🔑 Groq API Key
1. Go to [Groq Console](https://console.groq.com)  
2. Sign up → **API Keys** → **Create API Key**  
3. Copy the key (starts with `gsk_...`)  
4. Add to `backend/.env`:
```env
GROQ_API_KEY=gsk_your_key_here
````

---

## 🔐 Supabase Setup (FREE Login)

1. Go to [Supabase](https://supabase.com) → **Start your project**
2. Create new project → name + password → **Create**
3. Copy **Project URL** and **anon public key** from Settings → API
4. Add to `frontend/.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> Optional: Disable email confirmation in Authentication → Settings for testing

---

## 🖼️ Logo & Favicon

* Logo: `frontend/public/logo.png`
* Favicons: Copy all files from `favicon_io` to `frontend/public/`

---

## 🚀 Run the App

### Backend

```bash
cd sage/backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd sage/frontend
cp .env.example .env
npm install
npm run dev
```

Open browser: `http://localhost:5173`

## ✨ AI Logo Prompt

> "A minimalist premium logo for an AI assistant called Sage.
> Stylized botanical leaf or sacred-geometry mandala, flowing organic lines.
> Colors: #84B179, #A2CB8B, #C7EABB, #E8F5BD.
> Clean vector emblem, no text, soft radial glow, white/transparent background, circular composition. Nature-meets-technology."

## 🗂️ File Structure
```
sage/
├── backend/
│   ├── .env                     # GROQ_API_KEY here
│   └── services/groqService.js  # Vision model fixed ✓
└── frontend/
    ├── .env                     # Supabase keys here
    ├── public/
    │   ├── logo.png             # YOUR LOGO
    │   ├── favicon.ico
    │   └── ...other favicon files
    └── src/
        ├── components/
        │   ├── IntroAnimation.jsx
        │   ├── LoginPage.jsx
        │   ├── Sidebar.jsx
        │   ├── ChatArea.jsx
        │   ├── Message.jsx
        │   ├── InputBar.jsx
        │   └── WelcomeScreen.jsx
        ├── stores/
        │   ├── chatStore.js
        │   └── authStore.js
        └── utils/supabase.js
