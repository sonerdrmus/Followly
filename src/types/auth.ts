export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
};

export type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthStatus =
  'initializing' | 'unauthenticated' | 'authenticated' | 'refreshing' | 'error';
