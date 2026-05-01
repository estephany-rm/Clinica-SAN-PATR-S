// Punto de entrada del servidor
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth.routes');
const pacienteRoutes = require('./routes/paciente.routes');
const medicoRoutes   = require('./routes/medico.routes');
const ingresoRoutes  = require('./routes/ingreso.routes');

const app  = express();
const PORT = process.env.PORT || 3001;

// Middlewares globales
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rutas de la API
app.use('/api/auth',      authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/medicos',   medicoRoutes);
app.use('/api/ingresos',  ingresoRoutes);

// Ruta raíz para verificar que el servidor está activo
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API Clínica San Patrás funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});