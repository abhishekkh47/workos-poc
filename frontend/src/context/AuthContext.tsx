import { useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import { AuthContext, type AuthUser } from './authTypes';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get<AuthUser>('/api/me', {
        withCredentials: true,
      });
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = () => {
    // Navigate the browser to the logout route so the server can clear the
    // cookie and redirect through WorkOS to terminate the WorkOS session.
    // This prevents WorkOS from silently re-authenticating on next login.
    window.location.href = '/auth/logout';
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
