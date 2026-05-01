// Configuración de rutas de la aplicación
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import Pacientes   from './pages/Pacientes';
import Medicos     from './pages/Medicos';
import Ingresos    from './pages/Ingresos';
import Usuarios    from './pages/Usuarios';

// Componente que protege rutas — redirige al login si no hay sesión
const RutaProtegida = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Componente que solo permite acceso a admins
const RutaAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Ruta raíz: si hay sesión va al dashboard, si no al login */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
      <Route path="/pacientes" element={<RutaProtegida><Pacientes /></RutaProtegida>} />
      <Route path="/medicos"   element={<RutaProtegida><Medicos /></RutaProtegida>} />
      <Route path="/ingresos"  element={<RutaProtegida><Ingresos /></RutaProtegida>} />

      {/* Ruta solo para admin */}
      <Route path="/usuarios"  element={<RutaAdmin><Usuarios /></RutaAdmin>} />

      {/* Ruta no encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}