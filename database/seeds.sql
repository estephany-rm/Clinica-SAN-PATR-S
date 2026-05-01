-- Datos de prueba

USE clinica_san_patras_db;

INSERT INTO medico (nombre, apellidos, telefono, especialidad) VALUES
  ('Carlos',  'Rodríguez López', '3001234567', 'Medicina General'),
  ('Lucía',   'Martínez Gómez',  '3109876543', 'Cardiología'),
  ('Andrés',  'Pérez Castro',    '3204567890', 'Pediatría');

INSERT INTO paciente (nombre, apellidos, direccion, poblacion, provincia, codigo_postal, telefono, fecha_nacimiento) VALUES
  ('Ana',   'García Torres',  'Cra 5 #10-20', 'Pereira', 'Risaralda', '66001', '3001112233', '1985-03-14'),
  ('Jorge', 'Ríos Salazar',   'Cl 15 #8-45',  'Pereira', 'Risaralda', '66001', '3114445566', '1990-07-22');

INSERT INTO ingreso (num_habitacion, cama, fecha_ingreso, paciente_codigo, medico_codigo) VALUES
  (101, 1, NOW(), 1, 1),
  (102, 2, NOW(), 2, 2);

-- Usuario admin inicial (contraseña: Admin1234)
-- Hash generado con bcrypt 10 rounds
INSERT INTO usuarios (usuario, password, rol) VALUES
  ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('medico1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario');
