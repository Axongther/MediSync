# MediSync — Métricas Finales de Proceso

**Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final**
**Mayo 2026**

---

## Resumen

El presente documento consolida las métricas cuantitativas obtenidas al término del desarrollo del sistema MediSync, una plataforma de gestión médica digital construida como proyecto final del curso de Diseño y Arquitectura de Software. El proyecto fue desarrollado en un período de doce días calendario, del 1 al 12 de mayo de 2026, abarcando las etapas de planeación, diseño de infraestructura, desarrollo de backend, desarrollo de frontend y documentación técnica.

El sistema alcanzó un nivel de completitud del **100%** en todas sus capas: infraestructura en la nube, API REST, interfaz de usuario y documentación. Al cierre del proyecto no se registraron defectos críticos pendientes de resolución en el entorno de producción.

---

## 1. Métricas de Código Fuente

### 1.1 Volumen por capa

La siguiente tabla presenta el conteo de archivos y líneas de código por capa del sistema, excluyendo dependencias de terceros (`node_modules`).

| Capa | Archivos | Líneas de código |
|---|---|---|
| Backend (JavaScript) | 34 | 968 |
| Frontend (JSX, JS, CSS) | 33 | 2,202 |
| Infraestructura (Terraform) | 3 | 572 |
| Base de datos (SQL) | 2 | 106 |
| Documentación (Markdown) | — | 2,429 |
| **Total del proyecto** | **88** | **~6,277** |

### 1.2 Observaciones sobre el volumen

Se destaca que el volumen de documentación técnica (2,429 líneas) supera al del backend (968 líneas), lo cual refleja un esfuerzo deliberado por garantizar la mantenibilidad y transferibilidad del sistema. La documentación generada cubre la arquitectura del sistema, la referencia completa de la API REST, la guía de componentes web y las métricas del proceso.

La capa de infraestructura como código (572 líneas de Terraform) representa la totalidad de los recursos desplegados en AWS, incluyendo red, cómputo, base de datos, almacenamiento y funciones serverless, sin intervención manual en la consola de AWS.

---

## 2. Métricas de Cobertura Funcional

### 2.1 API REST — Backend

El backend expone un total de **45 endpoints** distribuidos en 10 módulos funcionales.

| Módulo | Endpoints | Descripción |
|---|---|---|
| Auth | 3 | Registro, inicio de sesión, perfil |
| Pacientes | 5 | CRUD completo con búsqueda y desactivación |
| Médicos | 7 | CRUD, horarios y slots disponibles |
| Citas | 9 | Gestión completa del ciclo de vida de una cita |
| Expedientes | 6 | Registros médicos y adjuntos en S3 |
| Slots de horario | 3 | Creación, actualización y eliminación |
| Notificaciones | 2 | Consulta y marcado como leída |
| Calificaciones | 2 | Registro y consulta por médico |
| Dashboard | 5 | KPIs, reportes e ingresos |
| Usuarios | 3 | Gestión de roles y estados |
| **Total** | **45** | |

### 2.2 Interfaz de usuario — Frontend

El frontend implementa **18 páginas** distribuidas en 4 roles de usuario, con control de acceso por ruta.

| Rol | Páginas implementadas |
|---|---|
| Director | Dashboard, Agenda, Pacientes, Perfil de Paciente, Catálogo de Médicos, Reportes, Configuración |
| Médico | Mi Agenda, Mis Pacientes, Consulta Activa, Perfil de Paciente |
| Paciente | Mis Citas, Detalle de Cita, Mi Expediente, Notificaciones, Calificar Doctor |
| Recepcionista | Agenda Diaria, Agendar Cita, Buscar Paciente, Registro de Paciente |
| **Total** | **18 páginas** |

Adicionalmente, se implementaron 6 componentes de layout y utilidad: `ProtectedRoute`, `SidebarDirector`, `SidebarMedico`, `SidebarPaciente` y `SidebarRecepcionista`.

### 2.3 Infraestructura en la nube

Se desplegaron **11 recursos de AWS** mediante Terraform, todos en la región `us-east-1`.

