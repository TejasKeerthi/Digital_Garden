import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set up the PDF.js worker — use the CDN with correct version and .min.js (not .mjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Render a PDF page to a canvas and return it as an image data URL
 */
async function renderPageToImage(page, scale = 2.0) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/png');
}

/**
 * Run OCR on an image data URL using Tesseract.js
 */
async function ocrImage(imageDataUrl, onProgress) {
    const result = await Tesseract.recognize(imageDataUrl, 'eng', {
        logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
                onProgress(Math.round(m.progress * 100));
            }
        },
    });
    return result.data.text;
}

/**
 * Extract all text from a PDF file.
 * First tries native text extraction via pdf.js.
 * If a page has little/no text, falls back to OCR via Tesseract.js.
 *
 * @param {File} file - The PDF file object
 * @param {Function} onProgress - Optional callback: (message: string) => void
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromPDF(file, onProgress) {
    const arrayBuffer = await file.arrayBuffer();

    let pdf;
    try {
        pdf = await pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            useSystemFonts: true,
        }).promise;
    } catch (err) {
        console.error('pdf.js failed to load document, trying with fallback:', err);
        // Retry without worker (inline fallback)
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        pdf = await pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            isEvalSupported: false,
        }).promise;
    }

    const textParts = [];
    const totalPages = pdf.numPages;

    for (let i = 1; i <= totalPages; i++) {
        if (onProgress) onProgress(`Reading page ${i} of ${totalPages}...`);

        const page = await pdf.getPage(i);

        // Try native text extraction first
        let pageText = '';
        try {
            const content = await page.getTextContent();
            pageText = content.items
                .map(item => {
                    // Preserve spacing: if item has EOL flag, add newline
                    let str = item.str;
                    if (item.hasEOL) str += '\n';
                    return str;
                })
                .join(' ')
                .replace(/  +/g, ' ')
                .trim();
        } catch (err) {
            console.warn(`Text extraction failed for page ${i}:`, err);
        }

        // If native extraction got very little text, use OCR
        const meaningfulText = pageText.replace(/\s+/g, '').length;
        if (meaningfulText < 30) {
            if (onProgress) onProgress(`OCR scanning page ${i} of ${totalPages}...`);
            try {
                const imageUrl = await renderPageToImage(page);
                const ocrText = await ocrImage(imageUrl, (pct) => {
                    if (onProgress) onProgress(`OCR page ${i}/${totalPages}: ${pct}%`);
                });
                if (ocrText && ocrText.trim().length > meaningfulText) {
                    pageText = ocrText.trim();
                }
            } catch (err) {
                console.warn(`OCR failed for page ${i}:`, err);
            }
        }

        if (pageText.trim()) {
            textParts.push(pageText.trim());
        }
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
