/** Longest slug we'll generate from a title, so URLs stay readable */
const MAX_LENGTH = 80;

/** A URL slug for a post title, e.g. "What's new in Angular 22?" becomes "whats-new-in-angular-22" */
export function postSlug(title: string | undefined) {
    const slug = (title ?? '')
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '') // accents: "café" → "cafe"
        .toLowerCase()
        .replace(/['’]/g, '') // apostrophes: "what's" → "whats", not "what-s"
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    if (slug.length <= MAX_LENGTH) {
        return slug;
    }
    // Cut at a word boundary rather than mid-word
    const cut = slug.slice(0, MAX_LENGTH + 1);
    const lastDash = cut.lastIndexOf('-');
    return (lastDash > 0 ? cut.slice(0, lastDash) : slug.slice(0, MAX_LENGTH)).replace(/-$/, '');
}
