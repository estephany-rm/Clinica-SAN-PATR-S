// Dashboard principal
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { estadisticasService } from '../services/ingresoService';
import { Link } from 'react-router-dom';

const CardEstadistica = ({ titulo, valor, icono, color }) => (
  <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{titulo}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">
          {valor ?? '...'}
        </p>
      </div>
      <span className="text-4xl">{icono}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_pacientes: null, total_medicos: null, total_ingresos: null });
  const [cargando, setCargando] = useState(true);

  const cargarEstadisticas = async () => {
    try {
      const response = await estadisticasService();
      if (response.success) {
        setStats({
          total_pacientes: Number(response.data.total_pacientes),
          total_medicos:   Number(response.data.total_medicos),
          total_ingresos:  Number(response.data.total_ingresos),
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const accesosRapidos = [
    { to: '/pacientes', label: 'Gestionar Pacientes', icono: '', desc: 'Ver, crear y editar pacientes' },
    { to: '/medicos',   label: 'Gestionar Médicos',   icono: '', desc: 'Administrar el personal médico', roles: ['admin', 'moderador'] },
    { to: '/ingresos',  label: 'Gestionar Ingresos',  icono: '', desc: 'Registrar ingresos hospitalarios' },
  ].filter(a => !a.roles || a.roles.includes(user?.rol));

  return (
    <Layout>
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bienvenido, {user?.usuario} 
        </h1>
        <p className="text-gray-500 mt-1">
          Rol: <span className="font-medium capitalize text-blue-600">{user?.rol}</span> · 
          Clínica San Patrás — Sistema de Gestión Hospitalaria
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardEstadistica
          titulo="Total Pacientes"
          valor={cargando ? '...' : stats.total_pacientes}
          icono=""
          color="border-blue-500"
        />
        <CardEstadistica
          titulo="Total Médicos"
          valor={cargando ? '...' : stats.total_medicos}
          icono=""
          color="border-green-500"
        />
        <CardEstadistica
          titulo="Total Ingresos"
          valor={cargando ? '...' : stats.total_ingresos}
          icono=""
          color="border-purple-500"
        />
      </div>

      {/* Accesos rápidos */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Acceso rápido</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accesosRapidos.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-xl shadow p-6 hover:shadow-md transition flex items-start gap-4"
          >
            <span className="text-3xl">{item.icono}</span>
            <div>
              <h3 className="font-semibold text-gray-800">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}