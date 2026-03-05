import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GardenPage from './GardenPage';
import StudyPage from './StudyPage';

/* ==========================================
   CROSS-SUBJECT DATA & AI ENGINE
   ==========================================*/

const SUBJECTS = [
    { id: 'math', name: 'Mathematics', icon: '📐', color: '#4f8cff', glow: 'rgba(79,140,255,0.3)' },
    { id: 'physics', name: 'Physics', icon: '⚛️', color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
    { id: 'biology', name: 'Biology', icon: '🧬', color: '#22d3a7', glow: 'rgba(34,211,167,0.3)' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    { id: 'history', name: 'History', icon: '🏛️', color: '#f43f5e', glow: 'rgba(244,63,94,0.3)' },
    { id: 'cs', name: 'Computer Science', icon: '💻', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
    { id: 'english', name: 'English', icon: '📝', color: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
    { id: 'economics', name: 'Economics', icon: '📊', color: '#84cc16', glow: 'rgba(132,204,22,0.3)' },
];

const CROSS_CONNECTIONS = [
    {
        id: 'exponential-growth',
        title: 'Exponential Growth & Decay',
        emoji: '📈',
        subjects: {
            math: {
                title: 'Exponential Functions',
                body: 'The function f(x) = aˣ models growth where the rate is proportional to the current value. Key properties include: the base determines growth rate, the derivative of eˣ is itself, and logarithms are the inverse. Series like geometric progressions (a, ar, ar², ar³…) show exponential patterns.',
            },
            biology: {
                title: 'Population Dynamics',
                body: 'Bacterial colonies double at regular intervals following N(t) = N₀ × 2^(t/g), where g is generation time. This models unconstrained growth. In ecology, the logistic equation adds carrying capacity K, creating an S-curve. Epidemiology uses R₀ to track exponential disease spread.',
            },
            chemistry: {
                title: 'Reaction Kinetics',
                body: 'First-order reactions follow [A] = [A]₀ × e^(-kt), where k is the rate constant. Radioactive decay (half-life) is a prime example. The Arrhenius equation k = Ae^(-Ea/RT) shows how temperature exponentially affects reaction rates.',
            },
            physics: {
                title: 'Radioactive Decay',
                body: 'Nuclear decay follows N(t) = N₀e^(-λt) where λ is the decay constant. Half-life t½ = ln(2)/λ. This principle powers carbon-14 dating, nuclear medicine, and understanding stellar nucleosynthesis. Capacitor discharge also follows exponential decay: V(t) = V₀e^(-t/RC).',
            },
            economics: {
                title: 'Compound Interest',
                body: 'Money grows as A = P(1 + r/n)^(nt), approaching Pe^(rt) for continuous compounding. This same principle drives GDP growth projections, inflation calculations, and the "Rule of 72" for estimating doubling time.',
            },
        },
        aiInsight: 'The common thread is that the rate of change is proportional to the current amount. Nature, finance, and science all follow this same mathematical law. Once you understand eˣ in math, you unlock the pattern behind population biology, nuclear physics, and compound interest simultaneously.',
    },
    {
        id: 'waves-patterns',
        title: 'Waves, Oscillations & Patterns',
        emoji: '🌊',
        subjects: {
            math: {
                title: 'Trigonometric Functions',
                body: 'Sine and cosine functions model periodic behavior: f(t) = A·sin(ωt + φ). Fourier analysis decomposes ANY periodic function into a sum of sines and cosines. Key concepts: amplitude, frequency, phase shift, and the unit circle.',
            },
            physics: {
                title: 'Wave Mechanics',
                body: 'Sound, light, and water waves all follow the wave equation ∂²ψ/∂t² = v²∂²ψ/∂x². Properties like superposition, interference, and diffraction are universal. Standing waves in strings/pipes create harmonics — the physics behind music.',
            },
            biology: {
                title: 'Biological Rhythms',
                body: 'Circadian rhythms follow ~24-hour oscillations controlled by molecular clocks (PER/CRY proteins). Heart ECGs are periodic waves. Neural oscillations (brain waves: alpha, beta, theta) govern consciousness states. Even predator-prey populations oscillate in Lotka-Volterra cycles.',
            },
            cs: {
                title: 'Signal Processing',
                body: 'Digital signals are sampled sine waves (Nyquist theorem). Fourier transforms convert time-domain signals to frequency-domain for compression (MP3, JPEG). Oscillating algorithms include alternating optimization and wave-function collapse for procedural generation.',
            },
            english: {
                title: 'Rhythm in Literature',
                body: 'Poetic meter (iambic pentameter: da-DUM da-DUM) creates wave-like rhythmic patterns. Narrative structure follows oscillating tension (rising action → climax → falling action). Rhetorical devices like anaphora create repetitive "wave" patterns in prose.',
            },
        },
        aiInsight: 'Waves are everywhere — from the math of sine curves to the physics of sound, the rhythms of your heartbeat, the processing of digital music, and even the meter of Shakespeare. The same sinusoidal pattern connects all these fields.',
    },
    {
        id: 'systems-feedback',
        title: 'Systems, Feedback & Equilibrium',
        emoji: '⚖️',
        subjects: {
            biology: {
                title: 'Homeostasis',
                body: 'The body maintains stable internal conditions through negative feedback: thermoregulation (hypothalamus → sweat/shiver), blood glucose (insulin/glucagon), and blood pH (buffer systems). Positive feedback occurs in blood clotting and childbirth (oxytocin loops).',
            },
            chemistry: {
                title: 'Chemical Equilibrium',
                body: 'Le Chatelier\'s principle: when a system at equilibrium is disturbed, it shifts to counteract the change. The equilibrium constant K = [products]/[reactants] determines position. Buffer solutions resist pH changes through conjugate acid-base pairs — a chemical feedback system.',
            },
            economics: {
                title: 'Market Equilibrium',
                body: 'Supply and demand reach equilibrium where quantity supplied equals quantity demanded. Price mechanisms act as feedback: excess supply → prices fall → demand rises. Central banks use interest rates as a feedback mechanism to control inflation and employment.',
            },
            cs: {
                title: 'Control Systems & Algorithms',
                body: 'PID controllers use proportional, integral, and derivative feedback to maintain stable outputs (thermostats, cruise control). Machine learning uses gradient descent — a feedback loop minimizing error. TCP congestion control adjusts data flow rates based on network feedback.',
            },
            physics: {
                title: 'Thermodynamic Equilibrium',
                body: 'Systems evolve toward maximum entropy (2nd law of thermodynamics). Thermal equilibrium means no net heat flow between connected systems. In mechanics, stable equilibrium occurs at potential energy minima — a ball at the bottom of a bowl always returns when displaced.',
            },
        },
        aiInsight: 'Feedback loops and equilibrium are universal organizing principles. Your body\'s temperature regulation, a chemical reaction reaching balance, market prices finding their level, and an algorithm converging on a solution all follow the same pattern: detect deviation → respond → stabilize.',
    },
    {
        id: 'symmetry-structure',
        title: 'Symmetry, Structure & Patterns',
        emoji: '🔷',
        subjects: {
            math: {
                title: 'Group Theory & Symmetry',
                body: 'Mathematical symmetry is described by groups — sets of transformations that preserve structure. Rotation groups, reflection groups, and permutation groups classify all possible symmetries. The Fundamental Theorem of Algebra connects polynomial roots to symmetric functions.',
            },
            chemistry: {
                title: 'Molecular Geometry',
                body: 'VSEPR theory predicts molecular shapes: tetrahedral (CH₄), trigonal planar (BF₃), linear (CO₂). Crystal structures form 14 Bravais lattices with specific symmetries. Chirality — mirror-image molecules — explains why thalidomide had different effects for each enantiomer.',
            },
            biology: {
                title: 'Biological Symmetry',
                body: 'Bilateral symmetry (humans, most animals) enables directional movement. Radial symmetry (starfish, jellyfish) suits sedentary/floating lifestyles. DNA\'s double helix has rotational symmetry. Fibonacci spirals appear in sunflower seeds, pinecones, and nautilus shells.',
            },
            physics: {
                title: 'Conservation Laws',
                body: 'Noether\'s theorem: every symmetry has a corresponding conservation law. Time symmetry → energy conservation. Spatial symmetry → momentum conservation. Rotational symmetry → angular momentum conservation. This is one of the deepest results in all of physics.',
            },
            history: {
                title: 'Symmetry in Architecture',
                body: 'Ancient civilizations encoded mathematical symmetry into structures: the Parthenon\'s golden ratio, Islamic geometric art with 8-fold and 12-fold symmetry, Gothic cathedral rose windows, and Mughal architecture\'s bilateral perfection in the Taj Mahal.',
            },
        },
        aiInsight: 'Symmetry is the hidden language of nature and human creation. The same mathematical framework (group theory) explains why molecules have specific shapes, why your body is bilaterally symmetric, why energy is conserved, and why ancient buildings are beautiful.',
    },
    {
        id: 'energy-transformation',
        title: 'Energy Transformation & Conservation',
        emoji: '⚡',
        subjects: {
            physics: {
                title: 'Laws of Thermodynamics',
                body: 'Energy cannot be created or destroyed, only transformed (1st law). Every transformation increases total entropy (2nd law). Kinetic ↔ potential energy conversions power everything from pendulums to planetary orbits. E = mc² shows mass itself is concentrated energy.',
            },
            biology: {
                title: 'Cellular Metabolism',
                body: 'ATP is the universal energy currency. Photosynthesis converts light energy → chemical energy (glucose). Cellular respiration reverses this: glucose → ATP + CO₂ + H₂O. The electron transport chain creates a proton gradient — a biological battery. Food webs track energy flow through ecosystems.',
            },
            chemistry: {
                title: 'Enthalpy & Bond Energy',
                body: 'Exothermic reactions release energy (negative ΔH): combustion, neutralization. Endothermic reactions absorb energy: photosynthesis, dissolving salts. Hess\'s Law lets us calculate energy changes for any reaction from known bond energies. Activation energy determines reaction speed.',
            },
            economics: {
                title: 'Resource Economics',
                body: 'Economic systems transform raw resources into goods (value-added production). The laws of thermodynamics constrain economic activity — you can\'t create wealth from nothing. Energy economics studies how fossil fuel → renewable transitions affect GDP, employment, and growth.',
            },
        },
        aiInsight: 'The universe runs on energy transformations. Physics defines the rules, chemistry shows how bonds store and release energy, biology builds living engines (mitochondria) to harness it, and economics tracks how human societies manage these energy flows.',
    },
    {
        id: 'data-probability',
        title: 'Data, Probability & Prediction',
        emoji: '🎲',
        subjects: {
            math: {
                title: 'Probability & Statistics',
                body: 'Probability theory quantifies uncertainty: P(A∩B) = P(A)·P(B|A). The Central Limit Theorem shows that sample means follow a normal distribution regardless of the population shape. Bayes\' theorem updates beliefs with new evidence: P(H|D) ∝ P(D|H)·P(H).',
            },
            cs: {
                title: 'Machine Learning',
                body: 'ML algorithms learn patterns from data to make predictions. Classification (spam detection), regression (price prediction), and clustering (customer segmentation) are core tasks. Neural networks approximate any function. Training uses optimization (gradient descent) on probability-based loss functions.',
            },
            biology: {
                title: 'Genetics & Evolution',
                body: 'Mendelian genetics uses probability: crossing Aa × Aa gives 1:2:1 genotype ratio. Hardy-Weinberg equilibrium predicts allele frequencies. Evolutionary fitness is probabilistic — natural selection shifts probability distributions of traits across generations.',
            },
            economics: {
                title: 'Risk & Decision Theory',
                body: 'Expected value E(X) = Σ xᵢP(xᵢ) guides rational decisions under uncertainty. Portfolio theory uses variance and covariance to optimize risk-return tradeoffs. Game theory models strategic decisions where outcomes depend on others\' probabilistic choices.',
            },
        },
        aiInsight: 'Probability is the mathematics of uncertainty. It predicts genetic outcomes, trains AI systems, guides financial decisions, and underlies all of statistics. Bayes\' theorem — updating beliefs with evidence — is arguably the single most important equation across all these fields.',
    },
    {
        id: 'networks-graphs',
        title: 'Networks, Graphs & Connections',
        emoji: '🕸️',
        subjects: {
            math: {
                title: 'Graph Theory',
                body: 'Graphs are sets of vertices (nodes) connected by edges. Euler\'s bridges of Königsberg launched the field. Key concepts: degree, paths, cycles, trees, planar graphs. Graph coloring, shortest paths (Dijkstra), and network flow algorithms solve real-world problems.',
            },
            cs: {
                title: 'Data Structures & Internet',
                body: 'Trees, linked lists, and hash maps are graph-based structures. The internet is a massive graph of connected devices. Social networks use graph algorithms for friend recommendations. PageRank (Google\'s algorithm) ranks web pages by their graph connectivity.',
            },
            biology: {
                title: 'Ecosystems & Neural Networks',
                body: 'Food webs are directed graphs showing energy flow. Gene regulatory networks control cell behavior through complex feedback circuits. The brain is a network of ~86 billion neurons with ~100 trillion synaptic connections. Phylogenetic trees map evolutionary relationships.',
            },
            economics: {
                title: 'Trade & Social Networks',
                body: 'International trade forms a complex weighted graph. Supply chains are directed networks where disruptions propagate. Social network effects drive adoption curves. Network economics explains why platforms (with network effects) tend toward monopoly.',
            },
        },
        aiInsight: 'The world is a web of connections. Graph theory provides the mathematical language to analyze everything from the internet and social media to brain connectivity and trade routes. Understanding networks in one field immediately translates to insights in all others.',
    },
];

const QUICK_TOPICS = [
    { title: 'Calculus Meets Motion', subjects: ['math', 'physics'], desc: 'How derivatives describe velocity and integrals give displacement' },
    { title: 'Evolution & Algorithms', subjects: ['biology', 'cs'], desc: 'Genetic algorithms mimic natural selection to solve optimization' },
    { title: 'Renaissance: Art Meets Science', subjects: ['history', 'physics'], desc: 'How the Scientific Revolution reshaped human understanding' },
    { title: 'Language of Logic', subjects: ['english', 'cs', 'math'], desc: 'From rhetorical arguments to Boolean algebra and proofs' },
    { title: 'Market Biology', subjects: ['economics', 'biology'], desc: 'How ecosystems and markets both reach equilibria' },
    { title: 'Quantum Computing', subjects: ['physics', 'cs', 'math'], desc: 'Where quantum mechanics powers the next computing revolution' },
];

/* ==========================================
   PAGE COMPONENTS
   ==========================================*/

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.06 } },
};

/* ---------- HOME ---------- */
function HomePage({ onNavigate, gardenCount }) {
    return (
        <motion.div {...fadeUp}>
            {/* Hero */}
            <div className="hero">
                <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <h1>
                        Learn Smarter.<br />
                        <span className="gradient-text">Connect Everything.</span>
                    </h1>
                    <p>
                        Upload your study PDFs, tag them by subject, and let SynapseLearn break them down into
                        easy-to-learn notes, flashcards, and cross-subject connections.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary" onClick={() => onNavigate('garden')}>
                            🌱 Upload PDFs to Garden
                        </button>
                        <button className="btn btn-secondary" onClick={() => onNavigate('study')}>
                            🧠 Start Studying
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Stats */}
            <motion.div className="stats-row" variants={stagger} initial="initial" animate="animate">
                {[
                    { icon: '🌱', value: gardenCount || '0', label: 'PDFs in Garden', bg: 'rgba(34,211,167,0.12)' },
                    { icon: '📚', value: '8', label: 'Subjects', bg: 'rgba(99,102,241,0.12)' },
                    { icon: '🔗', value: '7', label: 'Cross-Connections', bg: 'rgba(168,85,247,0.12)' },
                    { icon: '🤖', value: 'AI', label: 'Powered Insights', bg: 'rgba(236,72,153,0.12)' },
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

            {/* How It Works */}
            <h3 className="section-title">🚀 How It Works</h3>
            <motion.div className="topics-grid" variants={stagger} initial="initial" animate="animate">
                {[
                    { title: '1. Upload Your PDFs', desc: 'Drop your study materials — textbooks, notes, papers — into your garden', icon: '📄', color: '#4f8cff' },
                    { title: '2. Tag by Subject', desc: 'Organize files by subject — Math, Physics, Biology, or create your own', icon: '🏷️', color: '#a855f7' },
                    { title: '3. Study Smart', desc: 'Get AI-broken-down notes, flashcards, and key concepts from your content', icon: '🧠', color: '#22d3a7' },
                    { title: '4. See Connections', desc: 'Discover how concepts across subjects link together', icon: '🔗', color: '#ec4899' },
                ].map((t, i) => (
                    <motion.div
                        className="topic-card"
                        key={i}
                        variants={fadeUp}
                        onClick={() => i === 0 ? onNavigate('garden') : i === 2 ? onNavigate('study') : onNavigate('explore')}
                    >
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '0 4px 4px 0', background: t.color }} />
                        <div className="topic-title">{t.icon} {t.title}</div>
                        <div className="topic-desc">{t.desc}</div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}

/* ---------- EXPLORE ---------- */
function ExplorePage({ selectedSubjects, onToggleSubject, onNavigate }) {
    return (
        <motion.div {...fadeUp}>
            <div className="page-header">
                <h2>🌍 Explore Subjects</h2>
                <p>Select 2–3 subjects to discover AI-powered connections between them</p>
            </div>

            <motion.div className="subject-grid" variants={stagger} initial="initial" animate="animate">
                {SUBJECTS.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.id);
                    return (
                        <motion.div
                            key={subject.id}
                            className={`subject-card ${isSelected ? 'selected' : ''}`}
                            variants={fadeUp}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onToggleSubject(subject.id)}
                            style={{
                                boxShadow: isSelected ? `0 8px 30px ${subject.glow}` : undefined,
                                borderColor: isSelected ? subject.color + '50' : undefined,
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: isSelected ? 5 : 3, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', background: subject.color, transition: 'height 0.25s ease' }} />
                            <div className="check-badge" style={{ background: subject.color, opacity: isSelected ? 1 : 0, transform: isSelected ? 'scale(1)' : 'scale(0.5)' }}>✓</div>
                            <span className="subject-icon">{subject.icon}</span>
                            <div className="subject-name" style={{ color: isSelected ? subject.color : undefined }}>{subject.name}</div>
                            <div className="subject-topics">
                                {CROSS_CONNECTIONS.filter(c => c.subjects[subject.id]).length} connected topics
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {selectedSubjects.length >= 2 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={() => onNavigate('learn')} style={{ fontSize: '1rem', padding: '14px 32px' }}>
                        🧠 See {selectedSubjects.length} Subject Connections →
                    </button>
                </motion.div>
            )}

            {selectedSubjects.length === 1 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 12, fontSize: '0.9rem' }}>
                    Select at least one more subject to see cross-connections
                </motion.p>
            )}
        </motion.div>
    );
}

/* ---------- LEARN (Main Canvas) ---------- */
function LearnPage({ selectedSubjects, onToggleSubject, onNavigate }) {
    const [expandedId, setExpandedId] = useState(null);

    const relevantConnections = useMemo(() => {
        if (selectedSubjects.length < 2) return [];
        return CROSS_CONNECTIONS.filter(conn => {
            const connSubjects = Object.keys(conn.subjects);
            const matches = selectedSubjects.filter(s => connSubjects.includes(s));
            return matches.length >= 2;
        });
    }, [selectedSubjects]);

    const selectedSubjectData = selectedSubjects.map(id => SUBJECTS.find(s => s.id === id)).filter(Boolean);
    const colsClass = selectedSubjects.length >= 3 ? 'cols-3' : 'cols-2';

    return (
        <motion.div {...fadeUp}>
            <div className="page-header">
                <h2>🧠 Learning Canvas</h2>
                <p>See how your subjects connect — AI reveals the hidden patterns</p>
            </div>

            {/* Selected Subjects */}
            <div className="selected-subjects">
                {selectedSubjectData.map(subject => (
                    <motion.span
                        key={subject.id}
                        className="subject-pill"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            color: subject.color,
                            borderColor: subject.color + '40',
                            background: subject.color + '10',
                        }}
                        onClick={() => onToggleSubject(subject.id)}
                    >
                        {subject.icon} {subject.name}
                        <span className="remove-btn">✕</span>
                    </motion.span>
                ))}
                {selectedSubjects.length < 3 && (
                    <motion.span
                        className="subject-pill"
                        style={{ color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}
                        onClick={() => onNavigate('explore')}
                        whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                        + Add subject
                    </motion.span>
                )}
            </div>

            {/* Connections */}
            {selectedSubjects.length < 2 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎯</div>
                    <h3>Pick your subjects</h3>
                    <p>Select at least 2 subjects from the Explore tab to see AI-powered cross-connections</p>
                    <button className="btn btn-primary" onClick={() => onNavigate('explore')} style={{ marginTop: 20 }}>
                        🌍 Go to Explore
                    </button>
                </div>
            ) : relevantConnections.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No direct connections found</h3>
                    <p>Try selecting different subject combinations to discover cross-connections</p>
                </div>
            ) : (
                <motion.div className="learning-canvas" variants={stagger} initial="initial" animate="animate">
                    {relevantConnections.map((conn) => {
                        const isExpanded = expandedId === conn.id;
                        const activeSubjects = selectedSubjects.filter(s => conn.subjects[s]).map(id => SUBJECTS.find(s => s.id === id));

                        return (
                            <motion.div
                                key={conn.id}
                                className="connection-card"
                                variants={fadeUp}
                                layout
                            >
                                <div
                                    className="connection-title"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setExpandedId(isExpanded ? null : conn.id)}
                                >
                                    <span>{conn.emoji}</span>
                                    {conn.title}
                                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                                </div>
                                <div className="connection-subtitle">
                                    Connects: {activeSubjects.map(s => s.name).join(' • ')}
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className={`connection-columns ${colsClass}`}>
                                                {activeSubjects.map(subject => {
                                                    const data = conn.subjects[subject.id];
                                                    return (
                                                        <div className="subject-column" key={subject.id} style={{ borderColor: subject.color + '20' }}>
                                                            <div className="col-header">
                                                                <span className="col-icon">{subject.icon}</span>
                                                                <span className="col-name" style={{ color: subject.color }}>{data.title}</span>
                                                            </div>
                                                            <div className="col-body">{data.body}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="ai-insight">
                                                <span className="ai-icon">🤖</span>
                                                <div>
                                                    <div className="ai-label">AI Synapse Insight</div>
                                                    <div className="ai-text">{conn.aiInsight}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}

/* ---------- PROFILE ---------- */
function ProfilePage() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const activeDays = [0, 1, 2, 4, 5]; // mon, tue, wed, fri, sat

    return (
        <motion.div className="profile-page" {...fadeUp}>
            <div className="page-header">
                <h2>👤 Your Profile</h2>
                <p>Track your learning journey</p>
            </div>

            <motion.div className="profile-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="profile-avatar">T</div>
                <h2>Tejas</h2>
                <p className="profile-email">tejas@synapselearn.com</p>
                <div className="profile-badges">
                    {[
                        { label: '🔥 5 Day Streak', color: '#f59e0b' },
                        { label: '🧠 Cross-Connector', color: '#a855f7' },
                        { label: '📐 Math Explorer', color: '#4f8cff' },
                    ].map((b, i) => (
                        <span key={i} className="badge" style={{ borderColor: b.color + '40', color: b.color }}>{b.label}</span>
                    ))}
                </div>
            </motion.div>

            <motion.div className="streak-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h3>📅 This Week's Learning Streak</h3>
                <div className="streak-days">
                    {days.map((d, i) => (
                        <div key={i} className={`streak-day ${activeDays.includes(i) ? 'active' : ''}`}>{d}</div>
                    ))}
                </div>
            </motion.div>

            <motion.div className="stats-row" style={{ marginTop: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                {[
                    { icon: '📖', value: '23', label: 'Topics Learned', bg: 'rgba(99,102,241,0.12)' },
                    { icon: '🔗', value: '12', label: 'Connections Made', bg: 'rgba(168,85,247,0.12)' },
                    { icon: '⏱️', value: '4.5h', label: 'Study Time', bg: 'rgba(34,211,167,0.12)' },
                ].map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                        <div>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}

/* ==========================================
   MAIN APP
   ==========================================*/
export default function App() {
    const [page, setPage] = useState('home');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [studySubject, setStudySubject] = useState(null);

    // Load garden items from localStorage
    const [gardenItems, setGardenItems] = useState(() => {
        try {
            const saved = localStorage.getItem('gardenItems');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const toggleSubject = (id) => {
        setSelectedSubjects(prev => {
            if (prev.includes(id)) return prev.filter(s => s !== id);
            if (prev.length >= 3) return prev; // max 3 subjects
            return [...prev, id];
        });
    };

    const handleNavigate = (targetPage, subject) => {
        if (targetPage === 'study' && subject) {
            setStudySubject(subject);
        } else if (targetPage === 'study') {
            setStudySubject(null);
        }
        setPage(targetPage);
    };

    const navItems = [
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'garden', icon: '🌱', label: 'My Garden' },
        { id: 'study', icon: '🧠', label: 'Study' },
        { id: 'explore', icon: '🌍', label: 'Explore' },
        { id: 'learn', icon: '🔗', label: 'Connections' },
        { id: 'profile', icon: '👤', label: 'Profile' },
    ];

    return (
        <div className="app-layout">
            {/* Animated Background */}
            <div className="animated-bg">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
                <div className="orb orb-4" />
            </div>

            {/* Sidebar */}
            <nav className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">⚡</div>
                    <h1>SynapseLearn</h1>
                </div>

                <div className="sidebar-nav">
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            className={`nav-item ${page === item.id ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <div className="user-info" onClick={() => handleNavigate('profile')}>
                        <div className="avatar">T</div>
                        <div>
                            <div className="user-name">Tejas</div>
                            <div className="user-role">Student</div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <AnimatePresence mode="wait">
                    {page === 'home' && <HomePage key="home" onNavigate={handleNavigate} gardenCount={gardenItems.length} />}
                    {page === 'garden' && (
                        <GardenPage
                            key="garden"
                            gardenItems={gardenItems}
                            setGardenItems={setGardenItems}
                            onNavigate={handleNavigate}
                        />
                    )}
                    {page === 'study' && (
                        <StudyPage
                            key="study"
                            gardenItems={gardenItems}
                            studySubject={studySubject}
                            onNavigate={handleNavigate}
                        />
                    )}
                    {page === 'explore' && (
                        <ExplorePage
                            key="explore"
                            selectedSubjects={selectedSubjects}
                            onToggleSubject={toggleSubject}
                            onNavigate={handleNavigate}
                        />
                    )}
                    {page === 'learn' && (
                        <LearnPage
                            key="learn"
                            selectedSubjects={selectedSubjects}
                            onToggleSubject={toggleSubject}
                            onNavigate={handleNavigate}
                        />
                    )}
                    {page === 'profile' && <ProfilePage key="profile" />}
                </AnimatePresence>
            </main>
        </div>
    );
}
