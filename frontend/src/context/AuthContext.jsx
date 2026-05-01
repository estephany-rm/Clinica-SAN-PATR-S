
// Contexto global de autenticación
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);   // { id, usuario, rol, imagen, token }
  const [loading, setLoading] = useState(true);

  // Al cargar la app, recuperar sesión guardada
  useEffect(() => {
    const stored = localStorage.getItem('clinica_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('clinica_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // userData viene del backend: { token, usuario, rol, imagen, id }
    setUser(userData);
    localStorage.setItem('clinica_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinica_user');
  };

  const isAdmin = () => user?.rol === 'admin';
  const isModerador = () => user?.rol === 'moderador' || user?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isModerador }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export default AuthContext;