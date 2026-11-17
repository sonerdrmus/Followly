import assert from 'node:assert/strict';
import test from 'node:test';

import { shareInFlight } from './single-flight.ts';
import {
  hasFieldErrors,
  normalizeEmail,
  validateLogin,
  validateRegistration,
} from './validation.ts';

test('normalizeEmail trims and lowercases', () => {
  assert.equal(normalizeEmail('  Person@Example.com '), 'person@example.com');
});

test('login rejects an invalid email and an empty password', () => {
  const errors = validateLogin({ email: 'not-an-email', password: '' });
  assert.equal(errors.email, 'auth.emailInvalid');
  assert.equal(errors.password, 'auth.passwordRequired');
  assert.equal(hasFieldErrors(errors), true);
});

test('login accepts a normal email and password', () => {
  const errors = validateLogin({ email: 'person@example.com', password: 'Correct-Horse-1' });
  assert.equal(hasFieldErrors(errors), false);
});

test('registration rejects a weak password and a mismatch', () => {
  const errors = validateRegistration({
    displayName: 'Ada',
    email: 'ada@example.com',
    password: 'short',
    confirmPassword: 'different',
  });
  assert.equal(errors.password, 'auth.passwordWeak');
  assert.equal(errors.confirmPassword, 'auth.passwordMismatch');
});

test('registration accepts a strong matching password', () => {
  const errors = validateRegistration({
    displayName: ' Ada Lovelace ',
    email: 'Ada@Example.com',
    password: 'Correct-Horse-1',
    confirmPassword: 'Correct-Horse-1',
  });
  assert.equal(hasFieldErrors(errors), false);
});

test('registration requires a display name', () => {
  const errors = validateRegistration({
    displayName: '   ',
    email: 'ada@example.com',
    password: 'Correct-Horse-1',
    confirmPassword: 'Correct-Horse-1',
  });
  assert.equal(errors.displayName, 'auth.displayNameRequired');
});

test('shareInFlight runs one task for concurrent callers', async () => {
  const slot = { current: null };
  let runs = 0;
  const start = () => {
    runs += 1;
    return Promise.resolve('token');
  };

  const [first, second] = await Promise.all([
    shareInFlight(slot, start),
    shareInFlight(slot, start),
  ]);

  assert.equal(first, 'token');
  assert.equal(second, 'token');
  assert.equal(runs, 1);
  assert.equal(slot.current, null);
});
