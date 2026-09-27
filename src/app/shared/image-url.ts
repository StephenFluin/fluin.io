export interface OptimizedImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'inside';
}

/**
 * Only images in our own Firebase Storage bucket go through /api/image.
 * Anything else (older posts link to external images) is loaded directly.
 */
export function isOptimizableImage(src: string): boolean {
    try {
        const url = new URL(src);
        return (
            url.hostname === 'firebasestorage.googleapis.com' &&
            url.pathname.startsWith('/v0/b/fluindotio-website-93127.appspot.com/')
        );
    } catch {
        return false;
    }
}

export function buildOptimizedImageUrl(src: string | undefined | null, options: OptimizedImageOptions = {}): string {
    if (!src) {
        return '/assets/images/imgpostholder.png';
    }

    if (!isOptimizableImage(src)) {
        return src;
    }

    const params = new URLSearchParams({ url: src });

    if (options.width) {
        params.set('w', `${Math.round(options.width)}`);
    }

    if (options.height) {
        params.set('h', `${Math.round(options.height)}`);
    }

    if (options.quality) {
        params.set('q', `${Math.round(options.quality)}`);
    }

    params.set('fit', options.fit || 'cover');

    return `/api/image?${params.toString()}`;
}

export function buildResponsiveImageSet(
    src: string | undefined | null,
    widths: number[],
    options: OptimizedImageOptions & { width: number; height?: number }
): string | null {
    if (!src || !isOptimizableImage(src)) {
        return null;
    }

    const aspectRatio = options.height ? options.height / options.width : undefined;

    return widths
        .map((width) => {
            const height = aspectRatio ? Math.round(width * aspectRatio) : undefined;
            const url = buildOptimizedImageUrl(src, {
                ...options,
                width,
                height,
            });

            return `${url} ${width}w`;
        })
        .join(', ');
}

export function toAbsoluteImageUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `https://fluin.io${path}`;
}

export const IMAGE_QUALITY = {
    card: 68,
    feature: 70,
    hero: 74,
} as const;

/**
 * Every `widthxheight` the app requests from /api/image. The server rejects anything else so the
 * image cache can't be filled with arbitrary sizes. Add new sizes here when a component needs them.
 */
export const ALLOWED_IMAGE_SIZES: ReadonlySet<string> = new Set([
    // post-list cards
    '300x180',
    '600x360',
    // blog sidebar featured posts
    '240x150',
    '480x300',
    // blog post hero
    '800x450',
    '1200x675',
    // social share (og:image / twitter:image)
    '1200x630',
]);

export const ALLOWED_IMAGE_QUALITIES: ReadonlySet<number> = new Set(Object.values(IMAGE_QUALITY));