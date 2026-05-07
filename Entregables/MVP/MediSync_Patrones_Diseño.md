# MediSync — Documento de Patrones de Diseño

**Proyecto:** MediSync — Clínica San Ángel  
**Rol:** Arquitecto de Software  
**Arquitectura:** Monolito Modular  
**Stack:** Node.js + Express + React + MySQL (AWS RDS)  
**Fecha:** Mayo 2026  

---

## 1. Introducción

Este documento describe los patrones de diseño identificados e implementados en el proyecto MediSync hasta la fecha. Cada patrón se documenta con su contexto, justificación y un ejemplo real extraído del código fuente del repositorio.

MediSync utiliza una arquitectura de Monolito Modular organizada en 10 módulos funcionales, desplegada sobre infraestructura AWS (EC2 + RDS MySQL + S3 + Lambda). Los patrones aquí documentados emergen naturalmente de las decisiones de diseño tomadas por el equipo.

---

## Patrón 1: Singleton + Connection Pool `[Creacional]`

| | |
|---|---|
| **Archivo** | `backend/src/config/db.js` |
| **Problema** | Abrir una conexión nueva a RDS por cada request es costoso (~50ms por conexión TCP). Múltiples módulos necesitan acceso a la base de datos. |
| **Solución** | Un único pool de conexiones compartido por todos los módulos. Se crea una sola vez al iniciar el servidor y se reutiliza en cada query. |

### Código real:

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,   // máximo 10 conexiones simultáneas
    queueLimit: 0
});

module.exports = pool;  // misma instancia para todos los módulos
```

### Beneficios obtenidos:
- El pool se instancia una sola vez (Singleton) — todos los módulos importan el mismo objeto
- Límite de 10 conexiones simultáneas evita saturar el RDS
- Si una conexión se cae, el pool la reemplaza automáticamente
- `waitForConnections: true` encola requests cuando el pool está lleno en lugar de fallar

---

## Patrón 2: Middleware Chain `[Estructural / Comportamiento]`

| | |
|---|---|
| **Archivos** | `backend/src/middleware/auth.js` \| `backend/src/middleware/roleCheck.js` |
| **Problema** | Cada endpoint protegido necesita verificar autenticación y autorización antes de ejecutar la lógica de negocio. |
| **Solución** | Funciones middleware encadenadas en Express que se ejecutan secuencialmente antes de llegar al controller. |

### auth.js — Verificación de JWT:

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // pasa el usuario al siguiente middleware
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
};

module.exports = auth;
```

### roleCheck.js — Autorización por rol:

```javascript
const roleCheck = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        if (!rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permisos para esta accion' });
        }
        next();
    };
};

module.exports = roleCheck;
```

### Uso encadenado en una ruta:

```javascript
// Ejemplo de uso en cualquier módulo de rutas:
router.delete('/:id', auth, roleCheck('director'), controller.remove);
//                    ^^^^  ^^^^^^^^^^^^^^^^^^^^^^
//                    1ro   2do — solo si auth pasó
```

### Flujo de ejecución:
- Request llega → `auth` verifica el JWT
- Si el token es válido → `roleCheck` verifica que el rol esté permitido
- Si el rol es válido → el controller ejecuta la lógica de negocio
- Si cualquier middleware falla → responde con error y no continúa

---

## Patrón 3: MVC — Model View Controller `[Arquitectónico]`

| | |
|---|---|
| **Archivos** | Cada módulo: `*.routes.js` \| `*.controller.js` \| `*.service.js` |
| **Problema** | Sin separación de responsabilidades, la lógica de rutas, validación y queries SQL estaría mezclada en un solo archivo difícil de mantener. |
| **Solución** | Cada módulo se divide en tres archivos con responsabilidad única. |

### Estructura por módulo:

```
src/modules/pacientes/
├── pacientes.routes.js      → define los endpoints y aplica middlewares
├── pacientes.controller.js  → extrae datos del request, llama al service,
│                              responde con JSON y maneja errores HTTP
└── pacientes.service.js     → lógica de negocio y queries a MySQL
```

### Flujo de una petición:

