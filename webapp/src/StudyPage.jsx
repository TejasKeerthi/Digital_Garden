import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { breakIntoSections, generateLearningCards } from './pdfUtils';

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.06 } },
};

export default function StudyPage({ gardenItems, studySubject, onNavigate }) {
    const [activeTab, setActiveTab] = useState('cards');
    const [expandedCard, setExpandedCard] = useState(null);
    const [currentFlashcard, setCurrentFlashcard] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(studySubject || null);

    // Get unique subjects from garden
    const subjects = useMemo(() => {
        const map = {};
        gardenItems.forEach(item => {
            if (!map[item.subject]) {
                map[item.subject] = { name: item.subject, color: item.color, icon: item.icon, count: 0 };
            }
            map[item.subject].count++;
        });
        return Object.values(map);
    }, [gardenItems]);

    // Get items for the selected subject
    const subjectItems = useMemo(() => {
        if (!selectedSubject) return [];
        return gardenItems.filter(item => item.subject === selectedSubject);
    }, [gardenItems, selectedSubject]);

    // Generate learning content
    const learningContent = useMemo(() => {
        if (subjectItems.length === 0) return { cards: [], flashcards: [], fullText: '' };

        const allText = subjectItems.map(item => item.text).join('\n\n');
        const sections = breakIntoSections(allText);
        const cards = generateLearningCards(sections, selectedSubject);

        // Create flashcards from definitions and key concepts
        const flashcards = [];
        const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 20 && s.trim().length < 300);

        // Definition-style flashcards
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            const defMatch = trimmed.match(/^(.+?)\s+(?:is|are|means|refers to|is defined as)\s+(.+)/i);
            if (defMatch && defMatch[1].length < 80 && defMatch[2].length > 10) {
                flashcards.push({
                    question: `What is ${defMatch[1].trim()}?`,
                    answer: defMatch[2].trim(),
                });
            }
        });

        // Fill-in-the-blank style from key sentences
        const importantSentences = sentences
            .filter(s => s.trim().length > 40 && s.trim().length < 200)
            .slice(0, 10);

        importantSentences.forEach(sentence => {
            const words = sentence.trim().split(/\s+/);
            if (words.length >= 5) {
                // Pick a key word (not first 2 or last)
                const keyIdx = Math.min(3 + Math.floor(Math.random() * (words.length - 5)), words.length - 2);
                const keyword = words[keyIdx].replace(/[^a-zA-Z0-9]/g, '');
                if (keyword.length > 3) {
                    const blanked = words.map((w, i) => i === keyIdx ? '_____' : w).join(' ');
                    flashcards.push({
                        question: blanked + '.',
                        answer: keyword,
                    });
                }
            }
        });

        return {
            cards,
            flashcards: flashcards.slice(0, 15),
            fullText: allText,
            sections,
        };
    }, [subjectItems, selectedSubject]);

    // Subject selection screen
    if (!selectedSubject) {
        return (
            <motion.div {...fadeUp}>
                <div className="page-header">
                    <h2>🧠 Study Mode</h2>
                    <p>Select a subject from your garden to start learning</p>
                </div>

                {subjects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🌱</div>
                        <h3>No subjects yet</h3>
                        <p>Upload PDFs in My Garden to start studying</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 20 }}
                            onClick={() => onNavigate('garden')}
                        >
                            🌱 Go to Garden
                        </button>
                    </div>
                ) : (
                    <motion.div className="study-subject-grid" variants={stagger} initial="initial" animate="animate">
                        {subjects.map((subject) => (
                            <motion.div
                                key={subject.name}
                                className="study-subject-card"
                                variants={fadeUp}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedSubject(subject.name)}
                                style={{ '--subject-color': subject.color }}
                            >
                                <div className="study-subject-accent" style={{ background: subject.color }} />
                                <span className="study-subject-icon">{subject.icon}</span>
                                <div className="study-subject-name" style={{ color: subject.color }}>{subject.name}</div>
                                <div className="study-subject-meta">{subject.count} PDF{subject.count !== 1 ? 's' : ''} uploaded</div>
                                <button className="btn btn-primary" style={{ marginTop: 12, fontSize: '0.8rem', padding: '8px 20px' }}>
                                    Start Studying →
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        );
    }

    const subjectColor = subjectItems[0]?.color || '#6366f1';
    const subjectIcon = subjectItems[0]?.icon || '📘';

    return (
        <motion.div {...fadeUp}>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <button
                        className="back-btn"
                        onClick={() => setSelectedSubject(null)}
                    >
                        ← Back
                    </button>
                    <h2>
                        {subjectIcon} Studying: <span style={{ color: subjectColor }}>{selectedSubject}</span>
                    </h2>
                </div>
                <p>Your personalized learning breakdown from {subjectItems.length} uploaded PDF{subjectItems.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Tab Navigation */}
            <div className="study-tabs">
                {[
                    { id: 'cards', label: '📖 Smart Notes', count: learningContent.cards.length },
                    { id: 'flashcards', label: '🃏 Flashcards', count: learningContent.flashcards.length },
                    { id: 'fulltext', label: '📜 Full Text', count: null },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`study-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={activeTab === tab.id ? { borderColor: subjectColor, color: subjectColor } : {}}
                    >
                        {tab.label}
                        {tab.count !== null && <span className="tab-count">{tab.count}</span>}
                    </button>
                ))}
            </div>

            {/* Smart Notes */}
            {activeTab === 'cards' && (
                <motion.div className="study-cards" variants={stagger} initial="initial" animate="animate">
                    {learningContent.cards.length === 0 ? (
                        <div className="empty-state" style={{ padding: 40 }}>
                            <div className="empty-icon">📭</div>
                            <h3>Couldn't extract learning content</h3>
                            <p>The PDF might be image-based. Try uploading a text-based PDF.</p>
                        </div>
                    ) : (
                        learningContent.cards.map((card, i) => (
                            <motion.div
                                key={i}
                                className={`study-card study-card-${card.type}`}
                                variants={fadeUp}
                                style={{ '--card-color': subjectColor }}
                                onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                            >
                                <div className="study-card-header">
                                    <span className="study-card-icon">{card.icon}</span>
                                    <span className="study-card-title">{card.title}</span>
                                    <span className="study-card-type">{card.type}</span>
                                </div>
                                <div className={`study-card-content ${expandedCard === i ? 'expanded' : ''}`}>
                                    {card.content.split('\n').map((line, j) => (
                                        <p key={j}>{line}</p>
                                    ))}
                                </div>
                                {card.content.length > 200 && (
                                    <button className="study-card-toggle">
                                        {expandedCard === i ? 'Show less ▲' : 'Read more ▼'}
                                    </button>
                                )}
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}

            {/* Flashcards */}
            {activeTab === 'flashcards' && (
                <div className="flashcard-container">
                    {learningContent.flashcards.length === 0 ? (
                        <div className="empty-state" style={{ padding: 40 }}>
                            <div className="empty-icon">🃏</div>
                            <h3>No flashcards generated</h3>
                            <p>The content didn't have enough definition-style sentences to create flashcards</p>
                        </div>
                    ) : (
                        <>
                            <div className="flashcard-progress">
                                Card {currentFlashcard + 1} of {learningContent.flashcards.length}
                                <div className="flashcard-progress-bar">
                                    <div
                                        className="flashcard-progress-fill"
                                        style={{
                                            width: `${((currentFlashcard + 1) / learningContent.flashcards.length) * 100}%`,
                                            background: subjectColor,
                                        }}
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentFlashcard}
                                    className="flashcard"
                                    initial={{ opacity: 0, rotateY: 90 }}
                                    animate={{ opacity: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, rotateY: -90 }}
                                    transition={{ duration: 0.35 }}
                                    onClick={() => setShowAnswer(!showAnswer)}
                                    style={{ '--card-color': subjectColor }}
                                >
                                    <div className="flashcard-label">
                                        {showAnswer ? '💡 Answer' : '❓ Question'}
                                    </div>
                                    <div className="flashcard-text">
                                        {showAnswer
                                            ? learningContent.flashcards[currentFlashcard].answer
                                            : learningContent.flashcards[currentFlashcard].question
                                        }
                                    </div>
                                    <div className="flashcard-hint">
                                        {showAnswer ? 'Click to see question' : 'Click to reveal answer'}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flashcard-nav">
                                <button
                                    className="btn btn-secondary"
                                    disabled={currentFlashcard === 0}
                                    onClick={() => { setCurrentFlashcard(c => c - 1); setShowAnswer(false); }}
                                >
                                    ← Previous
                                </button>
                                <button
                                    className="btn btn-primary"
                                    disabled={currentFlashcard === learningContent.flashcards.length - 1}
                                    onClick={() => { setCurrentFlashcard(c => c + 1); setShowAnswer(false); }}
                                >
                                    Next →
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Full Text */}
            {activeTab === 'fulltext' && (
                <motion.div className="fulltext-container" {...fadeUp}>
                    <div className="fulltext-content">
                        {learningContent.fullText
                            ? learningContent.fullText.split('\n\n').map((para, i) => (
                                <p key={i} className="fulltext-paragraph">{para}</p>
                            ))
                            : <p style={{ color: 'var(--text-muted)' }}>No text content available.</p>
                        }
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
