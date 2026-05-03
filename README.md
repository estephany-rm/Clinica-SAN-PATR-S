# Clínica San Patras

Este proyecto implementa un sistema de gestión para una clínica, utilizando una arquitectura de tres capas con Frontend en React, Backend en Node.js (Express) y Base de Datos MySQL. Permite la gestión de pacientes, médicos e ingresos, así como la autenticación y autorización de usuarios.

---

## Arquitectura del Sistema

El sistema sigue una arquitectura de tres capas:

- **Frontend:** Desarrollado con React, Vite, TailwindCSS y Axios para la interfaz de usuario.
- **Backend:** Implementado con Node.js y Express, gestionando la lógica de negocio, API RESTful y autenticación con JWT y bcrypt.
- **Base de Datos:** MySQL para el almacenamiento persistente de datos.

La comunicación entre el Frontend y el Backend se realiza mediante HTTP (JSON), y el Backend interactúa con la Base de Datos a través de consultas SQL.

---
## Requisitos previos

- Node.js v18 o superior: https://nodejs.org
- MySQL 8: https://dev.mysql.com/downloads/mysql/
- Git: https://git-scm.com

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/estephany-rm/Clinica-SAN-PATR-S.git
cd Clinica-SAN-PATR-S
```

### 2. Configurar la base de datos

Abre MySQL Workbench o la terminal MySQL y ejecuta:

LINUX / MAC 
1. Entrar a MySQL desde la terminal
```bash
/usr/local/mysql/bin/mysql -u root -p
```
Ingresas tu contraseña

3. Crear la base de datos
```bash
CREATE DATABASE clinica_san_patras_db;
```
3. Usar la base
```bash
USE clinica_san_patras_db;
```
5. Cargar schema 
Usa ruta completa:
Cómo saber la ruta exacta 
En VS Code:
Haz clic derecho sobre schema.sql
Dale a "Copy Path" (Copiar ruta)
Pégala en MySQL después de SOURCE
```bash
SOURCE /tu-ruta/Clinica-SAN-PATR-S/database/schema.sql;
```
6. Cargar datos (seeds)
```bash
SOURCE /tu-ruta/Clinica-SAN-PATR-S/database/seeds.sql;
```
7. Verificar
```bash
SHOW TABLES;
```
WINDOWS
1. Entrar a MySQL
(Si no reconoce mysql, usa la ruta completa)
```bash
mysql -u root -p  
```
O
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```
2. Crear base de datos
```bash
CREATE DATABASE clinica_san_patras_db;
```
3. Usarla
```bash
USE clinica_san_patras_db;
```
5. Cargar schema 
Usa ruta completa:
Cómo saber la ruta exacta 
En VS Code:
Haz clic derecho sobre schema.sql
Dale a "Copy Path" (Copiar ruta)
Pégala en MySQL después de SOURCE
```bash
SOURCE /tu-ruta/Clinica-SAN-PATR-S/database/schema.sql;
```
6. Cargar datos (seeds)
```bash
SOURCE /tu-ruta/Clinica-SAN-PATR-S/database/seeds.sql;
```
7. Verificar
```bash
SHOW TABLES;
```




<!--mysql -u root -p < database/schema.sql-->
<!--mysql -u root -p < database/seeds.sql-->


### 3. Configurar el backend

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` con tus credenciales:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_MYSQL
DB_NAME=clinica_san_patras_db
JWT_SECRET=clave_secreta_muy_larga_y_segura_2026
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Instala las dependencias e inicia el servidor:

```bash
npm install
npm run dev
```

El backend estará disponible en http://localhost:3001

### 4. Configurar el frontend

```bash
cd frontend
```

El archivo `.env` ya está configurado con los valores por defecto:

```env
VITE_API_URL=http://localhost:3001/api
```

Instala las dependencias e inicia el servidor:

```bash
npm install
npm run dev
```

El frontend estará disponible en http://localhost:5173

### 5. Crear el usuario administrador

```bash
cd backend
node crear-admin.js
```

Esto crea el usuario: admin con contraseña: Admin1234

---

## Credenciales de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | Admin1234 | admin |
| medico1 | password | usuario |

---

## Estructura del proyecto

```
Clinica-SAN-PATR-S/
├── frontend/          ← React + Vite
├── backend/           ← Node.js + Express
├── database/          ← Scripts SQL
│   ├── schema.sql
│   └── seeds.sql
├── docs/              ← Documentación
└── README.md
```

---

## Endpoints de la API

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /api/auth/login | Iniciar sesión | No |
| POST | /api/auth/registro | Crear usuario | Admin |
| GET | /api/auth/perfil | Ver perfil | Sí |
| GET | /api/pacientes | Listar pacientes | Sí |
| POST | /api/pacientes | Crear paciente | Sí |
| PUT | /api/pacientes/:id | Actualizar paciente | Sí |
| DELETE | /api/pacientes/:id | Eliminar paciente | Admin |
| GET | /api/medicos | Listar médicos | Sí |
| POST | /api/medicos | Crear médico | Admin/Mod |
| PUT | /api/medicos/:id | Actualizar médico | Admin/Mod |
| DELETE | /api/medicos/:id | Eliminar médico | Admin |
| GET | /api/ingresos | Listar ingresos | Sí |
| POST | /api/ingresos | Crear ingreso | Sí |
| PUT | /api/ingresos/:id | Actualizar ingreso | Sí |
| DELETE | /api/ingresos/:id | Eliminar ingreso | Admin |
| GET | /api/ingresos/estadisticas | Estadísticas dashboard | Sí |


---
## Uso de la Aplicación

Una vez que el backend y el frontend estén en ejecución:

Accede a la aplicación desde el navegador.
Inicia sesión con un usuario registrado o con el administrador creado.
Gestiona pacientes, médicos e ingresos desde la interfaz.

Para más detalles, consulta el archivo Manual_Usuario.pdf ubicado en la carpeta docs.
