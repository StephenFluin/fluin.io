import assert from 'node:assert/strict';
import { test } from 'node:test';

import { postSlug } from './post-slug.ts';

test('postSlug is lowercase with dashes between words', () => {
    assert.equal(postSlug('Hello World'), 'hello-world');
    assert.equal(postSlug('  Angular 22: Signals & SSR!  '), 'angular-22-signals-ssr');
});

test('postSlug drops apostrophes and accents instead of turning them into dashes', () => {
    assert.equal(postSlug("What's new in Angular?"), 'whats-new-in-angular');
    assert.equal(postSlug('Don’t panic'), 'dont-panic');
    assert.equal(postSlug('Café crème'), 'cafe-creme');
});

test('postSlug handles empty titles', () => {
    assert.equal(postSlug(''), '');
    assert.equal(postSlug(undefined), '');
    assert.equal(postSlug('!!!'), '');
});

test('postSlug cuts long titles at a word boundary', () => {
    const slug = postSlug('word '.repeat(30));
    assert.ok(slug.length <= 80);
    assert.match(slug, /^word(-word)*$/);
});
