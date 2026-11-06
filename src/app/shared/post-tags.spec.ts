import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseTags, tagSlug } from './post-tags.ts';

test('parseTags trims tags and drops empty ones', () => {
    assert.deepEqual(parseTags(' Angular ,Web perf,, '), ['Angular', 'Web perf']);
    assert.deepEqual(parseTags(undefined), []);
    assert.deepEqual(parseTags(''), []);
});

test('parseTags keeps the first spelling of tags with the same slug', () => {
    assert.deepEqual(parseTags('Web Perf, web-perf, WEB PERF, Angular'), ['Web Perf', 'Angular']);
});

test('tagSlug is lowercase with dashes for everything else', () => {
    assert.equal(tagSlug('Web Performance'), 'web-performance');
    assert.equal(tagSlug('  C++ & Node.js!  '), 'c-node-js');
    assert.equal(tagSlug('AI'), 'ai');
});