| Recurso | Nombre | Estado al cierre |
|---|---|---|
| VPC | `medisync-vpc` | available |
| Subnet pública | `medisync-subnet-public` | available |
| Subnet privada A | `medisync-subnet-private-a` | available |
| Subnet privada B | `medisync-subnet-private-b` | available |
| EC2 | `medisync-ec2-backend` | running |
| RDS MySQL 8.0 | `medisync-mysql` | available |
| S3 | `medisync-static-assets` | activo |
| Lambda | `medisync-notifications` | Active |
| Security Group EC2 | `medisync-sg-ec2` | activo |
| Security Group RDS | `medisync-sg-rds` | activo |
| Elastic IP | `medisync-eip-backend` | asociada |

---

## 3. Métricas del Proceso de Desarrollo

### 3.1 Actividad en el repositorio

| Métrica | Valor |
|---|---|
| Días de desarrollo activo | 8 de 12 días calendario |
| Total de commits | 50 |
| Pull Requests mergeados | 7 |
| Ramas utilizadas | 9 |
| Día de mayor actividad | 3 de mayo de 2026 (23 commits) |

### 3.2 Distribución de commits por día

La siguiente tabla muestra la distribución de commits a lo largo del período de desarrollo, permitiendo identificar los momentos de mayor intensidad en el trabajo.

| Fecha | Commits | Actividad principal |
|---|---|---|
| 01 mayo 2026 | 7 | Inicio del proyecto, planeación y estructura base |
| 02 mayo 2026 | 1 | Ajustes menores |
| 03 mayo 2026 | 23 | Sprint principal: infraestructura AWS y backend completo |
| 04 mayo 2026 | 7 | Pruebas de integración con AWS, ajustes de backend |
| 06 mayo 2026 | 1 | Scaffolding del frontend |
| 07 mayo 2026 | 8 | Implementación completa del frontend (18 páginas) |
| 09 mayo 2026 | 1 | Corrección de bug en CatalogoMedicos |
| 12 mayo 2026 | 2 | Documentación técnica y métricas |

**Representación visual de la actividad:**

```
01 mayo  ███████           7 commits  — Inicio y planeación
02 mayo  █                 1 commit   — Ajustes
03 mayo  ███████████████████████     23 commits  — Sprint principal
04 mayo  ███████           7 commits  — Integración AWS
06 mayo  █                 1 commit   — Scaffolding frontend
07 mayo  ████████          8 commits  — Frontend completo
09 mayo  █                 1 commit   — Hotfix
12 mayo  ██                2 commits  — Documentación
```

### 3.3 Análisis del proceso

El desarrollo siguió un patrón de trabajo concentrado. El día 3 de mayo representó el 46% del total de commits del proyecto, correspondiendo al período en que se construyó la mayor parte de la infraestructura como código y la API REST completa. El frontend fue desarrollado en su totalidad el día 7 de mayo, lo que equivale a 18 páginas funcionales en una sola jornada de trabajo.

---

## 4. Métricas de Calidad

### 4.1 Defectos identificados y corregidos

Durante el proceso de revisión y pruebas se identificaron y corrigieron 6 defectos. Ninguno permaneció sin resolución al cierre del proyecto.

| # | Severidad | Archivo afectado | Descripción del defecto |
|---|---|---|---|
| 1 | Alta | `backend/src/config/db.js` | El pool de conexiones MySQL no incluía el campo `database`, causando error 500 en todos los endpoints que ejecutaban queries |
| 2 | Alta | `backend/src/modules/citas/citas.routes.js` | La ruta genérica `/:id` estaba declarada antes que las rutas específicas `/medico/:id`, `/paciente/:id` y `/dia/:fecha`, interceptando todas las peticiones |
| 3 | Alta | `backend/src/modules/auth/auth.controller.js` | La función `getMe` del controlador invocaba `authService.getProfile()`, método inexistente; el nombre correcto era `authService.getMe()` |
| 4 | Alta | `frontend/src/components/layout/SidebarMedico.jsx` | El enlace de navegación apuntaba a `/medico/pacientes`, ruta que no existía en el router; se creó la página `MisPacientes.jsx` y se registró la ruta |
| 5 | Media | `backend/src/middleware/auth.js` | Error tipográfico en el mensaje de respuesta: `'Toke no proporcionado'` en lugar de `'Token no proporcionado'` |
| 6 | Media | `backend/src/modules/medicos/medicos.service.js` | La función `create` no verificaba si el correo electrónico ya existía antes de insertar, resultando en un error 500 genérico en lugar de un 409 con mensaje descriptivo |

