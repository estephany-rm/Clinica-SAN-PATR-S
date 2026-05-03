
// Módulo CRUD de Médicos
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getMedicos, createMedico, updateMedico, deleteMedico } from '../services/medicoService';

const FORM_INICIAL = { nombre: '', apellidos: '', telefono: '', especialidad: '' };

export default function Medicos() {
  const { isAdmin, isModerador } = useAuth();
  const [medicos, setMedicos]         = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [buscar, setBuscar]           = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]       = useState(null);
  const [form, setForm]               = useState(FORM_INICIAL);
  const [guardando, setGuardando]     = useState(false);

  const cargar = async (termino = '') => {
    setCargando(true);
    try {
      const res = await getMedicos(termino);
      if (res.data.success) setMedicos(res.data.data);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los médicos', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleBuscar = (e) => { setBuscar(e.target.value); cargar(e.target.value); };

  const abrirCrear = () => { setEditando(null); setForm(FORM_INICIAL); setModalAbierto(true); };

  const abrirEditar = (m) => {
    setEditando(m);
    setForm({ nombre: m.nombre, apellidos: m.apellidos, telefono: m.telefono || '', especialidad: m.especialidad });
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); setEditando(null); setForm(FORM_INICIAL); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellidos.trim() || !form.especialidad.trim()) {
      Swal.fire('Campos requeridos', 'Nombre, apellidos y especialidad son obligatorios.', 'warning');
      return;
    }

    const confirm = await Swal.fire({
      title: `¿${editando ? 'Actualizar' : 'Crear'} médico?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    setGuardando(true);
    try {
      if (editando) {
        await updateMedico(editando.codigo, form);
        Swal.fire('Actualizado', 'Médico actualizado correctamente.', 'success');
      } else {
        await createMedico(form);
        Swal.fire('Creado', 'Médico registrado correctamente.', 'success');
      }
      cerrarModal();
      cargar(buscar);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (m) => {
    const result = await Swal.fire({
      title: '¿Eliminar médico?',
      text: `¿Deseas eliminar al Dr. ${m.nombre} ${m.apellidos}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      await deleteMedico(m.codigo);
      Swal.fire('Eliminado', 'Médico eliminado correctamente.', 'success');
      cargar(buscar);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar', 'error');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Médicos </h1>
          <p className="text-gray-500 text-sm mt-1">Personal médico de la clínica</p>
        </div>
        {isModerador() && (
          <button onClick={abrirCrear} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
            + Nuevo Médico
          </button>
        )}
      </div>

      <div className="mb-4">
        <input type="text" value={buscar} onChange={handleBuscar}
          placeholder="Buscar por nombre, apellidos o especialidad..."
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">Cargando médicos...</div>
        ) : medicos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron médicos.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Apellidos</th>
                <th className="px-4 py-3">Especialidad</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicos.map((m) => (
                <tr key={m.codigo} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">#{m.codigo}</td>
                  <td className="px-4 py-3">{m.nombre}</td>
                  <td className="px-4 py-3">{m.apellidos}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{m.especialidad}</span>
                  </td>
                  <td className="px-4 py-3">{m.telefono || '—'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {isModerador() && (
                      <button onClick={() => abrirEditar(m)}
                        className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded hover:bg-yellow-200 transition font-medium">
                        Editar
                      </button>
                    )}
                    {isAdmin() && (
                      <button onClick={() => handleEliminar(m)}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200 transition font-medium">
                        Eliminar
                      </button>
                    )}
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editando ? 'Editar Médico' : 'Nuevo Médico'}
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                    <input name="apellidos" value={form.apellidos} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Apellidos" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
                  <input name="especialidad" value={form.especialidad} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Cardiología, Pediatría..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3001234567" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={guardando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50">
                    {guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear Médico')}
                  </button>
                  <button type="button" onClick={cerrarModal}
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