```
Cliente (React)
    ↓  HTTP Request
routes.js    → recibe la petición, aplica auth y roleCheck, delega al controller
    ↓
controller.js → extrae req.body / req.params, llama al service, responde JSON
    ↓
service.js   → ejecuta queries SQL, aplica reglas de negocio, retorna datos
    ↓
MySQL (RDS)  → devuelve resultado
```

### Beneficio clave:
- Si hay un bug en una query SQL → está en `service.js`
- Si hay un error de validación → está en `controller.js`
- Si una ruta no responde → está en `routes.js`
- La lógica de negocio en `service.js` se puede probar sin levantar un servidor HTTP

---

## Patrón 4: Module Pattern `[Estructural]`

| | |
|---|---|
| **Archivo** | `backend/server.js` |
| **Problema** | El monolito necesita organización que permita crecer sin convertirse en código espagueti, y que facilite una eventual migración a microservicios. |
| **Solución** | 10 módulos independientes con correspondencia 1:1 a funcionalidades del sistema, registrados en server.js. |

### Registro de módulos en server.js:

```javascript
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cada módulo es independiente y se registra con su prefijo de ruta
app.use('/api/auth',           require('./src/modules/auth/auth.routes'));
app.use('/api/pacientes',      require('./src/modules/pacientes/pacientes.routes'));
app.use('/api/medicos',        require('./src/modules/medicos/medicos.routes'));
app.use('/api/citas',          require('./src/modules/citas/citas.routes'));
app.use('/api/expedientes',    require('./src/modules/expedientes/expedientes.routes'));
app.use('/api/notificaciones', require('./src/modules/notificaciones/notificaciones.routes'));
app.use('/api/calificaciones', require('./src/modules/calificaciones/calificaciones.routes'));
app.use('/api/dashboard',      require('./src/modules/dashboard/dashboard.routes'));
app.use('/api/slots',          require('./src/modules/slots/slots.routes'));
app.use('/api/usuarios',       require('./src/modules/usuarios/usuarios.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3001);
```

### Correspondencia módulo → funcionalidad:

| Módulo | Funcionalidad |
|--------|--------------|
| `auth` | Autenticación JWT |
| `pacientes` | Gestión de pacientes |
| `medicos` | Catálogo de médicos |
| `citas` | Agenda de citas |
| `expedientes` | Expediente médico digital + adjuntos |
| `notificaciones` | Recordatorios y alertas |
| `calificaciones` | Calificación de médicos |
| `dashboard` | Métricas administrativas |
| `slots` | Configuración de horarios |
| `usuarios` | Gestión de usuarios y roles |

---

## Patrón 5: Facade `[Estructural]`

| | |
|---|---|
| **Archivo** | `medisync-frontend/src/services/api.js` |
| **Problema** | Cada componente React haría su propio `fetch()` con la URL completa del backend, el token JWT y el manejo de errores — código duplicado en decenas de componentes. |
| **Solución** | Un único archivo `api.js` que centraliza todas las llamadas HTTP al backend, adjunta el JWT automáticamente y maneja errores en un solo punto. |

### Patrón de uso:

```javascript
// Sin Facade (código duplicado en cada componente):
const res = await fetch('http://100.55.193.247:3001/api/citas', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

// Con Facade (una sola línea en cualquier componente):
const citas = await api.getCitas();

// Ventajas:
// 1. Un solo lugar para cambiar la URL del backend (localhost → IP de EC2)
// 2. Token JWT adjuntado automáticamente a todas las peticiones
// 3. Manejo de errores centralizado: si el token expira → redirige al login
```

---

## Patrón 6: Context API — Observer `[Comportamiento]`

| | |
|---|---|
| **Archivo** | `medisync-frontend/src/context/AuthContext.jsx` |
| **Problema** | React necesita saber en todo momento quién es el usuario logueado y cuál es su rol para mostrar la vista correcta y enviar el JWT en cada petición. |
| **Solución** | Context API de React actúa como un Observer: el estado de sesión se almacena en un contexto global y todos los componentes suscritos reaccionan automáticamente cuando cambia. |

### Flujo del patrón:

