import React, { useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane, faImage, faXmark, faMagnifyingGlass, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useChatStore } from '../stores/chatStore.js';
import styles from './InputBar.module.css';

export default function InputBar() {
  const { sendMessage, sending } = useChatStore();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (sending || (!text.trim() && !image)) return;
    const t = text;
    const img = image;
    setText('');
    setImage(null);
    setImagePreview(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(t, img);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const onDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleImageSelect(e.dataTransfer.files[0]);
  }, []);

  const canSend = (text.trim() || image) && !sending;

  return (
    <div className={styles.container}>
      <div
        className={`${styles.inputWrap} ${dragging ? styles.dragging : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Image preview */}
        {imagePreview && (
          <div className={styles.imageStrip}>
            <div className={styles.imagePreviewWrap}>
              <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              <button className={styles.removeImg} onClick={removeImage} title="Remove image">
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.visionBadge}>
                <FontAwesomeIcon icon={faMagnifyingGlass} /> Vision
              </div>
            </div>
          </div>
        )}

        <div className={styles.inputRow}>
          {/* Image upload */}
          <button
            className={`${styles.attachBtn} ${imagePreview ? styles.attachActive : ''}`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image for AI analysis"
            disabled={sending}
          >
            <FontAwesomeIcon icon={faImage} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleImageSelect(e.target.files[0])}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={text}
            onChange={e => { setText(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder={imagePreview
              ? 'Ask about this image… or leave blank to auto-analyze'
              : 'Message Sage… (Shift+Enter for new line)'}
            rows={1}
            disabled={sending}
          />

          {/* Send button */}
          <button
            className={`${styles.sendBtn} ${!canSend ? styles.sendDisabled : ''}`}
            onClick={handleSend}
            disabled={!canSend}
            title="Send message"
          >
            {sending
              ? <FontAwesomeIcon icon={faSpinner} spin />
              : <FontAwesomeIcon icon={faPaperPlane} />
            }
          </button>
        </div>

        {dragging && (
          <div className={styles.dropOverlay}>
            <FontAwesomeIcon icon={faImage} className={styles.dropIcon} />
            <div className={styles.dropText}>Drop image here</div>
          </div>
        )}
      </div>

      <div className={styles.hint}>
        Sage · Llama 4 Scout (Vision) · RAG memory active · Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
