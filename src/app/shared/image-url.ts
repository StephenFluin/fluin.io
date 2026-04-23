export interface OptimizedImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'inside';
}

const DEFAULT_QUALITY = 72;

export function buildOptimizedImageUrl(src: string | undefined | null, options: OptimizedImageOptions = {}): string {
    if (!src) {
        return '/assets/images/imgpostholder.png';
    }

    if (!/^https?:\/\//i.test(src)) {
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
    if (!src || !/^https?:\/\//i.test(src)) {
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