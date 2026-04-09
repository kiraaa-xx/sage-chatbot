import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useChatStore } from '../stores/chatStore.js';
import Message from './Message.jsx';
import InputBar from './InputBar.jsx';
import WelcomeScreen from './WelcomeScreen.jsx';
import styles from './ChatArea.module.css';

export default function ChatArea() {
  const { activeChatId, activeMessages, loading, sending, error, sidebarOpen } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  return (
    <div className={styles.chatArea}>
      {/* Top bar */}
      <div className={`${styles.topBar} ${!sidebarOpen ? styles.topBarFull : ''}`}>
        <div className={styles.topTitle}>
          {activeChatId ? (
            <span className={styles.activeIndicator}>
              <span className={styles.dot} />
              Sage is ready
            </span>
          ) : (
            <span className={styles.brandText}>Sage</span>
          )}
        </div>
        <div className={styles.topRight}>
          {sending && (
            <div className={styles.thinkingBadge}>
              <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 11 }} />
              Thinking…
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {!activeChatId ? (
          <WelcomeScreen />
        ) : loading ? (
          <div className={styles.loadingWrap}>
            <FontAwesomeIcon icon={faLeaf} className={styles.loadingLeaf} />
            <div className={styles.loadingText}>Loading chat…</div>
          </div>
        ) : activeMessages.length === 0 ? (
          <WelcomeScreen newChat />
        ) : (
          activeMessages.map((msg, i) => (
            <Message key={msg.id || i} message={msg} index={i} />
          ))
        )}

        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️</span> {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {activeChatId && <InputBar />}
    </div>
  );
}
