import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faLeaf, faUser, faBolt } from '@fortawesome/free-solid-svg-icons';
import styles from './Message.module.css';

function SageAvatar({ typing }) {
  return (
    <div className={`${styles.avatarSage} ${typing ? styles.avatarGlow : ''}`}>
      <img src="/logo.png" alt="Sage" className={styles.avatarImg}
        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
      <div className={styles.avatarFallback} style={{ display: 'none' }}>
        <FontAwesomeIcon icon={faLeaf} />
      </div>
    </div>
  );
}

export default function Message({ message, index }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [imgExpanded, setImgExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`${styles.wrapper} ${isUser ? styles.wrapperUser : styles.wrapperAI} animate-fade-in`}
      style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
    >
      {!isUser && (
        <div className={styles.avatarWrap}>
          <SageAvatar typing={message.typing} />
        </div>
      )}

      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAI}`}>
        {message.imageData && (
          <div className={styles.imageWrap}>
            <img
              src={message.imageData}
              alt={message.imageName || 'Uploaded image'}
              className={`${styles.image} ${imgExpanded ? styles.imageExpanded : ''}`}
              onClick={() => setImgExpanded(!imgExpanded)}
              title="Click to expand"
            />
            {message.imageName && (
              <div className={styles.imageName}>{message.imageName}</div>
            )}
          </div>
        )}

        {message.typing ? (
          <div className={styles.typingDots}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        ) : isUser ? (
          <div className={styles.userText}>{message.content}</div>
        ) : (
          <div className={`prose ${styles.aiText}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline) {
                    return (
                      <div className={styles.codeBlock}>
                        {match?.[1] && <div className={styles.codeLang}>{match[1]}</div>}
                        <pre><code className={className} {...props}>{children}</code></pre>
                      </div>
                    );
                  }
                  return <code className={className} {...props}>{children}</code>;
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {!message.typing && (
          <div className={styles.footer}>
            <span className={styles.time}>{formatTime(message.timestamp)}</span>
            {message.ragUsed && (
              <span className={styles.ragBadge} title={`Used ${message.ragChunks} memory chunks`}>
                <FontAwesomeIcon icon={faBolt} /> Memory
              </span>
            )}
            {!isUser && (
              <button className={styles.copyBtn} onClick={handleCopy} title="Copy response">
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className={styles.avatarUser}>
          <FontAwesomeIcon icon={faUser} />
        </div>
      )}
    </div>
  );
}
