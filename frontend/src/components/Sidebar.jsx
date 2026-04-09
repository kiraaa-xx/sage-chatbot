import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare, faTrash, faPen, faChevronLeft, faBars,
  faMoon, faSun, faLeaf, faComment, faImage, faRobot,
  faBolt, faRightFromBracket, faUser, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { useChatStore } from '../stores/chatStore.js';
import { useAuthStore } from '../stores/authStore.js';
import styles from './Sidebar.module.css';

function SageLogo() {
  return (
    <div className={styles.logoImgWrap}>
      <img src="/logo.png" alt="Sage" className={styles.logoImg}
        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
      <div className={styles.logoFallback} style={{ display: 'none' }}>
        <FontAwesomeIcon icon={faLeaf} />
      </div>
    </div>
  );
}

function groupByDate(chats) {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now - 86400000).toDateString();
  const groups = { Today: [], Yesterday: [], 'Older': [] };
  chats.forEach(c => {
    const d = new Date(c.updatedAt).toDateString();
    if (d === today) groups.Today.push(c);
    else if (d === yesterday) groups.Yesterday.push(c);
    else groups.Older.push(c);
  });
  return groups;
}

export default function Sidebar() {
  const {
    chats, activeChatId, sidebarOpen, theme,
    newChat, selectChat, deleteChat, renameChat, toggleTheme, toggleSidebar
  } = useChatStore();
  const { user, signOut } = useAuthStore();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const groups = groupByDate(chats);

  const startRename = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const finishRename = async (chatId) => {
    if (editTitle.trim()) await renameChat(chatId, editTitle.trim());
    setEditingId(null);
  };

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    if (confirm('Delete this chat?')) await deleteChat(chatId);
  };

  const getChatIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('image') || t.includes('photo') || t.includes('picture') || t.includes('analyze')) return faImage;
    return faComment;
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  return (
    <>
      {!sidebarOpen && (
        <button className={styles.openBtn} onClick={toggleSidebar} title="Open sidebar">
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <SageLogo />
            <div>
              <div className={styles.brandName}>Sage</div>
              <div className={styles.brandTagline}>AI Assistant</div>
            </div>
          </div>
          <div className={styles.headerBtns}>
            <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
              <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
            </button>
            <button className={styles.iconBtn} onClick={toggleSidebar} title="Collapse">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </div>
        </div>

        <button className={styles.newChatBtn} onClick={newChat}>
          <FontAwesomeIcon icon={faPenToSquare} />
          New Chat
        </button>

        <div className={styles.chatList}>
          {chats.length === 0 && (
            <div className={styles.empty}>
              <FontAwesomeIcon icon={faComment} className={styles.emptyIcon} />
              <div>No chats yet. Start a new one!</div>
            </div>
          )}

          {Object.entries(groups).map(([label, group]) =>
            group.length > 0 && (
              <div key={label} className={styles.group}>
                <div className={styles.groupLabel}>{label}</div>
                {group.map(chat => (
                  <div
                    key={chat.id}
                    className={`${styles.chatItem} ${activeChatId === chat.id ? styles.active : ''}`}
                    onClick={() => selectChat(chat.id)}
                    onMouseEnter={() => setHoveredId(chat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <FontAwesomeIcon icon={getChatIcon(chat.title)} className={styles.chatIcon} />

                    {editingId === chat.id ? (
                      <input
                        className={styles.renameInput}
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={() => finishRename(chat.id)}
                        onKeyDown={e => e.key === 'Enter' && finishRename(chat.id)}
                        onClick={e => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <span className={styles.chatTitle}>{chat.title}</span>
                    )}

                    {(hoveredId === chat.id || activeChatId === chat.id) && editingId !== chat.id && (
                      <div className={styles.chatActions}>
                        <button className={styles.actionBtn} onClick={e => startRename(e, chat)} title="Rename">
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={e => handleDelete(e, chat.id)} title="Delete">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.modelRow}>
            <div className={styles.modelBadge}>
              <span className={styles.modelDot} />
              <FontAwesomeIcon icon={faRobot} style={{ fontSize: 10 }} />
              Llama 4 Scout
            </div>
            <div className={styles.ragBadge}>
              <FontAwesomeIcon icon={faBolt} />
              RAG
            </div>
          </div>

          {user && (
            <div className={styles.userSection} onClick={() => setShowUserMenu(v => !v)}>
              <div className={styles.userAvatar}>
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{displayName}</div>
                <div className={styles.userEmail}>{displayEmail}</div>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className={`${styles.chevron} ${showUserMenu ? styles.chevronOpen : ''}`} />

              {showUserMenu && (
                <div className={styles.userMenu}>
                  <button className={styles.userMenuItem} onClick={signOut}>
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
