import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isPublished, publishedAt } from './post-dates.ts';

test('posts without a date are drafts', () => {
    assert.equal(isPublished({}), false);
    assert.equal(isPublished({ date: '' }), false);
});

test('posts go live at midnight in Chicago, not UTC', (t) => {
    // 11:59pm on March 9 in Chicago (daylight time, UTC-5)
    t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-03-10T04:59:00Z') });
    assert.equal(isPublished({ date: '2026-03-09' }), true);
    assert.equal(isPublished({ date: '2026-03-10' }), false);

    t.mock.timers.setTime(Date.parse('2026-03-10T05:00:00Z'));
    assert.equal(isPublished({ date: '2026-03-10' }), true);
    assert.equal(isPublished({ date: '2026-03-11' }), false);
});

test('publishedAt is midnight in Chicago, in standard and daylight time', () => {
    assert.equal(publishedAt('2026-01-15').toISOString(), '2026-01-15T06:00:00.000Z');
    assert.equal(publishedAt('2026-07-15').toISOString(), '2026-07-15T05:00:00.000Z');
});

test('publishedAt uses the offset in effect at midnight on days the clocks change', () => {
    // Clocks change at 2am, so midnight is still on the old offset
    assert.equal(publishedAt('2026-03-08').toISOString(), '2026-03-08T06:00:00.000Z');
    assert.equal(publishedAt('2026-11-01').toISOString(), '2026-11-01T05:00:00.000Z');
});
