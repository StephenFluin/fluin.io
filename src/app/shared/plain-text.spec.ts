import assert from 'node:assert/strict';
import { test } from 'node:test';

import { markdownToPlainText } from './plain-text.ts';

test('links keep their text and images are dropped', () => {
    assert.equal(markdownToPlainText('Read [the docs](https://angular.dev) today'), 'Read the docs today');
    assert.equal(markdownToPlainText('![diagram](https://example.com/a.png) After the image'), 'After the image');
});

test('inline formatting is removed', () => {
    assert.equal(markdownToPlainText('**Bold**, *italic*, _also italic_ and `code`'), 'Bold, italic, also italic and code');
    assert.equal(markdownToPlainText('Some <em>inline</em> HTML'), 'Some inline HTML');
});

test('underscores inside words survive', () => {
    assert.equal(markdownToPlainText('Set snake_case_name and other_name'), 'Set snake_case_name and other_name');
});

test('quote and list markers are removed from the start', () => {
    assert.equal(markdownToPlainText('> A quoted line'), 'A quoted line');
    assert.equal(markdownToPlainText('- A bullet'), 'A bullet');
    assert.equal(markdownToPlainText('1. A numbered item'), 'A numbered item');
});

test('whitespace is collapsed', () => {
    assert.equal(markdownToPlainText('  spread \t over\n lines  '), 'spread over lines');
});
