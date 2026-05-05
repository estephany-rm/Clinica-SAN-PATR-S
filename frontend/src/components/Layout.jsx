// Layout principal con sidebar y navbar
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard',  icono: '📊', roles: ['admin', 'usuario', 'moderador'] },
  { to: '/pacientes', label: 'Pacientes',  icono: '🧑‍⚕️', roles: ['admin', 'usuario', 'moderador'] },
  { to: '/medicos',   label: 'Médicos',    icono: '👨‍⚕️', roles: ['admin', 'moderador'] },
  { to: '/ingresos',  label: 'Ingresos',   icono: '🏥', roles: ['admin', 'usuario', 'moderador'] },
  { to: '/usuarios',  label: 'Usuarios',   icono: '👥', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const resultado = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    });
    if (resultado.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  const menuFiltrado = menuItems.filter(item => item.roles.includes(user?.rol));

  const rolColor = {
    admin: 'bg-red-100 text-red-700',
    moderador: 'bg-yellow-100 text-yellow-700',
    usuario: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏥</span>
            <div>
              <h2 className="font-bold text-gray-800 leading-tight">San Patrás</h2>
              <p className="text-xs text-gray-400">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Perfil del usuario */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user?.imagen
                ? <img src={user.imagen} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                : user?.usuario?.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.usuario}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rolColor[user?.rol] || 'bg-gray-100 text-gray-600'}`}>
                {user?.rol}
              </span>
            </div>
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuFiltrado.map((item) => {
            const activo = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  activo
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{item.icono}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <span>🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}