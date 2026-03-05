import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromPDF } from './pdfUtils';

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.06 } },
};

const SUBJECT_PRESETS = [
    { id: 'math', name: 'Mathematics', icon: '📐', color: '#4f8cff' },
    { id: 'physics', name: 'Physics', icon: '⚛️', color: '#a855f7' },
    { id: 'biology', name: 'Biology', icon: '🧬', color: '#22d3a7' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: '#f59e0b' },
    { id: 'history', name: 'History', icon: '🏛️', color: '#f43f5e' },
    { id: 'cs', name: 'Computer Science', icon: '💻', color: '#06b6d4' },
    { id: 'english', name: 'English', icon: '📝', color: '#ec4899' },
    { id: 'economics', name: 'Economics', icon: '📊', color: '#84cc16' },
];

const CUSTOM_COLORS = ['#4f8cff', '#a855f7', '#22d3a7', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#84cc16', '#ff6b6b', '#ffd93d'];

export default function GardenPage({ gardenItems, setGardenItems, onNavigate }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [showSubjectPicker, setShowSubjectPicker] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [customSubject, setCustomSubject] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const fileInputRef = useRef(null);

    const handleFiles = useCallback((files) => {
        const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf');
        if (pdfFiles.length === 0) {
            alert('Please upload PDF files only.');
            return;
        }
        // Take the first PDF (or you could support batch)
        setPendingFile(pdfFiles[0]);
        setShowSubjectPicker(true);
    }, []);

    const processUpload = useCallback(async (subjectName, subjectColor, subjectIcon) => {
        if (!pendingFile) return;
        setShowSubjectPicker(false);
        setUploading(true);
        setUploadProgress('Reading PDF...');

        try {
            const text = await extractTextFromPDF(pendingFile);
            setUploadProgress('Processing content...');

            // Small delay so user sees the processing step
            await new Promise(r => setTimeout(r, 500));

            const newItem = {
                id: Date.now().toString(),
                fileName: pendingFile.name,
                subject: subjectName,
                color: subjectColor,
                icon: subjectIcon,
                text: text,
                pageCount: text.split('\n\n').length,
                uploadedAt: new Date().toISOString(),
                wordCount: text.split(/\s+/).length,
            };

            const updated = [...gardenItems, newItem];
            setGardenItems(updated);
            localStorage.setItem('gardenItems', JSON.stringify(updated));

            setUploadProgress('Done! ✅');
            await new Promise(r => setTimeout(r, 800));
        } catch (err) {
            console.error('PDF extraction error:', err);
            alert('Failed to read PDF. Please make sure it\'s a valid, text-based PDF file.');
        } finally {
            setUploading(false);
            setUploadProgress('');
            setPendingFile(null);
            setCustomSubject('');
        }
    }, [pendingFile, gardenItems, setGardenItems]);

    const handleDelete = (id) => {
        const updated = gardenItems.filter(item => item.id !== id);
        setGardenItems(updated);
        localStorage.setItem('gardenItems', JSON.stringify(updated));
        setDeleteConfirm(null);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); };

    // Group items by subject
    const groupedItems = gardenItems.reduce((acc, item) => {
        if (!acc[item.subject]) acc[item.subject] = [];
        acc[item.subject].push(item);
        return acc;
    }, {});

    const subjectList = Object.keys(groupedItems);

    return (
        <motion.div {...fadeUp}>
            <div className="page-header">
                <h2>🌱 My Garden</h2>
                <p>Upload your PDFs, tag them with a subject, and grow your knowledge garden</p>
            </div>

            {/* Upload Zone */}
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                {uploading ? (
                    <div className="upload-status">
                        <div className="upload-spinner" />
                        <p>{uploadProgress}</p>
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">📄</div>
                        <h3>Drop your PDF here</h3>
                        <p>or click to browse files</p>
                    </>
                )}
            </div>

            {/* Subject Picker Modal */}
            <AnimatePresence>
                {showSubjectPicker && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowSubjectPicker(false); setPendingFile(null); }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>📂 Choose a Subject</h3>
                            <p className="modal-subtitle">
                                Uploading: <strong>{pendingFile?.name}</strong>
                            </p>

                            <div className="subject-preset-grid">
                                {SUBJECT_PRESETS.map((s) => (
                                    <button
                                        key={s.id}
                                        className="preset-btn"
                                        style={{ '--preset-color': s.color }}
                                        onClick={() => processUpload(s.name, s.color, s.icon)}
                                    >
                                        <span>{s.icon}</span>
                                        <span>{s.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="custom-subject-row">
                                <span className="divider-text">or create a custom subject</span>
                                <div className="custom-input-row">
                                    <input
                                        type="text"
                                        placeholder="e.g. Psychology, Art History..."
                                        value={customSubject}
                                        onChange={(e) => setCustomSubject(e.target.value)}
                                        className="custom-subject-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && customSubject.trim()) {
                                                const color = CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)];
                                                processUpload(customSubject.trim(), color, '📘');
                                            }
                                        }}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        disabled={!customSubject.trim()}
                                        onClick={() => {
                                            const color = CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)];
                                            processUpload(customSubject.trim(), color, '📘');
                                        }}
                                    >
                                        Add →
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Library */}
            {gardenItems.length === 0 ? (
                <div className="empty-state" style={{ paddingTop: 40 }}>
                    <div className="empty-icon">🌱</div>
                    <h3>Your garden is empty</h3>
                    <p>Upload your first PDF to start growing your knowledge garden</p>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <motion.div className="stats-row" style={{ marginTop: 32 }} variants={stagger} initial="initial" animate="animate">
                        {[
                            { icon: '📄', value: gardenItems.length, label: 'PDFs Uploaded', bg: 'rgba(99,102,241,0.12)' },
                            { icon: '📚', value: subjectList.length, label: 'Subjects', bg: 'rgba(168,85,247,0.12)' },
                            { icon: '📝', value: gardenItems.reduce((sum, i) => sum + i.wordCount, 0).toLocaleString(), label: 'Words', bg: 'rgba(34,211,167,0.12)' },
                        ].map((s, i) => (
                            <motion.div className="stat-card" key={i} variants={fadeUp}>
                                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                <div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Grouped by subject */}
                    {subjectList.map((subject) => {
                        const items = groupedItems[subject];
                        const color = items[0].color;
                        const icon = items[0].icon;

                        return (
                            <div key={subject} className="garden-subject-group">
                                <div className="garden-subject-header" style={{ color }}>
                                    <span>{icon}</span>
                                    <h3>{subject}</h3>
                                    <span className="garden-count">{items.length} file{items.length !== 1 ? 's' : ''}</span>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '8px 18px' }}
                                        onClick={() => onNavigate('study', subject)}
                                    >
                                        🧠 Study This
                                    </button>
                                </div>
                                <motion.div className="garden-files" variants={stagger} initial="initial" animate="animate">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            className="garden-file-card"
                                            variants={fadeUp}
                                            style={{ '--file-color': item.color }}
                                        >
                                            <div className="file-accent" style={{ background: item.color }} />
                                            <div className="file-icon">📄</div>
                                            <div className="file-info">
                                                <div className="file-name">{item.fileName}</div>
                                                <div className="file-meta">
                                                    {item.wordCount.toLocaleString()} words • Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                className="file-delete"
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item.id); }}
                                                title="Remove"
                                            >
                                                🗑️
                                            </button>

                                            {/* Delete confirm */}
                                            <AnimatePresence>
                                                {deleteConfirm === item.id && (
                                                    <motion.div
                                                        className="delete-confirm"
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                    >
                                                        <span>Remove this file?</span>
                                                        <button className="confirm-yes" onClick={() => handleDelete(item.id)}>Yes</button>
                                                        <button className="confirm-no" onClick={() => setDeleteConfirm(null)}>No</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        );
                    })}
                </>
            )}
        </motion.div>
    );
}
