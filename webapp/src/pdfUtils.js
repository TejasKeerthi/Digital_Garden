import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extract all text from a PDF file
 * @param {File} file - The PDF file object
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        textParts.push(pageText);
    }

    return textParts.join('\n\n');
}

/**
 * Break extracted text into meaningful sections for learning
 * Splits by headings, double newlines, or large blocks
 */
export function breakIntoSections(text) {
    if (!text || text.trim().length === 0) return [];

    // Clean up the text
    let cleaned = text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    // Try splitting by double newlines (paragraph breaks)
    let paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 20);

    // If we got very few sections, try single newlines
    if (paragraphs.length < 3) {
        paragraphs = cleaned.split(/\n/).filter(p => p.trim().length > 20);
    }

    // If still too few, chunk by ~500 chars
    if (paragraphs.length < 2) {
        paragraphs = [];
        for (let i = 0; i < cleaned.length; i += 500) {
            const chunk = cleaned.slice(i, i + 500).trim();
            if (chunk.length > 20) paragraphs.push(chunk);
        }
    }

    return paragraphs.map((text, index) => ({
        id: index,
        text: text.trim(),
        isKeyPoint: text.length < 200, // Short sections are likely key points
    }));
}

/**
 * Generate simplified learning cards from sections
 */
export function generateLearningCards(sections, subjectName) {
    if (!sections || sections.length === 0) return [];

    const cards = [];

    // Overview card
    const allText = sections.map(s => s.text).join(' ');
    const firstFewSentences = allText.split(/[.!?]+/).slice(0, 3).join('. ').trim();
    if (firstFewSentences) {
        cards.push({
            type: 'overview',
            title: `${subjectName} — Overview`,
            content: firstFewSentences.length > 300 ? firstFewSentences.slice(0, 300) + '...' : firstFewSentences + '.',
            icon: '📖',
        });
    }

    // Key concept cards (from shorter sections or first sentences)
    const keySections = sections.filter(s => s.isKeyPoint).slice(0, 5);
    keySections.forEach((section, i) => {
        cards.push({
            type: 'key-concept',
            title: `Key Concept ${i + 1}`,
            content: section.text,
            icon: '💡',
        });
    });

    // Detailed content cards (from longer sections)
    const detailedSections = sections.filter(s => !s.isKeyPoint).slice(0, 8);
    detailedSections.forEach((section, i) => {
        cards.push({
            type: 'detail',
            title: `Section ${i + 1}`,
            content: section.text,
            icon: '📝',
        });
    });

    // Extract potential definitions (sentences with "is", "are", "means", "defined as")
    const definitionPattern = /([^.!?]*(?:\bis\b|\bare\b|\bmeans\b|\bdefined as\b|\brefers to\b)[^.!?]*[.!?])/gi;
    const definitions = allText.match(definitionPattern);
    if (definitions && definitions.length > 0) {
        cards.push({
            type: 'definitions',
            title: 'Key Definitions',
            content: definitions.slice(0, 6).map(d => d.trim()).join('\n\n'),
            icon: '📚',
        });
    }

    // Summary card
    const importantSentences = allText
        .split(/[.!?]+/)
        .filter(s => s.trim().length > 30 && s.trim().length < 200)
        .slice(0, 5)
        .map(s => '• ' + s.trim())
        .join('\n');

    if (importantSentences) {
        cards.push({
            type: 'summary',
            title: `${subjectName} — Quick Summary`,
            content: importantSentences,
            icon: '⚡',
        });
    }

    return cards;
}
