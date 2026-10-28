/** Tags are stored on a post as one comma-separated string (e.g. "Angular, Web performance"), so they're easy to edit */
export function parseTags(tags: string | undefined): string[] {
    const seen = new Set<string>();
    return (tags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag && !seen.has(tagSlug(tag)) && seen.add(tagSlug(tag)));
}

/** The URL form of a tag, used in /blog?tag=… and to match tags regardless of case or spacing */
export function tagSlug(tag: string) {
    return tag
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
