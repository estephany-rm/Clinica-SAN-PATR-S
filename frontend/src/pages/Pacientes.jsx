
// Módulo CRUD de Pacientes
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  getPacientes, createPaciente, updatePaciente, deletePaciente
} from '../services/pacienteService';

const FORM_INICIAL = {
  nombre: '', apellidos: '', direccion: '', poblacion: '',
  provincia: '', codigo_postal: '', telefono: '', fecha_nacimiento: ''
};

export default function Pacientes() {
  const { isAdmin } = useAuth();
  const [pacientes, setPacientes]     = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [buscar, setBuscar]           = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]       = useState(null); // null = crear, objeto = editar
  const [form, setForm]               = useState(FORM_INICIAL);
  const [guardando, setGuardando]     = useState(false);

  const cargar = async (termino = '') => {
    setCargando(true);
    try {
      const res = await getPacientes(termino);
      if (res.data.success) setPacientes(res.data.data);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los pacientes', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleBuscar = (e) => {
    setBuscar(e.target.value);
    cargar(e.target.value);
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setModalAbierto(true);
  };

  const abrirEditar = (paciente) => {
    setEditando(paciente);
    setForm({
      nombre:           paciente.nombre,
      apellidos:        paciente.apellidos,
      direccion:        paciente.direccion || '',
      poblacion:        paciente.poblacion || '',
      provincia:        paciente.provincia || '',
      codigo_postal:    paciente.codigo_postal || '',
      telefono:         paciente.telefono || '',
      fecha_nacimiento: paciente.fecha_nacimiento?.split('T')[0] || '',
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_INICIAL);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.apellidos.trim() || !form.fecha_nacimiento) {
      Swal.fire('Campos requeridos', 'Nombre, apellidos y fecha de nacimiento son obligatorios.', 'warning');
      return;
    }

    const accion = editando ? 'actualizar' : 'crear';
    const confirm = await Swal.fire({
      title: `¿${editando ? 'Actualizar' : 'Crear'} paciente?`,
      text: `Se ${accion === 'crear' ? 'registrará un nuevo paciente' : 'guardarán los cambios'}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    setGuardando(true);
    try {
      if (editando) {
        await updatePaciente(editando.codigo, form);
        Swal.fire('Actualizado', 'El paciente fue actualizado correctamente.', 'success');
      } else {
        await createPaciente(form);
        Swal.fire('Creado', 'El paciente fue registrado correctamente.', 'success');
      }
      cerrarModal();
      cargar(buscar);
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al guardar el paciente';
      Swal.fire('Error', msg, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (paciente) => {
    const result = await Swal.fire({
      title: '¿Eliminar paciente?',
      text: `¿Seguro que deseas eliminar a ${paciente.nombre} ${paciente.apellidos}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await deletePaciente(paciente.codigo);
      Swal.fire('Eliminado', 'El paciente fue eliminado correctamente.', 'success');
      cargar(buscar);
    } catch (error) {
      const msg = error.response?.data?.message || 'No se pudo eliminar el paciente';
      Swal.fire('Error', msg, 'error');
    }
  };

  return (
    <Layout>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pacientes </h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de pacientes de la clínica</p>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Paciente
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          value={buscar}
          onChange={handleBuscar}
          placeholder="Buscar por nombre, apellidos o teléfono..."
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">Cargando pacientes...</div>
        ) : pacientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron pacientes.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Apellidos</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Población</th>
                <th className="px-4 py-3">Provincia</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.codigo} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">#{p.codigo}</td>
                  <td className="px-4 py-3">{p.nombre}</td>
                  <td className="px-4 py-3">{p.apellidos}</td>
                  <td className="px-4 py-3">{p.telefono || '—'}</td>
                  <td className="px-4 py-3">{p.poblacion || '—'}</td>
                  <td className="px-4 py-3">{p.provincia || '—'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded hover:bg-yellow-200 transition font-medium"
                    >
                      Editar
                    </button>
                    {isAdmin() && (
                      <button
                        onClick={() => handleEliminar(p)}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200 transition font-medium"
                      >
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

      {/* Modal Crear/Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editando ? 'Editar Paciente' : 'Nuevo Paciente'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input name="direccion" value={form.direccion} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dirección" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Población</label>
                    <input name="poblacion" value={form.poblacion} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Población" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                    <input name="provincia" value={form.provincia} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Provincia" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                    <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="00000" maxLength={5} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3001234567" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                  <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={guardando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50">
                    {guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear Paciente')}
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