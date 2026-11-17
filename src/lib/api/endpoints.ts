export const endpoints = {
  health: '/health',
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  me: '/auth/me',
  instagramConnect: '/instagram/connect',
  instagramAccounts: '/instagram/accounts',
} as const;
