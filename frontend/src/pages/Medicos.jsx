// Módulo CRUD de Médicos
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getMedicos, createMedico, updateMedico, deleteMedico } from '../services/medicoService';

const FORM_INICIAL = { nombre: '', apellidos: '', telefono: '', especialidad: '' };

// Todos los campos son obligatorios en médicos
const CAMPOS_OBLIGATORIOS = ['nombre', 'apellidos', 'telefono', 'especialidad'];

export default function Medicos() {
  const { isAdmin, isModerador } = useAuth();
  const [medicos, setMedicos]           = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [buscar, setBuscar]             = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]         = useState(null);
  const [form, setForm]                 = useState(FORM_INICIAL);
  const [guardando, setGuardando]       = useState(false);
  const [errores, setErrores]           = useState({});

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

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
    setModalAbierto(true);
  };

  const abrirEditar = (m) => {
    setEditando(m);
    setForm({ nombre: m.nombre, apellidos: m.apellidos, telefono: m.telefono || '', especialidad: m.especialidad });
    setErrores({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (value.trim()) setErrores(prev => ({ ...prev, [name]: false }));
  };

  const validar = () => {
    const nuevosErrores = {};
    CAMPOS_OBLIGATORIOS.forEach(campo => {
      if (!form[campo] || !String(form[campo]).trim()) {
        nuevosErrores[campo] = true;
      }
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validar()) {
      Swal.fire('Campos incompletos', 'Por favor completa todos los campos obligatorios marcados en rojo.', 'warning');
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

  const inputClass = (campo) =>
    `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
      errores[campo]
        ? 'border-red-500 focus:ring-red-400 bg-red-50'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Médicos 👨‍⚕️</h1>
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
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {editando ? 'Editar Médico' : 'Nuevo Médico'}
              </h2>
              <p className="text-xs text-gray-400 mb-6">Todos los campos son obligatorios *</p>
              <form onSubmit={handleGuardar} className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre * {errores.nombre && <span className="text-red-500 text-xs">Requerido</span>}
                    </label>
                    <input name="nombre" value={form.nombre} onChange={handleChange}
                      className={inputClass('nombre')} placeholder="Nombre" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos * {errores.apellidos && <span className="text-red-500 text-xs">Requerido</span>}
                    </label>
                    <input name="apellidos" value={form.apellidos} onChange={handleChange}
                      className={inputClass('apellidos')} placeholder="Apellidos" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidad * {errores.especialidad && <span className="text-red-500 text-xs">Requerido</span>}
                  </label>
                  <input name="especialidad" value={form.especialidad} onChange={handleChange}
                    className={inputClass('especialidad')} placeholder="Ej: Cardiología, Pediatría..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono * {errores.telefono && <span className="text-red-500 text-xs">Requerido</span>}
                  </label>
                  <input name="telefono" value={form.telefono} onChange={handleChange}
                    className={inputClass('telefono')} placeholder="3001234567" />
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