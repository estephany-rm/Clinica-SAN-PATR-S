
// Módulo CRUD de Ingresos
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getIngresos, createIngreso, updateIngreso, deleteIngreso } from '../services/ingresoService';
import { getPacientes } from '../services/pacienteService';
import { getMedicos }   from '../services/medicoService';

const FORM_INICIAL = { num_habitacion: '', cama: '', fecha_ingreso: '', paciente_codigo: '', medico_codigo: '' };

export default function Ingresos() {
  const { isAdmin } = useAuth();
  const [ingresos, setIngresos]         = useState([]);
  const [pacientes, setPacientes]       = useState([]);
  const [medicos, setMedicos]           = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]         = useState(null);
  const [form, setForm]                 = useState(FORM_INICIAL);
  const [guardando, setGuardando]       = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const [resIngresos, resPacientes, resMedicos] = await Promise.all([
        getIngresos(), getPacientes(), getMedicos()
      ]);
      if (resIngresos.data.success)  setIngresos(resIngresos.data.data);
      if (resPacientes.data.success) setPacientes(resPacientes.data.data);
      if (resMedicos.data.success)   setMedicos(resMedicos.data.data);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los ingresos', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, fecha_ingreso: new Date().toISOString().slice(0, 16) });
    setModalAbierto(true);
  };

  const abrirEditar = (i) => {
    setEditando(i);
    setForm({
      num_habitacion: i.num_habitacion,
      cama:           i.cama,
      fecha_ingreso:  i.fecha_ingreso?.slice(0, 16) || '',
      paciente_codigo: i.paciente_codigo,
      medico_codigo:  i.medico_codigo,
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); setEditando(null); setForm(FORM_INICIAL); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    const { num_habitacion, cama, paciente_codigo, medico_codigo } = form;
    if (!num_habitacion || !cama || !paciente_codigo || !medico_codigo) {
      Swal.fire('Campos requeridos', 'Habitación, cama, paciente y médico son obligatorios.', 'warning');
      return;
    }

    const confirm = await Swal.fire({
      title: `¿${editando ? 'Actualizar' : 'Registrar'} ingreso?`,
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
        await updateIngreso(editando.codigo, form);
        Swal.fire('Actualizado', 'Ingreso actualizado correctamente.', 'success');
      } else {
        await createIngreso(form);
        Swal.fire('Registrado', 'Ingreso registrado correctamente.', 'success');
      }
      cerrarModal();
      cargar();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (i) => {
    const result = await Swal.fire({
      title: '¿Eliminar ingreso?',
      text: `¿Deseas eliminar el ingreso #${i.codigo} del paciente ${i.nombre_paciente}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      await deleteIngreso(i.codigo);
      Swal.fire('Eliminado', 'Ingreso eliminado correctamente.', 'success');
      cargar();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar', 'error');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ingresos </h1>
          <p className="text-gray-500 text-sm mt-1">Registro de ingresos hospitalarios</p>
        </div>
        <button onClick={abrirCrear} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
          + Nuevo Ingreso
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">Cargando ingresos...</div>
        ) : ingresos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay ingresos registrados.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Habitación</th>
                <th className="px-4 py-3">Cama</th>
                <th className="px-4 py-3">Fecha Ingreso</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Médico</th>
                <th className="px-4 py-3">Especialidad</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.map((i) => (
                <tr key={i.codigo} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">#{i.codigo}</td>
                  <td className="px-4 py-3">{i.num_habitacion}</td>
                  <td className="px-4 py-3">{i.cama}</td>
                  <td className="px-4 py-3">{formatFecha(i.fecha_ingreso)}</td>
                  <td className="px-4 py-3">{i.nombre_paciente}</td>
                  <td className="px-4 py-3">{i.nombre_medico}</td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{i.especialidad}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => abrirEditar(i)}
                      className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded hover:bg-yellow-200 transition font-medium">
                      Editar
                    </button>
                    {isAdmin() && (
                      <button onClick={() => handleEliminar(i)}
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
                {editando ? 'Editar Ingreso' : 'Nuevo Ingreso'}
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Habitación *</label>
                    <input name="num_habitacion" type="number" value={form.num_habitacion} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="101" min={1} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cama *</label>
                    <input name="cama" type="number" value={form.cama} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1" min={1} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora de Ingreso</label>
                  <input name="fecha_ingreso" type="datetime-local" value={form.fecha_ingreso} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
                  <select name="paciente_codigo" value={form.paciente_codigo} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccionar paciente...</option>
                    {pacientes.map(p => (
                      <option key={p.codigo} value={p.codigo}>{p.nombre} {p.apellidos}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Médico *</label>
                  <select name="medico_codigo" value={form.medico_codigo} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccionar médico...</option>
                    {medicos.map(m => (
                      <option key={m.codigo} value={m.codigo}>Dr. {m.nombre} {m.apellidos} — {m.especialidad}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={guardando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50">
                    {guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Registrar Ingreso')}
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