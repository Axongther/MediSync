# MediSync — Documentación Técnica

**Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final**
**Mayo 2026**

---

## Índice

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Infraestructura AWS](#3-infraestructura-aws)
4. [Backend](#4-backend)
5. [Frontend](#5-frontend)
6. [Base de Datos](#6-base-de-datos)
7. [Seguridad](#7-seguridad)
8. [Flujos Principales](#8-flujos-principales)
9. [Configuración y Despliegue](#9-configuración-y-despliegue)
10. [Variables de Entorno](#10-variables-de-entorno)

---

## 1. Descripción General

MediSync es una plataforma de gestión médica digital diseñada para clínicas. Permite administrar pacientes, médicos, citas, expedientes clínicos y notificaciones desde una interfaz web con control de acceso por roles.

### Roles del sistema

| Rol | Descripción |
|---|---|
| `director` | Acceso completo: dashboard, reportes, configuración, gestión de usuarios |
| `medico` | Gestión de su agenda, consultas activas y expedientes de sus pacientes |
| `recepcionista` | Registro de pacientes, agenda diaria y creación de citas |
| `paciente` | Consulta de sus citas, expediente médico y notificaciones |

### Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, React Router v6, CSS puro |
| Backend | Node.js 18, Express 4, JWT, bcryptjs |
| Base de datos | MySQL 8.0 (Amazon RDS) |
| Almacenamiento | Amazon S3 |
| Notificaciones | AWS Lambda + Amazon SES |
| Infraestructura | Terraform, AWS (EC2, RDS, S3, Lambda, VPC) |

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   React SPA (S3)        │
              │   IP: medisync-static   │
              └────────────┬────────────┘
                           │ HTTP (puerto 80)
              ┌────────────▼────────────┐
              │   EC2 t3.small          │
              │   Node.js + Express     │
              │   IP: 100.55.193.247    │
              │   Subred pública        │
              └────┬──────────┬─────────┘
                   │          │
       ┌───────────▼──┐  ┌────▼──────────────┐
       │  RDS MySQL   │  │  S3 Bucket        │
       │  db.t3.micro │  │  (adjuntos)       │
       │  Subred priv │  └───────────────────┘
       └──────────────┘
                           │
              ┌────────────▼────────────┐
              │   Lambda (Node 18.x)    │
              │   Notificaciones + SES  │
              └─────────────────────────┘
```

### Patrón arquitectónico

El backend sigue un **monolito modular**: un único proceso Express organizado en módulos independientes por dominio (`auth`, `pacientes`, `medicos`, `citas`, etc.). Cada módulo tiene su propio `routes.js`, `controller.js` y `service.js`.

```
backend/src/modules/
├── auth/
│   ├── auth.routes.js      ← define los endpoints
│   ├── auth.controller.js  ← maneja req/res
│   └── auth.service.js     ← lógica de negocio + queries
├── pacientes/
├── medicos/
├── citas/
├── expedientes/
├── slots/
├── notificaciones/
├── calificaciones/
├── dashboard/
└── usuarios/
```

---

## 3. Infraestructura AWS

Toda la infraestructura está definida como código con **Terraform** en el directorio `infrastructure/`.

### Recursos desplegados

| Recurso | Nombre | Descripción |
|---|---|---|
| VPC | `medisync-vpc` | Red privada `10.0.0.0/16` |
| Subnet pública | `medisync-subnet-public` | `10.0.1.0/24` — us-east-1a |
| Subnet privada A | `medisync-subnet-private-a` | `10.0.2.0/24` — us-east-1a |
| Subnet privada B | `medisync-subnet-private-b` | `10.0.3.0/24` — us-east-1b |
| Internet Gateway | `medisync-igw` | Salida a internet para subred pública |
| EC2 | `medisync-ec2-backend` | t3.small, Amazon Linux 2023 |
| Elastic IP | `medisync-eip-backend` | IP fija: `100.55.193.247` |
| RDS | `medisync-mysql` | MySQL 8.0, db.t3.micro, 20 GB gp2 |
| S3 | `medisync-static-assets` | Archivos estáticos y adjuntos |
| Lambda | `medisync-notifications` | Node.js 18.x, notificaciones por SES |
| SG EC2 | `medisync-sg-ec2` | Permite 80, 443, 22 desde `0.0.0.0/0` |
| SG RDS | `medisync-sg-rds` | Permite 3306 solo desde `medisync-sg-ec2` |

### Restricciones AWS Academy aplicadas

- IAM: se reutiliza `LabRole` / `LabInstanceProfile` (no se crean roles nuevos)
- EC2: máximo `t3.small`
- RDS: máximo `db.t3.micro`, storage type `gp2`, `monitoring_interval = 0`
- Sin Cognito, sin CloudFront, sin Route 53 activo (requiere dominio real)
- Lambda fuera de VPC para acceder a SES sin NAT Gateway

### Comandos Terraform

```bash
cd infrastructure

# Primera vez o después de clonar el repo
terraform init

# Ver qué se va a crear/modificar
terraform plan

# Aplicar cambios
terraform apply

# Destruir toda la infraestructura
terraform destroy
```

---

## 4. Backend

### Estructura de archivos

```
backend/
├── server.js                    ← punto de entrada, registra rutas
├── package.json
├── .env                         ← variables de entorno (no subir a git)
├── src/
│   ├── config/
│   │   ├── db.js                ← pool de conexiones MySQL2
│   │   └── s3.js                ← cliente AWS S3
│   ├── middleware/
│   │   ├── auth.js              ← verifica JWT en el header Authorization
│   │   └── roleCheck.js         ← verifica que el rol tenga permiso
│   ├── database/
│   │   ├── schema.sql           ← DDL completo de la base de datos
│   │   └── seed.sql             ← datos iniciales opcionales
│   └── modules/
│       ├── auth/
│       ├── pacientes/
│       ├── medicos/
│       ├── citas/
│       ├── expedientes/
│       ├── slots/
│       ├── notificaciones/
│       ├── calificaciones/
│       ├── dashboard/
│       └── usuarios/
└── lambda/
    └── notifications/
        └── index.js             ← función Lambda para envío de emails
```

### Dependencias principales

| Paquete | Versión | Uso |
|---|---|---|
| `express` | ^4.21.0 | Framework HTTP |
| `mysql2` | ^3.11.0 | Driver MySQL con soporte de promesas |
| `jsonwebtoken` | ^9.0.2 | Generación y verificación de JWT |
| `bcryptjs` | ^2.4.3 | Hash de contraseñas |
| `@aws-sdk/client-s3` | ^3.600.0 | Subida de archivos a S3 |
| `multer` | ^1.4.5-lts.1 | Manejo de archivos multipart |
| `dotenv` | ^16.4.5 | Carga de variables de entorno |
| `cors` | ^2.8.5 | Habilita CORS para el frontend |
| `nodemon` | ^3.1.4 | Recarga automática en desarrollo |

### Middleware de autenticación (`auth.js`)

Verifica el header `Authorization: Bearer <token>`. Si el token es válido, adjunta el payload decodificado en `req.user` y llama a `next()`. Si no, responde `401`.

```
Request → auth middleware → roleCheck middleware → controller → service → DB
```

### Middleware de autorización (`roleCheck.js`)

Recibe una lista de roles permitidos. Compara `req.user.role` contra esa lista. Si no coincide, responde `403 Forbidden`.

```js
// Ejemplo de uso en routes.js
router.post('/', auth, roleCheck('recepcionista', 'director'), controller.create);
```

### Configuración de la base de datos (`db.js`)

Usa `mysql2/promise` con un pool de conexiones. Los parámetros se leen de variables de entorno:

```js
mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
})
```

### Endpoints disponibles

| Módulo | Base URL | Descripción |
|---|---|---|
| Auth | `/api/auth` | Login, registro, perfil |
| Pacientes | `/api/pacientes` | CRUD de pacientes |
| Médicos | `/api/medicos` | CRUD de médicos, slots disponibles |
| Citas | `/api/citas` | Gestión completa de citas |
| Slots | `/api/slots` | Horarios de médicos |
| Expedientes | `/api/expedientes` | Registros médicos y adjuntos |
| Notificaciones | `/api/notificaciones` | Notificaciones por usuario |
| Calificaciones | `/api/calificaciones` | Calificaciones de médicos |
| Dashboard | `/api/dashboard` | KPIs y reportes |
| Usuarios | `/api/usuarios` | Gestión de usuarios (solo director) |

La documentación detallada de cada endpoint está en `backend/API_DOCS.md`.

### Comandos de desarrollo

```bash
cd backend

# Instalar dependencias
npm install

# Desarrollo con recarga automática
npm run dev

# Producción
npm start
```

---

## 5. Frontend

### Estructura de archivos

```
frontend/src/
├── App.jsx                          ← router principal con rutas protegidas
├── index.js                         ← punto de entrada React
├── context/
│   └── AuthContext.jsx              ← estado global de autenticación
├── services/
│   └── api.js                       ← cliente HTTP centralizado
├── components/
│   ├── common/
│   │   └── ProtectedRoute.jsx       ← guarda rutas por rol
│   └── layout/
│       ├── SidebarDirector.jsx
│       ├── SidebarMedico.jsx
│       ├── SidebarPaciente.jsx
│       └── SidebarRecepcionista.jsx
├── pages/
│   ├── Login.jsx
│   ├── director/
│   │   ├── Dashboard.jsx            ← KPIs + próximas citas
│   │   ├── Agenda.jsx               ← calendario mensual
│   │   ├── Pacientes.jsx            ← lista con búsqueda
│   │   ├── PerfilPaciente.jsx       ← datos + expediente
│   │   ├── CatalogoMedicos.jsx      ← lista + modal crear médico
│   │   ├── MetricasCancelaciones.jsx← reportes y estadísticas
│   │   └── Configuracion.jsx        ← gestión de usuarios
│   ├── medico/
│   │   ├── MiAgenda.jsx             ← calendario + citas del día
│   │   ├── MisPacientes.jsx         ← pacientes del médico
│   │   ├── ConsultaActiva.jsx       ← registro de consulta
│   │   └── PerfilPacienteMedico.jsx ← expediente del paciente
│   ├── paciente/
│   │   ├── MisCitas.jsx             ← grid de citas
│   │   ├── DetalleCita.jsx          ← detalle + cancelar
│   │   ├── MiExpediente.jsx         ← historial médico
│   │   ├── Notificaciones.jsx       ← notificaciones con filtros
│   │   └── CalificarDoctor.jsx      ← calificación con estrellas
│   └── recepcionista/
│       ├── AgendaDiaria.jsx         ← citas del día seleccionado
│       ├── AgendarCita.jsx          ← formulario con slots en tiempo real
│       ├── BuscarPaciente.jsx       ← búsqueda de pacientes
│       └── RegistroPaciente.jsx     ← formulario de registro
└── styles/
    └── global.css                   ← estilos globales del sistema
```

### Rutas y control de acceso

Todas las rutas protegidas usan el componente `ProtectedRoute`, que verifica que el usuario esté autenticado y que su rol esté en la lista de roles permitidos. Si no cumple, redirige a `/login`.

| Ruta | Componente | Roles |
|---|---|---|
| `/login` | `Login` | Público |
| `/director/dashboard` | `Dashboard` | director |
| `/director/agenda` | `Agenda` | director |
| `/director/pacientes` | `Pacientes` | director |
| `/director/pacientes/:id` | `PerfilPaciente` | director |
| `/director/medicos` | `CatalogoMedicos` | director |
| `/director/cancelaciones` | `MetricasCancelaciones` | director |
| `/director/configuracion` | `Configuracion` | director |
| `/medico/agenda` | `MiAgenda` | medico |
| `/medico/pacientes` | `MisPacientes` | medico |
| `/medico/consulta/:id` | `ConsultaActiva` | medico |
| `/medico/pacientes/:id` | `PerfilPacienteMedico` | medico |
| `/paciente/citas` | `MisCitas` | paciente |
| `/paciente/citas/:id` | `DetalleCita` | paciente |
| `/paciente/expediente` | `MiExpediente` | paciente |
| `/paciente/notificaciones` | `Notificaciones` | paciente |
| `/paciente/calificar/:citaId` | `CalificarDoctor` | paciente |
| `/recepcionista/agenda` | `AgendaDiaria` | recepcionista |
| `/recepcionista/agendar` | `AgendarCita` | recepcionista |
| `/recepcionista/pacientes` | `BuscarPaciente` | recepcionista |
| `/recepcionista/registro` | `RegistroPaciente` | recepcionista |

### AuthContext

Maneja el estado global de autenticación. Persiste el token en `localStorage` y lo valida contra `/api/auth/me` al cargar la aplicación.

```
Carga app
    ↓
¿Hay token en localStorage?
    ├── Sí → GET /api/auth/me → setUser(data) → app lista
    └── No → setLoading(false) → redirige a /login
```

Expone a través del contexto:

| Valor | Tipo | Descripción |
|---|---|---|
| `user` | object | Datos del usuario autenticado (`id`, `name`, `email`, `role`) |
| `token` | string | JWT almacenado en localStorage |
| `loading` | boolean | `true` mientras se valida el token inicial |
| `login(email, password)` | función | Llama a la API, guarda token, actualiza estado |
| `logout()` | función | Limpia localStorage y estado |

### Servicio API (`api.js`)

Cliente HTTP centralizado basado en `fetch`. Todas las llamadas pasan por la función `request()` que:

1. Agrega el header `Authorization: Bearer <token>` automáticamente
2. Lanza un `Error` con el mensaje del servidor si la respuesta no es `2xx`
3. Retorna el JSON parseado

```js
const API_URL = 'http://IP/api';  // IP pública del EC2
```

Métodos disponibles agrupados por módulo:

**Auth:** `login`, `register`, `getMe`

**Pacientes:** `getPacientes(search?)`, `getPaciente(id)`, `createPaciente(data)`, `updatePaciente(id, data)`

**Médicos:** `getMedicos()`, `getMedico(id)`, `getSlotsDisponibles(doctorId, fecha)`

**Citas:** `getCitas()`, `getCita(id)`, `getCitasByMedico(doctorId, params)`, `getCitasByPaciente(patientId)`, `getCitasByDia(fecha, medicoId?)`, `createCita(data)`, `updateCita(id, data)`, `cancelarCita(id, reason)`, `completarCita(id)`

**Expedientes:** `getExpediente(patientId)`, `createExpediente(data)`

**Notificaciones:** `getNotificaciones(userId, filter?)`, `marcarLeida(id)`

**Calificaciones:** `calificarDoctor(data)`, `getCalificaciones(doctorId)`

**Dashboard:** `getDashboard()`, `getCitasPorMedico()`, `getIngresos()`, `getCancelaciones()`

**Slots:** `createSlot(data)`, `updateSlot(id, data)`, `deleteSlot(id)`

**Usuarios:** `getUsuarios()`, `changeRole(id, role)`, `toggleUsuario(id)`

### Sistema de estilos

El proyecto usa CSS puro en un único archivo `global.css`. Las clases principales son:

| Clase | Uso |
|---|---|
| `.layout` | Contenedor flex para sidebar + contenido |
| `.sidebar` | Panel lateral de navegación |
| `.content` | Área principal de contenido |
| `.kpi-grid` / `.kpi-card` | Tarjetas de métricas del dashboard |
| `.table-card` | Contenedor de tablas con sombra |
| `.badge-{status}` | Etiquetas de estado de citas |
| `.calendar-card` / `.calendar-grid` | Componente de calendario |
| `.expediente-card` | Tarjeta de registro médico |
| `.notif-card` | Tarjeta de notificación |
| `.detalle-cita-card` | Tarjeta de detalle de cita |
| `.citas-grid` / `.cita-card` | Grid de citas del paciente |
| `.form-input` / `.form-label` | Inputs de formularios |
| `.btn-action` / `.btn-outline` | Botones de acción en tablas |
| `.modal-overlay` / `.modal` | Ventanas modales |

---

## 6. Base de Datos

### Diagrama de tablas

```
users (1) ──────────── (1) patients
  │                          │
  └──────────── (1) doctors  │
                    │        │
                    └── (N) appointments (N) ──┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
              medical_records    cancellation_log
                    │
              record_attachments

users (1) ──── (N) notifications
doctors (1) ── (N) time_slots
doctors (1) ── (N) doctor_ratings (N) ── (1) patients
appointments (1) ── (1) doctor_ratings
```

### Tablas

| Tabla | Descripción | Campos clave |
|---|---|---|
| `users` | Usuarios del sistema | `id`, `email`, `password_hash`, `name`, `role`, `is_active` |
| `patients` | Perfil clínico del paciente | `user_id`, `age`, `blood_type`, `allergies`, `phone` |
| `doctors` | Perfil profesional del médico | `user_id`, `specialty`, `consultation_cost`, `office_number` |
| `appointments` | Citas médicas | `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`, `status` |
| `time_slots` | Horarios disponibles del médico | `doctor_id`, `day_of_week`, `start_time`, `end_time`, `duration_minutes` |
| `medical_records` | Registros de consultas | `patient_id`, `doctor_id`, `diagnosis`, `treatment`, `record_date` |
| `record_attachments` | Archivos adjuntos al expediente | `record_id`, `file_url`, `file_name`, `file_type` |
| `notifications` | Notificaciones del sistema | `user_id`, `type`, `title`, `message`, `is_read` |
| `doctor_ratings` | Calificaciones de médicos | `patient_id`, `doctor_id`, `appointment_id`, `rating` (1-5) |
| `cancellation_log` | Historial de cancelaciones | `appointment_id`, `cancelled_by`, `reason` |

### Estados de una cita

```
pendiente → confirmada → completada
    │            │
    └────────────┴──→ cancelada
```

- `pendiente`: creada por el paciente, espera confirmación
- `confirmada`: creada por recepcionista/director, o confirmada manualmente
- `completada`: marcada por el médico o director al finalizar la consulta
- `cancelada`: cancelada por cualquier rol; se registra en `cancellation_log`

### Inicializar la base de datos

```bash
# Conectarse a RDS y ejecutar el schema
mysql -h medisync-mysql.cqmxcz8lfqk4.us-east-1.rds.amazonaws.com \
      -u admin -p medisync_db < backend/src/database/schema.sql
```

---

## 7. Seguridad

### Autenticación

- Las contraseñas se almacenan hasheadas con **bcrypt** (salt rounds: 10)
- La autenticación usa **JWT** firmado con `JWT_SECRET`
- El token se envía en el header `Authorization: Bearer <token>`
- Expiración configurable con `JWT_EXPIRES_IN` (default: 24h)

### Autorización

- Cada endpoint protegido aplica el middleware `auth` (verifica JWT)
- Los endpoints con restricción de rol aplican además `roleCheck(...roles)`
- El frontend usa `ProtectedRoute` para evitar acceso a rutas no autorizadas

### Red

- La instancia RDS está en subred privada, sin acceso público
- El Security Group de RDS solo acepta conexiones desde el SG de EC2 en el puerto 3306
- El acceso SSH al EC2 está abierto a `0.0.0.0/0` (recomendado restringir a IP fija en producción)

### Almacenamiento

- Los archivos adjuntos se suben directamente a S3 desde el backend
- Las URLs de S3 se almacenan en la tabla `record_attachments`

---

## 8. Flujos Principales

### Flujo de login

```
1. Usuario ingresa email y contraseña en /login
2. Frontend llama POST /api/auth/login
3. Backend verifica credenciales contra la DB
4. Si son válidas, genera JWT con { id, email, role }
5. Frontend guarda el token en localStorage
6. AuthContext actualiza el estado global con los datos del usuario
7. React Router redirige al home según el rol
```

### Flujo de creación de cita (recepcionista)

```
1. Recepcionista selecciona médico y fecha en /recepcionista/agendar
2. Frontend llama GET /api/medicos/:id/slots-disponibles/:fecha
3. Backend calcula horarios libres (slots configurados - citas existentes)
4. Recepcionista selecciona hora y completa el formulario
5. Frontend llama POST /api/citas
6. Backend inserta la cita con status 'confirmada'
7. Backend inserta una notificación en la tabla notifications para el paciente
```

### Flujo de consulta médica

```
1. Médico abre su agenda y selecciona una fecha
2. Ve las citas del día con status 'confirmada'
3. Hace click en "Iniciar consulta" → navega a /medico/consulta/:id
4. Completa el formulario: diagnóstico, tratamiento, notas
5. Frontend llama POST /api/expedientes (crea el registro médico)
6. Frontend llama PATCH /api/citas/:id/completar
7. La cita cambia a status 'completada'
8. El paciente puede calificar al médico desde /paciente/calificar/:citaId
```

### Flujo de notificaciones Lambda

```
1. Backend inserta registro en tabla notifications al crear/modificar/cancelar cita
2. Lambda puede ser invocada por EventBridge en horarios programados
3. Lambda lee notificaciones pendientes de la DB
4. Envía emails usando Amazon SES con el remitente configurado en FROM_EMAIL
```

---

## 9. Configuración y Despliegue

### Requisitos previos

- Node.js 18+
- MySQL 8.0 (local o RDS)
- Cuenta AWS con acceso a EC2, RDS, S3, Lambda
- Terraform >= 1.3.0

### Despliegue local (desarrollo)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd MediSync

# 2. Configurar el backend
cd backend
cp .env.example .env
# Editar .env con los valores correctos
npm install
npm run dev

# 3. Configurar el frontend
cd ../frontend
npm install
npm start
```

### Despliegue en AWS

```bash
# 1. Desplegar infraestructura
cd infrastructure
terraform init
terraform apply

# 2. Conectar a EC2 y configurar el backend
ssh -i vockey.pem ec2-user@100.55.193.247
# Clonar repo, instalar dependencias, configurar .env, iniciar con PM2

# 3. Inicializar la base de datos
mysql -h <rds-endpoint> -u admin -p medisync_db < backend/src/database/schema.sql

# 4. Build del frontend y subir a S3
cd frontend
npm run build
aws s3 sync build/ s3://medisync-static-assets --delete
```

---

## 10. Variables de Entorno

### Backend (`.env`)

```env
# Base de datos
DB_HOST=medisync-mysql.cqmxcz8lfqk4.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=<contraseña>
DB_NAME=medisync_db

# JWT
JWT_SECRET=<clave-secreta-larga-y-aleatoria>
JWT_EXPIRES_IN=24h

# AWS S3
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_REGION=us-east-1
S3_BUCKET=medisync-static-assets

# Servidor
PORT=3001
```

### Frontend

La URL base de la API está definida directamente en `src/services/api.js`:

```js
const API_URL = 'http://IP/api';
```

Para cambiar el entorno (local vs producción), modificar esta constante o usar variables de entorno de React (`REACT_APP_API_URL`).

### Terraform (`terraform.tfvars`)

```hcl
db_username             = "admin"
db_password             = "<contraseña>"
notification_email_from = "noreply@medisync.example.com"
```

---



---

## 11. Guía de Componentes Web

Esta sección documenta todos los componentes reutilizables del frontend: sus clases CSS, props, comportamiento y ejemplos de uso.

---

### Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| Azul principal | `#4169E1` | Botones primarios, links activos, acentos |
| Azul claro | `#e8eeff` | Fondos de elementos activos |
| Verde | `#27ae60` | Estado confirmada, éxito |
| Naranja | `#e67e22` | Estado pendiente, advertencias |
| Rojo | `#e74c3c` | Estado cancelada, errores, peligro |
| Morado | `#8e44ad` | KPI de ingresos |
| Azul info | `#1565c0` | Estado completada |
| Fondo | `#f0f2f5` | Fondo general de la app |
| Blanco | `#ffffff` | Tarjetas y paneles |
| Texto principal | `#1a1a2e` | Títulos |
| Texto secundario | `#555` / `#888` | Labels, subtítulos |

---

### Layout base

Todo el contenido de las páginas autenticadas usa esta estructura:

```jsx
<div className="layout">
  <Sidebar{Rol} />
  <main className="content">
    <h1 className="page-title">Título de la página</h1>
    {/* contenido */}
    <div className="footer">Mayo 2026 | Universidad Tecmilenio | ...</div>
  </main>
</div>
```

| Clase | Descripción |
|---|---|
| `.layout` | `display: flex`, ocupa el 100% del viewport |
| `.sidebar` | Panel izquierdo fijo de 250px |
| `.content` | Área derecha con `padding: 24px`, crece para llenar el espacio |
| `.page-title` | `font-size: 22px`, `font-weight: 600`, `color: #1a1a2e` |
| `.footer` | Texto centrado gris al pie de cada página |

---

### Sidebar

Cuatro variantes según el rol. Todas comparten la misma estructura y clases CSS.

**Componentes disponibles:**
- `SidebarDirector` — rutas del director
- `SidebarMedico` — rutas del médico
- `SidebarPaciente` — rutas del paciente
- `SidebarRecepcionista` — rutas de la recepcionista

**Props:** ninguna. Obtiene el usuario de `useAuth()`.

**Estructura interna:**

```jsx
<aside className="sidebar">
  <div className="sidebar-header">          {/* logo MediSync */}
  <div className="sidebar-user">            {/* avatar + nombre + rol */}
    <div className="avatar">A</div>         {/* inicial del nombre */}
    <div className="info">
      <strong>Nombre</strong>
      <span>Rol</span>
    </div>
  </div>
  <nav>
    <NavLink to="/ruta">Enlace</NavLink>    {/* activo = clase .active */}
  </nav>
  <button className="btn-logout">Cerrar Sesión</button>
</aside>
```

| Clase | Descripción |
|---|---|
| `.sidebar-header` | Logo centrado con borde inferior |
| `.sidebar-user` | Fondo `#f5f7fa`, border-radius 10px |
| `.avatar` | Círculo azul 40×40px con la inicial del usuario |
| `.sidebar nav a` | Links con padding, border-radius 8px |
| `.sidebar nav a.active` | Fondo `#e8eeff`, texto azul, font-weight 500 |
| `.btn-logout` | Botón al fondo del sidebar, rojo al hover |

---

### ProtectedRoute

Componente de guardia de rutas. Redirige a `/login` si el usuario no está autenticado o no tiene el rol requerido.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| `children` | ReactNode | Sí | Componente a renderizar si pasa la validación |
| `roles` | string[] | No | Lista de roles permitidos. Si se omite, solo verifica autenticación |

**Uso:**

```jsx
// Solo autenticado
<ProtectedRoute>
  <MiPagina />
</ProtectedRoute>

// Autenticado + rol específico
<ProtectedRoute roles={['director']}>
  <Dashboard />
</ProtectedRoute>

// Múltiples roles
<ProtectedRoute roles={['medico', 'director']}>
  <ConsultaActiva />
</ProtectedRoute>
```

**Comportamiento:**
- Mientras carga el token inicial → muestra `<div className="loading">Cargando...</div>`
- Sin usuario → `<Navigate to="/login" />`
- Rol no permitido → `<Navigate to="/login" />`
- Todo correcto → renderiza `children`

---

### KPI Cards

Tarjetas de métricas para el dashboard. Se usan en un grid de 4 columnas.

```jsx
<div className="kpi-grid">
  <div className="kpi-card blue">
    <h3>Pacientes Atendidos Hoy</h3>
    <div className="kpi-value">14</div>
  </div>
  <div className="kpi-card green">
    <h3>Citas Confirmadas (Mes)</h3>
    <div className="kpi-value">112</div>
  </div>
  <div className="kpi-card purple">
    <h3>Ingresos Estimados (Mes)</h3>
    <div className="kpi-value">$125,500 MXN</div>
  </div>
  <div className="kpi-card red">
    <h3>Tasa de Cancelación</h3>
    <div className="kpi-value">8.5%</div>
  </div>
</div>
```

| Clase | Color de fondo | Uso recomendado |
|---|---|---|
| `.kpi-card.blue` | `#4169E1` | Pacientes, citas |
| `.kpi-card.green` | `#27ae60` | Confirmaciones, éxito |
| `.kpi-card.purple` | `#8e44ad` | Ingresos, finanzas |
| `.kpi-card.red` | `#e74c3c` | Cancelaciones, alertas |

| Clase interna | Descripción |
|---|---|
| `.kpi-grid` | Grid de 4 columnas con gap 16px |
| `.kpi-card h3` | Etiqueta pequeña, `font-size: 13px`, opacidad 0.9 |
| `.kpi-value` | Número grande, `font-size: 28px`, `font-weight: 700` |

---

### Table Card

Contenedor estándar para tablas de datos.

```jsx
<div className="table-card">
  <h3>Título de la tabla</h3>
  <table>
    <thead>
      <tr>
        <th>Columna 1</th>
        <th>Columna 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Dato 1</td>
        <td>Dato 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

| Clase | Descripción |
|---|---|
| `.table-card` | Fondo blanco, border-radius 12px, sombra sutil |
| `th` | Texto gris `#888`, `font-size: 13px`, borde inferior |
| `td` | `font-size: 14px`, borde inferior `#f5f5f5` |
| `tr:hover` | Fondo `#fafafa` |

---

### Badges de estado

Etiquetas de color para mostrar el estado de una cita.

```jsx
<span className="badge badge-confirmada">confirmada</span>
<span className="badge badge-pendiente">pendiente</span>
<span className="badge badge-cancelada">cancelada</span>
<span className="badge badge-completada">completada</span>
```

| Clase | Fondo | Texto | Estado |
|---|---|---|---|
| `.badge-confirmada` | `#e8f5e9` | `#2e7d32` (verde) | Cita confirmada |
| `.badge-pendiente` | `#fff3e0` | `#e65100` (naranja) | Esperando confirmación |
| `.badge-cancelada` | `#ffebee` | `#c62828` (rojo) | Cita cancelada |
| `.badge-completada` | `#e3f2fd` | `#1565c0` (azul) | Consulta realizada |

---

### Botones

El sistema tiene cinco variantes de botón:

```jsx
{/* Primario — acción principal */}
<button className="btn btn-primary">Guardar</button>

{/* Acción en tabla — acción secundaria inline */}
<button className="btn-action">Ver perfil</button>

{/* Acción peligrosa en tabla */}
<button className="btn-action btn-action-danger">Cancelar</button>

{/* Outline — acción secundaria */}
<button className="btn-outline">Cancelar</button>

{/* Outline peligroso — acción destructiva */}
<button className="btn-outline-danger">Cancelar Cita</button>

{/* Volver — navegación */}
<button className="btn-back">← Volver</button>
```

| Clase | Descripción | Uso típico |
|---|---|---|
| `.btn.btn-primary` | Azul sólido, ancho completo | Formularios, confirmaciones |
| `.btn-action` | Fondo azul claro, texto azul | Acciones en filas de tabla |
| `.btn-action.btn-action-danger` | Fondo rojo claro, texto rojo | Cancelar/eliminar en tabla |
| `.btn-outline` | Borde gris, fondo blanco | Cancelar en modales/formularios |
| `.btn-outline-danger` | Borde rojo, texto rojo | Cancelar cita, acciones destructivas |
| `.btn-logout` | Sin fondo, borde gris | Cierre de sesión en sidebar |
| `.btn-back` | Sin fondo, texto azul | Navegación hacia atrás |

**Nota:** `.btn-primary` tiene `width: 100%` por defecto. Para usarlo inline agregar `style={{ width: 'auto', margin: 0 }}`.

---

### Formularios

Clases para inputs y labels consistentes en todos los formularios:

```jsx
<div>
  <label className="form-label">Nombre del campo</label>
  <input type="text" className="form-input" placeholder="..." />
</div>

{/* Select */}
<select className="form-input">
  <option>Opción 1</option>
</select>

{/* Textarea */}
<textarea className="form-input" rows={3} />

{/* Select de rol */}
<select className="role-select" value={rol} onChange={...}>
  <option value="director">director</option>
</select>

{/* Input de búsqueda */}
<input className="search-input" placeholder="Buscar..." />

{/* Mensaje de error */}
<div className="error-msg">El correo ya está registrado</div>
```

| Clase | Descripción |
|---|---|
| `.form-label` | `font-size: 13px`, `color: #555`, `font-weight: 500` |
| `.form-input` | Ancho completo, padding 9px, border-radius 8px, borde azul al focus |
| `.search-input` | Ancho fijo 240px, mismo estilo que `.form-input` |
| `.role-select` | Compacto, para uso inline en tablas |
| `.error-msg` | Fondo rojo claro, texto rojo, border-radius 6px |

---

### Modal

Ventana emergente centrada con overlay oscuro. Se controla con estado local.

```jsx
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <h3>Título del modal</h3>
      {/* contenido */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn-outline" onClick={() => setShowModal(false)}>
          Cancelar
        </button>
        <button className="btn btn-primary" style={{ width: 'auto', margin: 0 }}>
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}
```

| Clase | Descripción |
|---|---|
| `.modal-overlay` | Fondo negro semitransparente, cubre toda la pantalla, `z-index: 1000` |
| `.modal` | Blanco, 480px de ancho, border-radius 12px, scroll interno si el contenido es largo |

**Patrón de cierre:** click en el overlay cierra el modal; `e.stopPropagation()` en el modal evita que el click se propague al overlay.

---

### Calendario

Componente de calendario mensual interactivo. Usado en `Agenda.jsx` (director) y `MiAgenda.jsx` (médico).

```jsx
<div className="calendar-card">
  <div className="calendar-nav">
    <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
    <span className="cal-month-label">Mayo 2026</span>
    <button className="cal-nav-btn" onClick={nextMonth}>›</button>
  </div>
  <div className="calendar-grid">
    {/* 7 celdas de encabezado */}
    <div className="cal-header-cell">Lu</div>
    {/* celdas de días */}
    <div className="cal-cell">1</div>
    <div className="cal-cell cal-today">4</div>       {/* día actual */}
    <div className="cal-cell cal-selected">10</div>   {/* día seleccionado */}
    <div className="cal-cell cal-other">31</div>      {/* día de otro mes */}
  </div>
</div>
```

| Clase | Descripción |
|---|---|
| `.calendar-card` | Contenedor blanco con sombra |
| `.calendar-nav` | Flex entre botones de navegación y label del mes |
| `.cal-nav-btn` | Botón cuadrado 32×32px con borde |
| `.cal-month-label` | Nombre del mes y año, `font-weight: 600` |
| `.calendar-grid` | Grid de 7 columnas, separadores de 1px gris |
| `.cal-header-cell` | Fondo `#f5f7fa`, texto gris, días de la semana |
| `.cal-cell` | Celda de día, `min-height: 60px`, hover azul claro |
| `.cal-today` | Fondo `#e8eeff`, texto azul, negrita |
| `.cal-selected` | Fondo `#4169E1`, texto blanco (usa `!important`) |
| `.cal-other` | Texto gris claro, cursor default, días de meses adyacentes |

**Lógica de construcción del grid:** siempre genera 42 celdas (6 semanas × 7 días) para mantener altura constante. Las celdas fuera del mes actual reciben `current: false`.

---

### Tarjeta de Cita (vista paciente)

Grid responsivo de tarjetas para la vista de citas del paciente.

```jsx
<div className="citas-grid">
  <div className="cita-card" onClick={() => navigate(`/paciente/citas/${id}`)}>
    <div className="cita-card-header">
      <div className="cita-fecha">15 Mayo 2026</div>
      <span className="badge badge-confirmada">confirmada</span>
    </div>
    <div className="cita-info">
      <div>09:00 AM</div>
      <div>Dr. Ramírez</div>
    </div>
    <button className="btn-outline-danger">Cancelar</button>
  </div>
</div>
```

| Clase | Descripción |
|---|---|
| `.citas-grid` | Grid responsivo, columnas mínimo 280px, gap 16px |
| `.cita-card` | Tarjeta blanca con sombra, cursor pointer, hover con sombra mayor |
| `.cita-card-header` | Flex entre fecha y badge de estado |
| `.cita-fecha` | Texto en negrita, `font-size: 14px` |
| `.cita-info` | Columna de detalles, `font-size: 13px`, `color: #555` |

---

### Tarjeta de Detalle de Cita

Tarjeta de mayor padding para mostrar el detalle completo de una cita.

```jsx
<div className="detalle-cita-card">
  <div className="detalle-grid">
    <div className="detalle-item">
      <div>
        <label>Fecha</label>
        <strong>15 Mayo 2026</strong>
      </div>
    </div>
    <div className="detalle-item">
      <div>
        <label>Médico</label>
        <strong>Dr. Ramírez</strong>
        <span>Cardiología</span>
      </div>
    </div>
  </div>
</div>
```

| Clase | Descripción |
|---|---|
| `.detalle-cita-card` | Blanco, padding 28px, border-radius 12px, sombra |
| `.detalle-grid` | Grid de 2 columnas, gap 20px |
| `.detalle-item` | Flex con gap, alineado al inicio |
| `.detalle-item label` | `font-size: 12px`, `color: #888` |
| `.detalle-item strong` | `font-size: 15px`, `font-weight: 600` |

---

### Tarjeta de Expediente

Para mostrar registros del historial médico de un paciente.

```jsx
<div className="expediente-card">
  <div className="expediente-header">
    <span className="expediente-fecha">2026-05-07</span>
    <span>Dr. García — Cardiología</span>
  </div>
  <div className="expediente-body">
    <div className="exp-field">
      <label>Diagnóstico:</label>
      <span>Angina estable</span>
    </div>
    <div className="exp-field">
      <label>Tratamiento:</label>
      <span>Nitroglicerina sublingual</span>
    </div>
  </div>
</div>
```

| Clase | Descripción |
|---|---|
| `.expediente-card` | Blanco, padding 20px, sombra, `margin-bottom: 16px` |
| `.expediente-header` | Flex entre fecha y médico, borde inferior |
| `.expediente-fecha` | Texto azul `#4169E1`, negrita |
| `.expediente-body` | Grid de 2 columnas, gap 10px |
| `.exp-field` | Columna con label gris y valor |
| `.adjunto-chip` | Chip azul claro para links de archivos adjuntos |

---

### Tarjeta de Notificación

Para la lista de notificaciones del paciente.

```jsx
<div className={`notif-card ${!n.is_read ? 'notif-unread' : ''}`}>
  <div className="notif-icon" style={{ background: '#27ae6022', color: '#27ae60' }}>
    +
  </div>
  <div className="notif-body">
    <strong>Cita Confirmada</strong>
    <p>Tu cita del 15/05/2026 ha sido confirmada.</p>
  </div>
  <button className="btn-action">Marcar como leída</button>
</div>
```

| Clase | Descripción |
|---|---|
| `.notif-card` | Flex horizontal, blanco, padding 16px, sombra |
| `.notif-unread` | Borde izquierdo azul de 3px |
| `.notif-icon` | Círculo 44×44px, color dinámico según tipo |
| `.notif-body` | Flex 1, contiene título y mensaje |

**Colores por tipo de notificación:**

| Tipo | Color |
|---|---|
| `confirmacion` | `#27ae60` (verde) |
| `recordatorio` | `#e67e22` (naranja) |
| `cancelacion` | `#e74c3c` (rojo) |

---

### Filter Buttons

Botones de filtro tipo pill, usados en la pantalla de notificaciones.

```jsx
<button className={`filter-btn ${filter === 'todas' ? 'active' : ''}`}
        onClick={() => setFilter('todas')}>
  Todas(8)
</button>
<button className={`filter-btn ${filter === 'no_leidas' ? 'active' : ''}`}
        onClick={() => setFilter('no_leidas')}>
  No Leidas(5)
</button>
```

| Clase | Descripción |
|---|---|
| `.filter-btn` | Pill con borde gris, fondo blanco |
| `.filter-btn.active` | Fondo azul `#4169E1`, texto blanco |

---

### Perfil de Paciente (tarjeta lateral)

Tarjeta de información clínica del paciente, usada en vistas de director y médico.

```jsx
<div className="table-card" style={{ textAlign: 'center' }}>
  <div className="avatar-lg">C</div>
  <h3>Carlos Mendoza</h3>
  <div className="info-list">
    <div className="info-row">
      <span>Edad:</span>
      <span>28</span>
    </div>
    <div className="info-row">
      <span>Tipo de Sangre:</span>
      <span>B+</span>
    </div>
  </div>
</div>
```

| Clase | Descripción |
|---|---|
| `.avatar-lg` | Círculo azul 72×72px, inicial del nombre, centrado |
| `.info-list` | Columna de filas de información |
| `.info-row` | Flex entre label gris y valor en negrita, borde inferior |

---

### Estado de carga

Pantalla de carga centrada, usada mientras se esperan datos de la API.

```jsx
{loading && <div className="loading">Cargando...</div>}
```

| Clase | Descripción |
|---|---|
| `.loading` | Flex centrado, `min-height: 100vh`, texto gris `#888` |

Para carga parcial (dentro de una sección, no pantalla completa):

```jsx
<div className="loading" style={{ minHeight: 200 }}>Cargando...</div>
```

---

### Convenciones de uso

**Estructura de una página típica:**

```jsx
function MiPagina() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getData()
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="layout">
      <SidebarRol />
      <main className="content">
        <h1 className="page-title">Título</h1>

        {/* contenido */}

        <div className="footer">
          Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final
        </div>
      </main>
    </div>
  );
}
```

**Reglas generales:**
- Siempre usar `.layout` + `Sidebar` + `.content` como contenedor base en páginas autenticadas
- El footer va al final de cada `<main className="content">`
- Los mensajes de error usan `.error-msg`
- Las acciones en tablas usan `.btn-action` (azul) o `.btn-action.btn-action-danger` (rojo)
- Los formularios en modales usan `.form-label` + `.form-input`
- El estado de carga parcial usa `<p style={{ color: '#888' }}>Cargando...</p>` dentro de `.table-card`
