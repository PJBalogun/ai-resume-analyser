import assert from 'node:assert/strict';
import { test } from 'node:test';
import { serviceErrorMessage } from '../app/lib/serviceErrors.ts';

test('preserves Puter string, message, msg and nested provider errors', () => {
    assert.equal(serviceErrorMessage('Provider unavailable', 'Fallback'), 'Provider unavailable');
    assert.equal(serviceErrorMessage(new Error('Network failed'), 'Fallback'), 'Network failed');
    assert.equal(serviceErrorMessage({ msg: 'Account permission denied' }, 'Fallback'), 'Account permission denied');
    assert.equal(serviceErrorMessage({ error: { code: 'insufficient_funds', message: 'AI balance exhausted' } }, 'Fallback'), 'AI balance exhausted (insufficient_funds)');
    assert.equal(serviceErrorMessage({ code: 'storage_limit_reached' }, 'Fallback'), 'Fallback (storage_limit_reached)');
    assert.equal(serviceErrorMessage(undefined, 'Fallback'), 'Fallback');
});

test('explains sign-in popup failures and cancelled sign-in', () => {
    assert.match(serviceErrorMessage({ error: 'popup_blocked', msg: 'Blocked' }, ''), /Allow popups/);
    assert.match(serviceErrorMessage({ error: 'auth_window_closed', msg: 'Closed' }, ''), /closed before sign-in finished/);
    assert.match(serviceErrorMessage({ error: 'unsupported_origin' }, ''), /Chrome or Edge/);
});

test('handles circular and unknown errors without throwing', () => {
    const circular = {};
    circular.error = circular;
    assert.equal(serviceErrorMessage(circular, 'Fallback'), 'Fallback');
    assert.equal(serviceErrorMessage({ unrelated: true }, 'Fallback'), 'Fallback');
});
