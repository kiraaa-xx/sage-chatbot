import React, { useEffect, useState } from 'react';
import { useChatStore } from './stores/chatStore.js';
import { useAuthStore } from './stores/authStore.js';
import Sidebar from './components/Sidebar.jsx';
import ChatArea from './components/ChatArea.jsx';
import LoginPage from './components/LoginPage.jsx';
import IntroAnimation from './components/IntroAnimation.jsx';
import styles from './App.module.css';

export default function App() {
  const { initTheme, loadChats, sidebarOpen } = useChatStore();
  const { user, loading, init } = useAuthStore();
  const [introDone, setIntroDone] = useState(
    sessionStorage.getItem('sage-intro-done') === '1'
  );

  useEffect(() => {
    initTheme();
    init();
  }, []);

  useEffect(() => {
    if (user) loadChats();
  }, [user]);

  const handleIntroDone = () => {
    sessionStorage.setItem('sage-intro-done', '1');
    setIntroDone(true);
  };

  // Show intro only on first visit per session
  if (!introDone) {
    return <IntroAnimation onDone={handleIntroDone} />;
  }

  // Auth loading spinner
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  // Not logged in → login page
  if (!user) {
    return <LoginPage />;
  }

  // Main app
  return (
    <div className={styles.app}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <Sidebar />
      <main className={`${styles.main} ${!sidebarOpen ? styles.mainFull : ''}`}>
        <ChatArea />
      </main>
    </div>
  );
}
