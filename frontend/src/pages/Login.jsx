// Página de inicio de sesión
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { loginService } from '../services/authService';

export default function Login() {
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.usuario.trim() || !form.password.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Ingresa tu usuario y contraseña.' });
      return;
    }

    setCargando(true);
    try {
      const response = await loginService(form.usuario, form.password);
      if (response.success) {
        login(response.data); // guardar en contexto y localStorage
        navigate('/dashboard');
      }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al conectar con el servidor';
      Swal.fire({ icon: 'error', title: 'Error de acceso', text: mensaje });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Clínica San Patrás</h1>
          <p className="text-gray-500 mt-1">Sistema de Gestión Hospitalaria</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Clínica San Patrás — Acceso restringido
        </p>
      </div>
    </div>
  );
}

