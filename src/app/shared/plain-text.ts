/**
 * Markdown as plain text, for meta descriptions and social cards. A light regex pass that covers the inline
 * syntax posts use, so the blog page doesn't need to load the full markdown renderer.
 */
export function markdownToPlainText(markdown: string): string {
    return (
        markdown
            // Images, then links, keeping link text
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/<[^>]+>/g, '')
            .replace(/`([^`]*)`/g, '$1')
            // Bold and italics. Underscores only count at word edges, so snake_case survives.
            .replace(/(\*\*|__)(.+?)\1/g, '$2')
            .replace(/\*([^*\s][^*]*)\*/g, '$1')
            .replace(/(^|\W)_([^_\s][^_]*)_(?=\W|$)/g, '$1$2')
            // Block markers: quotes and list bullets
            .replace(/^\s*(?:>\s*)+/, '')
            .replace(/^\s*(?:[-*+]|\d+\.)\s+/, '')
            .replace(/\s+/g, ' ')
            .trim()
    );
}