### 4.2 Cobertura de roles y permisos

El sistema implementa control de acceso basado en roles (RBAC) en dos niveles: middleware del backend y componente `ProtectedRoute` del frontend. La siguiente tabla resume la cobertura de permisos por módulo.

| Módulo | paciente | medico | recepcionista | director |
|---|---|---|---|---|
| Auth (login/registro) | ✅ | ✅ | ✅ | ✅ |
| Ver pacientes | — | ✅ | ✅ | ✅ |
| Crear paciente | — | — | ✅ | ✅ |
| Ver médicos | ✅ | ✅ | ✅ | ✅ |
| Crear médico | — | — | — | ✅ |
| Crear cita | ✅ | — | ✅ | ✅ |
| Completar cita | — | ✅ | — | ✅ |
| Cancelar cita | ✅ | ✅ | ✅ | ✅ |
| Crear expediente | — | ✅ | — | ✅ |
| Ver expediente | ✅ | ✅ | — | ✅ |
| Calificar médico | ✅ | — | — | — |
| Dashboard y reportes | — | — | — | ✅ |
| Gestión de usuarios | — | — | — | ✅ |

---

## 5. Indicadores de Completitud

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Endpoints de API implementados | 45 | 45 | ✅ 100% |
| Páginas de frontend implementadas | 18 | 18 | ✅ 100% |
| Recursos de infraestructura desplegados | 11 | 11 | ✅ 100% |
| Roles de usuario cubiertos | 4 | 4 | ✅ 100% |
| Tablas de base de datos implementadas | 10 | 10 | ✅ 100% |
| Defectos críticos sin resolver | 0 | 0 | ✅ |
| Documentación técnica generada | Sí | Sí | ✅ |
| Guía de componentes web generada | Sí | Sí | ✅ |
| Documentación de API (API_DOCS.md) | Sí | Sí | ✅ |

---

# Resumen Ejecutivo – Product Owner

El proyecto **MediSync** fue gestionado por dos Product Owners de manera simultánea, con el objetivo de reforzar el entendimiento del rol y dar una visión más estructurada y orientada al negocio del producto.

**MediSync** es una plataforma de gestión médica desarrollada en un periodo de 12 días (del 1 al 12 de mayo de 2026), alcanzando el 100% del alcance definido e integrando backend, frontend, infraestructura en la nube y documentación técnica.

La colaboración entre ambos Product Owners permitió mejorar la priorización del producto y la toma de decisiones, asegurando una entrega alineada a los objetivos planteados.

El proyecto fue entregado completamente funcional, sin defectos críticos abiertos en producción.

---

## 6. Conclusiones

El proyecto MediSync fue completado en su totalidad dentro del período establecido. Se desarrollaron 88 archivos de código fuente con un total aproximado de 6,277 líneas, distribuidas entre backend, frontend, infraestructura y documentación.

El proceso de desarrollo demostró una alta concentración de productividad en jornadas específicas, siendo el 3 de mayo el día de mayor rendimiento con 23 commits que representaron la construcción del núcleo técnico del sistema. La totalidad del frontend, compuesto por 18 páginas funcionales para 4 roles distintos, fue implementada en una sola jornada de trabajo el 7 de mayo.

Se identificaron y resolvieron 6 defectos durante el proceso de revisión, todos de naturaleza lógica o de configuración, sin que ninguno comprometiera la integridad de los datos ni la seguridad del sistema. Al cierre del proyecto, la plataforma opera sin defectos conocidos en el entorno de producción desplegado en AWS.

---
