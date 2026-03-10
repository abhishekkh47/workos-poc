import { createContext } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
  refetch: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
