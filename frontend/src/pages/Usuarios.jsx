// Gestión de Usuarios (solo admin)
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import { registroService } from '../services/authService';
import api from '../services/api';

const FORM_INICIAL = { usuario: '', password: '', rol: 'usuario', imagen: '' };

export default function Usuarios() {
  const [usuarios, setUsuarios]         = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm]                 = useState(FORM_INICIAL);
  const [guardando, setGuardando]       = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await api.get('/auth/usuarios');
      if (res.data.success) setUsuarios(res.data.data);
    } catch {
      // Si el endpoint no existe aún, mostrar lista vacía
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.usuario.trim() || !form.password.trim()) {
      Swal.fire('Campos requeridos', 'Usuario y contraseña son obligatorios.', 'warning');
      return;
    }
    if (form.password.length < 6) {
      Swal.fire('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    const confirm = await Swal.fire({
      title: '¿Crear usuario?',
      text: `Se creará el usuario "${form.usuario}" con rol "${form.rol}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    setGuardando(true);
    try {
      await registroService(form);
      Swal.fire('Creado', 'Usuario creado correctamente.', 'success');
      setModalAbierto(false);
      setForm(FORM_INICIAL);
      cargar();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al crear usuario', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const rolBadge = {
    admin:     'bg-red-100 text-red-700',
    moderador: 'bg-yellow-100 text-yellow-700',
    usuario:   'bg-green-100 text-green-700',
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios del Sistema 👥</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de acceso al sistema (solo administradores)</p>
        </div>
        <button onClick={() => setModalAbierto(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
          + Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay usuarios registrados o el endpoint aún no está disponible.<br />
            <span className="text-xs text-gray-400">Usa el botón "Nuevo Usuario" para crear el primero.</span>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Creado en</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">#{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.usuario}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rolBadge[u.rol] || 'bg-gray-100 text-gray-600'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.creado_en).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Nuevo Usuario</h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario *</label>
                  <input name="usuario" value={form.usuario} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="usuario123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                  <select name="rol" value={form.rol} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="usuario">usuario</option>
                    <option value="moderador">moderador</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen (opcional)</label>
                  <input name="imagen" value={form.imagen} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={guardando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50">
                    {guardando ? 'Creando...' : 'Crear Usuario'}
                  </button>
                  <button type="button" onClick={() => setModalAbierto(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}