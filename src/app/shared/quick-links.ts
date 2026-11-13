/** A quick link as stored in the realtime db at links/{slug}: fluin.io/{slug} redirects to `url` */
export interface QuickLink {
    url: string;
}

/** Lowercase letters, digits and dashes, so slugs are easy to type and say out loud */
const VALID_SLUG = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/** Top-level paths the site already uses, which a quick link must not hide */
const RESERVED_SLUGS = new Set(['admin', 'api', 'assets', 'bio', 'blog', 'internal', 'projects']);

/** Why `slug` can't be used for a quick link, or null if it can */
export function slugProblem(slug: string): string | null {
    if (!VALID_SLUG.test(slug)) {
        return 'Use lowercase letters, numbers and dashes, starting and ending with a letter or number.';
    }
    if (RESERVED_SLUGS.has(slug)) {
        return `/${slug} is already a page on the site.`;
    }
    return null;
}

/** Only redirect to http(s) URLs, so a link can't become a javascript: or data: URL */
export function isValidLinkTarget(url: string) {
    try {
        const { protocol } = new URL(url);
        return protocol === 'https:' || protocol === 'http:';
    } catch {
        return false;
    }
}
