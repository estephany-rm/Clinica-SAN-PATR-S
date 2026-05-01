require('dotenv').config();
const bcrypt = require('bcrypt');
const db     = require('./config/db');

async function crearAdmin() {
  const hash = await bcrypt.hash('Admin1234', 10);
  await db.query(
    "INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, 'admin') ON DUPLICATE KEY UPDATE password = ?",
    ['admin', hash, hash]
  );
  console.log('✅ Usuario admin creado. Usuario: admin | Contraseña: Admin1234');
  process.exit(0);
}

crearAdmin().catch(err => { console.error(err); process.exit(1); });