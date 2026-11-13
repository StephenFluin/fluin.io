import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isValidLinkTarget, slugProblem } from './quick-links.ts';

test('slugProblem accepts simple lowercase slugs', () => {
    assert.equal(slugProblem('meet'), null);
    assert.equal(slugProblem('ng-conf-2026'), null);
    assert.equal(slugProblem('a'), null);
});

test('slugProblem rejects slugs that are hard to type or contain paths', () => {
    for (const slug of ['', 'Meet', 'my link', '-meet', 'meet-', 'a/b', 'feed.xml', '..']) {
        assert.notEqual(slugProblem(slug), null, slug);
    }
});

test('slugProblem rejects pages the site already has', () => {
    assert.match(slugProblem('blog')!, /already a page/);
    assert.match(slugProblem('admin')!, /already a page/);
});

test('isValidLinkTarget only allows http and https URLs', () => {
    assert.equal(isValidLinkTarget('https://calendly.com/stephenfluin'), true);
    assert.equal(isValidLinkTarget('http://example.com'), true);
    assert.equal(isValidLinkTarget('javascript:alert(1)'), false);
    assert.equal(isValidLinkTarget('data:text/html,hi'), false);
    assert.equal(isValidLinkTarget('calendly.com/stephenfluin'), false);
    assert.equal(isValidLinkTarget(''), false);
});