```
AuthContext.jsx
    ↓  provee estado global (usuario, rol, token)
App.jsx
    ↓  consume el contexto para decidir qué rutas mostrar
ProtectedRoute.jsx
    ↓  verifica si el usuario está logueado antes de renderizar
SidebarPaciente / SidebarMedico / SidebarDirector / SidebarRecepcionista
    → cada sidebar se renderiza según el rol del contexto
```

### Vistas por rol implementadas:
- **paciente/** → MisCitas, DetalleCita, MiExpediente, Notificaciones, CalificarDoctor
- **medico/** → MiAgenda, ConsultaActiva, PerfilPacienteMedico
- **director/** → Dashboard, Agenda, Pacientes, CatalogoMedicos, Configuracion, MetricasCancelaciones
- **recepcionista/** → AgendaDiaria, RegistroPaciente, BuscarPaciente, AgendarCita

---

## Patrón 7: Soft Delete `[Datos]`

| | |
|---|---|
| **Tablas** | `users` \| `patients` \| `doctors` |
| **Problema** | Eliminar físicamente un médico o paciente rompería la integridad referencial — las citas y expedientes existentes quedarían huérfanos. |
| **Solución** | Campo `is_active` en lugar de borrado físico. El registro persiste en la base de datos; solo se marca como inactivo. |

### Implementación en configuracion.service.js:

```javascript
const toggleUsuario = async (id) => {
    // Alterna is_active en la tabla users
    await pool.query(
        'UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]
    );

    // Propaga el cambio a la tabla de perfil correspondiente
    const [user] = await pool.query(
        'SELECT role FROM users WHERE id = ?', [id]
    );
    if (user[0].role === 'paciente') {
        await pool.query(
            'UPDATE patients SET is_active = NOT is_active WHERE user_id = ?', [id]
        );
    } else if (user[0].role === 'medico') {
        await pool.query(
            'UPDATE doctors SET is_active = NOT is_active WHERE user_id = ?', [id]
        );
    }
};
```

### Beneficios:
- Preserva integridad referencial — citas y expedientes siguen vinculados al médico/paciente
- Permite reactivar usuarios sin pérdida de datos
- El historial queda completo para el dashboard administrativo

---

## Patrón 8: Infrastructure as Code (IaC) `[Infraestructura]`

| | |
|---|---|
| **Archivos** | `infrastructure/main.tf` \| `variables.tf` \| `outputs.tf` |
| **Problema** | Las credenciales del laboratorio AWS Academy expiran cada sesión. Recrear la infraestructura manualmente sería propenso a errores y no repetible. |
| **Solución** | Terraform define el estado deseado de la infraestructura como código versionado. Al iniciar cada sesión se ejecuta `terraform refresh` para sincronizar el estado. |

### Recursos gestionados por Terraform:
- VPC con subred pública (EC2 + S3) y dos subredes privadas (RDS)
- Security Groups con reglas encadenadas: RDS solo acepta tráfico del SG de EC2
- EC2 t3.small con Amazon Linux 2023 y Elastic IP fija
- RDS MySQL 8.0 db.t3.micro en subred privada
- S3 para archivos estáticos del frontend
- Lambda + permisos EventBridge para notificaciones automáticas

### Ejemplo — Security Group chaining:

```hcl
# El RDS solo acepta conexiones del Security Group del EC2
resource "aws_security_group" "rds" {
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]  # referencia al SG del EC2
  }
}
```

---

## 2. Resumen de Patrones

| # | Patrón | Categoría | Archivo clave |
|---|--------|-----------|---------------|
| 1 | Singleton + Connection Pool | Creacional | `src/config/db.js` |
| 2 | Middleware Chain | Comportamiento | `src/middleware/auth.js, roleCheck.js` |
| 3 | MVC | Arquitectónico | `*.routes.js / *.controller.js / *.service.js` |
| 4 | Module Pattern | Estructural | `server.js` |
| 5 | Facade | Estructural | `src/services/api.js` |
| 6 | Context API (Observer) | Comportamiento | `src/context/AuthContext.jsx` |
| 7 | Soft Delete | Datos | `configuracion.service.js` |
| 8 | Infrastructure as Code | Infraestructura | `infrastructure/main.tf` |
