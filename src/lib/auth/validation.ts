const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export type FieldErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateEmail(value: string): string | undefined {
  const email = normalizeEmail(value);
  if (!email || email.length > 254 || !emailPattern.test(email)) {
    return 'auth.emailInvalid';
  }
  return undefined;
}

export function validateDisplayName(value: string): string | undefined {
  const name = value.trim();
  if (!name) {
    return 'auth.displayNameRequired';
  }
  if (name.length > 80) {
    return 'auth.displayNameLong';
  }
  return undefined;
}

export function validateNewPassword(value: string): string | undefined {
  if (value.length < 10 || value.length > 128 || !passwordPattern.test(value)) {
    return 'auth.passwordWeak';
  }
  return undefined;
}

export function validateLogin(input: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  const email = validateEmail(input.email);
  if (email) {
    errors.email = email;
  }
  if (!input.password) {
    errors.password = 'auth.passwordRequired';
  } else if (input.password.length > 128) {
    errors.password = 'auth.passwordLong';
  }
  return errors;
}

export function validateRegistration(input: {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const displayName = validateDisplayName(input.displayName);
  const email = validateEmail(input.email);
  const password = validateNewPassword(input.password);
  if (displayName) {
    errors.displayName = displayName;
  }
  if (email) {
    errors.email = email;
  }
  if (password) {
    errors.password = password;
  }
  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = 'auth.passwordMismatch';
  }
  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
