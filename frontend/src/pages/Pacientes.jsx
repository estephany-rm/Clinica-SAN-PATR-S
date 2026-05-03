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

// Campos que se deben validar como obligatorios
const CAMPOS_OBLIGATORIOS = ['nombre', 'apellidos', 'direccion', 'poblacion', 'provincia', 'codigo_postal', 'telefono', 'fecha_nacimiento'];

export default function Pacientes() {
  const { isAdmin } = useAuth();
  const [pacientes, setPacientes]       = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [buscar, setBuscar]             = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]         = useState(null);
  const [form, setForm]                 = useState(FORM_INICIAL);
  const [guardando, setGuardando]       = useState(false);
  // errores: objeto con los nombres de campos que están vacíos
  const [errores, setErrores]           = useState({});

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

  const handleBuscar = (e) => { setBuscar(e.target.value); cargar(e.target.value); };

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
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
    setErrores({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
  };

  // Al cambiar un campo, quitar el error de ese campo si ya tiene valor
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (value.trim()) {
      setErrores(prev => ({ ...prev, [name]: false }));
    }
  };

  // Valida todos los campos obligatorios y devuelve true si está todo bien
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
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar el paciente', 'error');
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
      Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar el paciente', 'error');
    }
  };

  // Clases del input: rojo si tiene error, normal si no
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
          <h1 className="text-2xl font-bold text-gray-800">Pacientes 🧑‍⚕️</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de pacientes de la clínica</p>
        </div>
        <button onClick={abrirCrear} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
          + Nuevo Paciente
        </button>
      </div>

      <div className="mb-4">
        <input type="text" value={buscar} onChange={handleBuscar}
          placeholder="Buscar por nombre, apellidos o teléfono..."
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

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
                    <button onClick={() => abrirEditar(p)}
                      className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded hover:bg-yellow-200 transition font-medium">
                      Editar
                    </button>
                    {isAdmin() && (
                      <button onClick={() => handleEliminar(p)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {editando ? 'Editar Paciente' : 'Nuevo Paciente'}
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
                    Dirección * {errores.direccion && <span className="text-red-500 text-xs">Requerido</span>}
                  </label>
                  <input name="direccion" value={form.direccion} onChange={handleChange}
                    className={inputClass('direccion')} placeholder="Calle 123 # 45-67" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Población * {errores.poblacion && <span className="text-red-500 text-xs">Requerido</span>}
                    </label>
                    <input name="poblacion" value={form.poblacion} onChange={handleChange}
                      className={inputClass('poblacion')} placeholder="Pereira" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia * {errores.provincia && <span className="text-red-500 text-xs">Requerido</span>}
                    </label>
                    <input name="provincia" value={form.provincia} onChange={handleChange}
                      className={inputClass('provincia')} placeholder="Risaralda" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal * {errores.codigo_postal && <span className="text-red-500 text-xs">Requerido</span>}
                    </label>
                    <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange}
                      className={inputClass('codigo_postal')} placeholder="660001" maxLength={10} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono * {errores.telefono && <span className="text-red-500 text-xs">Requerido</span>}
                    </label>
                    <input name="telefono" value={form.telefono} onChange={handleChange}
                      className={inputClass('telefono')} placeholder="3001234567" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento * {errores.fecha_nacimiento && <span className="text-red-500 text-xs">Requerido</span>}
                  </label>
                  <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange}
                    className={inputClass('fecha_nacimiento')} />
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