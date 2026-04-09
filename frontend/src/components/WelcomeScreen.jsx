import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain, faEye, faBolt, faMoon, faCode, faLanguage,
  faFeather, faChartBar, faLeaf, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useChatStore } from '../stores/chatStore.js';
import styles from './WelcomeScreen.module.css';

const SUGGESTIONS = [
  { icon: faBrain,    text: 'Explain RAG in simple terms', label: 'Learn' },
  { icon: faCode,     text: 'Write a Python function to sort a list', label: 'Code' },
  { icon: faEye,      text: 'Attach an image and I will analyze it', label: 'Vision' },
  { icon: faFeather,  text: 'Write a short poem about autumn', label: 'Create' },
  { icon: faLanguage, text: 'Translate "Hello, how are you?" to Japanese', label: 'Translate' },
  { icon: faChartBar, text: 'What are the pros and cons of React vs Vue?', label: 'Compare' },
];

const FEATURES = [
  { icon: faBrain,  label: 'RAG Memory',     desc: 'Contextual recall across conversations' },
  { icon: faEye,    label: 'Vision AI',       desc: 'Analyze and understand any image' },
  { icon: faBolt,   label: 'Llama 4 Scout',  desc: 'State-of-the-art multimodal model' },
  { icon: faMoon,   label: 'Dark Mode',       desc: 'Easy on the eyes, day or night' },
];

export default function WelcomeScreen({ newChat }) {
  const { sendMessage, activeChatId } = useChatStore();

  const handleSuggestion = async (text) => {
    if (!activeChatId) return;
    await sendMessage(text, null);
  };

  return (
    <div className={styles.wrap}>
      {/* Animated logo */}
      <div className={styles.logoWrap}>
        <div className={styles.outerRing} />
        <div className={styles.innerRing} />
        <div className={styles.logo}>
          <img
            src="/logo.png"
            alt="Sage"
            className={styles.logoImg}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className={styles.logoFallback} style={{ display: 'none' }}>
            <FontAwesomeIcon icon={faLeaf} />
          </div>
        </div>
      </div>

      <h1 className={styles.title}>
        {newChat ? 'New Conversation' : 'Welcome to Sage'}
      </h1>
      <p className={styles.subtitle}>
        {newChat
          ? 'Your intelligent companion is ready. Ask anything, attach images, or just explore.'
          : 'An AI assistant powered by Llama 4 Scout with memory, vision, and retrieval-augmented generation.'}
      </p>

      {/* Feature pills */}
      <div className={styles.pills}>
        {FEATURES.map(f => (
          <div key={f.label} className={styles.pill}>
            <FontAwesomeIcon icon={f.icon} className={styles.pillIcon} />
            {f.label}
          </div>
        ))}
      </div>

      {/* Suggestions grid */}
      {newChat && activeChatId && (
        <div className={styles.suggestions}>
          <div className={styles.suggestLabel}>Try asking…</div>
          <div className={styles.suggestGrid}>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className={styles.chip}
                onClick={() => handleSuggestion(s.text)}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <FontAwesomeIcon icon={s.icon} className={styles.chipIcon} />
                <span className={styles.chipText}>{s.text}</span>
                <span className={styles.chipLabel}>
                  {s.label} <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 9 }} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
