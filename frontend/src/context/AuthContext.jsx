import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [role, setRole]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ds_token');
    if (token) {
      authAPI.me()
        .then(data => { setUser(data.user); setRole(data.role); })
        .catch(() => localStorage.removeItem('ds_token'))
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const loginAdmin = async (email, password) => {
    const data = await authAPI.adminLogin(email, password);
    localStorage.setItem('ds_token', data.token);
    setUser(data.admin); setRole('admin');
  };
  const loginParticipant = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('ds_token', data.token);
    setUser(data.participant); setRole('participant');
  };
  const signup = async (form) => {
    const data = await authAPI.signup(form);
    localStorage.setItem('ds_token', data.token);
    setUser(data.participant); setRole('participant');
  };
  const logout = () => {
    localStorage.removeItem('ds_token');
    setUser(null); setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, loginAdmin, loginParticipant, signup, logout, isAdmin: role === 'admin', isParticipant: role === 'participant' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
