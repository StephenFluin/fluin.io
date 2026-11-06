import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
    ALLOWED_IMAGE_SIZES,
    IMAGE_QUALITY,
    buildOptimizedImageUrl,
    buildResponsiveImageSet,
    isOptimizableImage,
    toAbsoluteImageUrl,
} from './image-url.ts';

const BUCKET_IMAGE =
    'https://firebasestorage.googleapis.com/v0/b/fluindotio-website-93127.appspot.com/o/posts%2Fa%2Fb.jpg?alt=media&token=abc';

test('only images in our own storage bucket are optimizable', () => {
    assert.equal(isOptimizableImage(BUCKET_IMAGE), true);
    assert.equal(isOptimizableImage('https://example.com/a.jpg'), false);
    assert.equal(isOptimizableImage('https://firebasestorage.googleapis.com/v0/b/someone-else.appspot.com/o/a.jpg'), false);
    assert.equal(
        isOptimizableImage('https://firebasestorage.googleapis.com.example.com/v0/b/fluindotio-website-93127.appspot.com/o/a.jpg'),
        false
    );
    assert.equal(isOptimizableImage('/assets/images/mainpic.jpg'), false);
    assert.equal(isOptimizableImage('not a url'), false);
});

test('missing images get the placeholder and external images are left alone', () => {
    assert.equal(buildOptimizedImageUrl(undefined), '/assets/images/imgpostholder.png');
    assert.equal(buildOptimizedImageUrl(''), '/assets/images/imgpostholder.png');
    assert.equal(buildOptimizedImageUrl('https://example.com/a.jpg', { width: 300 }), 'https://example.com/a.jpg');
});

test('bucket images go through /api/image with their size, quality, and fit', () => {
    const url = new URL(buildOptimizedImageUrl(BUCKET_IMAGE, { width: 600, height: 360, quality: 68 }), 'https://fluin.io');
    assert.equal(url.pathname, '/api/image');
    assert.equal(url.searchParams.get('url'), BUCKET_IMAGE);
    assert.equal(url.searchParams.get('w'), '600');
    assert.equal(url.searchParams.get('h'), '360');
    assert.equal(url.searchParams.get('q'), '68');
    assert.equal(url.searchParams.get('fit'), 'cover');
});

test('responsive sets keep the aspect ratio at each width', () => {
    const set = buildResponsiveImageSet(BUCKET_IMAGE, [300, 600], { width: 300, height: 180 })!;
    const candidates = set.split(', ').map((candidate) => {
        const [url, descriptor] = candidate.split(' ');
        const params = new URL(url, 'https://fluin.io').searchParams;
        return `${params.get('w')}x${params.get('h')} ${descriptor}`;
    });
    assert.deepEqual(candidates, ['300x180 300w', '600x360 600w']);

    assert.equal(buildResponsiveImageSet('https://example.com/a.jpg', [300, 600], { width: 300 }), null);
    assert.equal(buildResponsiveImageSet(undefined, [300, 600], { width: 300 }), null);
});

/** The server rejects sizes that aren't on the allow-list, which shows up as broken images */
test('the sizes components ask for are all on the allow-list', () => {
    const requested = [
        // post-list cards
        { widths: [300, 600], width: 300, height: 180 },
        // blog sidebar featured posts
        { widths: [240, 480], width: 240, height: 150 },
        // blog post hero
        { widths: [800, 1200], width: 1200, height: 675 },
    ];
    for (const { widths, width, height } of requested) {
        const set = buildResponsiveImageSet(BUCKET_IMAGE, widths, { width, height, quality: IMAGE_QUALITY.card })!;
        for (const candidate of set.split(', ')) {
            const params = new URL(candidate.split(' ')[0], 'https://fluin.io').searchParams;
            const size = `${params.get('w')}x${params.get('h')}`;
            assert.ok(ALLOWED_IMAGE_SIZES.has(size), `${size} is not in ALLOWED_IMAGE_SIZES`);
        }
    }
});

test('toAbsoluteImageUrl only prefixes site-relative paths', () => {
    assert.equal(toAbsoluteImageUrl('/api/image?w=1'), 'https://fluin.io/api/image?w=1');
    assert.equal(toAbsoluteImageUrl('https://example.com/a.jpg'), 'https://example.com/a.jpg');
});
