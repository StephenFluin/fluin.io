/**
 * Posts go live at midnight in the author's time zone, no matter where the server or the reader is.
 * Shared by the app and the server (sitemap, RSS) so they agree on what's public.
 */
export const PUBLISH_TIME_ZONE = 'America/Chicago';

/** Today's date in the publishing time zone, as YYYY-MM-DD (the same format posts store) */
function todayInPublishTimeZone() {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: PUBLISH_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const part = (type: string) => parts.find((p) => p.type === type)!.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
}

/** A post is published once its date has arrived. Posts without a date are drafts. */
export function isPublished(post: { date?: string }): boolean {
    return !!post.date && post.date <= todayInPublishTimeZone();
}

/** The publishing time zone's offset from UTC at a given moment, in milliseconds (e.g. -5 hours in summer) */
function offsetAt(moment: number) {
    const name = new Intl.DateTimeFormat('en-US', { timeZone: PUBLISH_TIME_ZONE, timeZoneName: 'longOffset' })
        .formatToParts(moment)
        .find((p) => p.type === 'timeZoneName')!.value; // "GMT-05:00", or "GMT" for UTC
    const [, sign, hours, minutes] = name.match(/([+-])(\d{2}):(\d{2})/) ?? ['', '+', '0', '0'];
    return (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes)) * 60_000;
}

/** The moment a post went live: midnight on its date in the publishing time zone */
export function publishedAt(date: string): Date {
    const midnightUtc = Date.parse(`${date}T00:00:00Z`);
    // Guess with the offset at UTC midnight, then correct it with the offset in effect at the guess,
    // which matters on days the clocks change
    const guess = midnightUtc - offsetAt(midnightUtc);
    return new Date(midnightUtc - offsetAt(guess));
}
