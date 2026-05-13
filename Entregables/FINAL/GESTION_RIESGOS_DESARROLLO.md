# MediSync — Documento de Gestión de Riesgos
## Caso: Desarrollo de Software

**Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final**
**Mayo 2026**

---

## 1. Introducción

El presente documento identifica, analiza y documenta los riesgos asociados al proceso de desarrollo del sistema MediSync. Su propósito es registrar de manera formal los riesgos que fueron considerados durante el ciclo de vida del proyecto, las estrategias de mitigación aplicadas y el estado final de cada riesgo al cierre del desarrollo.

El alcance de este documento se limita exclusivamente a la dimensión de **desarrollo de software**, abarcando el backend, el frontend, la base de datos y la integración con servicios de terceros. Los riesgos de infraestructura, operación y negocio se tratan en este mismo documento.

---

## 2. Metodología de Evaluación

Cada riesgo fue evaluado con base en dos dimensiones:

- **Probabilidad (P):** Likelihood de que el riesgo se materialice durante el desarrollo.
- **Impacto (I):** Consecuencia sobre el cronograma, la calidad o la funcionalidad del sistema en caso de materializarse.

La combinación de ambas dimensiones produce un **nivel de exposición** que determina la prioridad de atención.

### Escala de valoración

| Nivel | Probabilidad | Impacto |
|---|---|---|
| 1 — Bajo | Poco probable que ocurra | Efecto menor, recuperable en horas |
| 2 — Medio | Posible bajo ciertas condiciones | Retraso de uno a dos días, funcionalidad parcial |
| 3 — Alto | Probable si no se toman medidas | Retraso significativo o pérdida de funcionalidad crítica |

### Matriz de exposición

| | Impacto Bajo (1) | Impacto Medio (2) | Impacto Alto (3) |
|---|---|---|---|
| **Probabilidad Alta (3)** | Medio | Alto | Crítico |
| **Probabilidad Media (2)** | Bajo | Medio | Alto |
| **Probabilidad Baja (1)** | Bajo | Bajo | Medio |

---

## 3. Registro de Riesgos

### R-01 — Inconsistencia entre el esquema de base de datos y la lógica del backend

| Atributo | Detalle |
|---|---|
| **Categoría** | Integración |
| **Descripción** | Durante el desarrollo, el esquema SQL y los queries del backend pueden divergir, generando errores en tiempo de ejecución que no son detectados en compilación. |
| **Probabilidad** | Alta (3) |
| **Impacto** | Alto (3) |
| **Exposición** | Crítico |
| **Estrategia** | Mitigación |
| **Plan de mitigación** | Definir el esquema SQL (`schema.sql`) como fuente única de verdad antes de escribir cualquier servicio. Validar cada módulo contra la base de datos real durante el desarrollo, no al final. |
| **Estado al cierre** | Materializado y resuelto. Se detectó que `db.js` no incluía el campo `database` en el pool de conexiones, causando error 500 en todos los endpoints. Corregido en la misma sesión de desarrollo. |

---

### R-02 — Conflictos de rutas en el router de Express

| Atributo | Detalle |
|---|---|
| **Categoría** | Arquitectura de software |
| **Descripción** | Express evalúa las rutas en el orden en que son declaradas. Una ruta genérica como `/:id` declarada antes que rutas específicas como `/medico/:id` intercepta todas las peticiones, haciendo inaccesibles los endpoints específicos. |
| **Probabilidad** | Media (2) |
| **Impacto** | Alto (3) |
| **Exposición** | Alto |
| **Estrategia** | Mitigación |
| **Plan de mitigación** | Establecer como convención que las rutas específicas siempre se declaren antes que las rutas con parámetros dinámicos. Revisar el orden de declaración en cada archivo `routes.js` durante la revisión de código. |
| **Estado al cierre** | Materializado y resuelto. En `citas.routes.js`, la ruta `/:id` estaba declarada antes que `/medico/:id`, `/paciente/:id` y `/dia/:fecha`. El orden fue corregido. |

---

### R-03 — Desincronización entre nombres de métodos en controller y service

| Atributo | Detalle |
|---|---|
| **Categoría** | Calidad de código |
| **Descripción** | Al refactorizar o renombrar funciones en la capa de servicio, el controlador correspondiente puede quedar referenciando un nombre de método que ya no existe, generando un `TypeError` en tiempo de ejecución. |
| **Probabilidad** | Media (2) |
| **Impacto** | Alto (3) |
| **Exposición** | Alto |
| **Estrategia** | Mitigación |
| **Plan de mitigación** | Mantener consistencia de nombres entre capas desde el inicio. Ante cualquier renombramiento, buscar todas las referencias antes de confirmar el cambio. |
| **Estado al cierre** | Materializado y resuelto. `auth.controller.js` invocaba `authService.getProfile()` cuando el método correcto era `authService.getMe()`. Corregido durante la revisión de código. |

---

### R-04 — Variables de entorno no definidas en producción

| Atributo | Detalle |
|---|---|
| **Categoría** | Configuración y despliegue |
| **Descripción** | El sistema depende de variables de entorno para la conexión a la base de datos, la firma de tokens JWT y el acceso a AWS S3. Si alguna variable no está definida al momento del despliegue, el sistema falla silenciosamente o lanza errores 500 sin mensaje descriptivo. |
| **Probabilidad** | Alta (3) |
| **Impacto** | Alto (3) |
| **Exposición** | Crítico |
| **Estrategia** | Mitigación |
| **Plan de mitigación** | Mantener un archivo `.env.example` con todas las variables requeridas documentadas. Validar la presencia de variables críticas al arranque del servidor. Documentar las variables en la documentación técnica del proyecto. |
| **Estado al cierre** | Controlado. Se mantiene `.env.example` en el repositorio. La variable `JWT_SECRET` fue identificada como causa de un error 500 en el módulo de registro durante las pruebas iniciales. |

---

### R-05 — Ausencia de validación de datos de entrada en los endpoints

| Atributo | Detalle |
|---|---|
| **Categoría** | Seguridad y robustez |
| **Descripción** | Sin validación explícita de los campos del cuerpo de la petición, el sistema puede recibir datos incompletos o malformados que generen errores inesperados en la base de datos o en la lógica de negocio. |
| **Probabilidad** | Alta (3) |
| **Impacto** | Medio (2) |
| **Exposición** | Alto |
| **Estrategia** | Mitigación parcial |
| **Plan de mitigación** | Implementar validación de campos requeridos en los controladores antes de invocar la capa de servicio. Para el MVP, la validación se realiza manualmente; en versiones futuras se recomienda integrar una librería como `joi` o `zod`. |
| **Estado al cierre** | Mitigado parcialmente. Los módulos de `auth` y `pacientes` validan campos requeridos con respuesta `400`. Los módulos restantes confían en las restricciones `NOT NULL` de la base de datos como segunda línea de defensa. |

---

### R-06 — Duplicidad de registros por falta de validación de unicidad en el backend

| Atributo | Detalle |
|---|---|
| **Categoría** | Integridad de datos |
| **Descripción** | Si el backend no verifica la existencia previa de un registro antes de insertarlo, la base de datos lanza un error de constraint de unicidad que el controlador captura como error genérico 500, sin comunicar al cliente la causa real del problema. |
| **Probabilidad** | Media (2) |
| **Impacto** | Medio (2) |
| **Exposición** | Medio |
| **Estrategia** | Mitigación |
| **Plan de mitigación** | Verificar la existencia del registro antes de cada operación de inserción en los servicios que manejan entidades con campos únicos (email, appointment_id). Retornar código 409 con mensaje descriptivo. |
| **Estado al cierre** | Materializado y resuelto. `medicos.service.js` no verificaba duplicidad de email antes de insertar. Se agregó la validación y el manejo del error `EMAIL_EXISTS` con respuesta 409. |

---

### R-07 — Conflictos de rutas en el router del frontend (React Router)

| Atributo | Detalle |
|---|---|
| **Categoría** | Arquitectura de frontend |
| **Descripción** | En React Router, un enlace de navegación que apunta a una ruta no registrada en el router redirige al usuario a la ruta por defecto (`*`), lo que puede interpretarse como un comportamiento inesperado o un error de la aplicación. |
| **Probabilidad** | Media (2) |
| **Impacto** | Alto (3) |
| **Exposición** | Alto |
| **Estrategia** | Mitigación |
| **Plan de mitigación** | Mantener sincronizados los enlaces de los sidebars con las rutas registradas en `App.jsx`. Revisar la consistencia entre ambos archivos al agregar nuevas páginas. |
| **Estado al cierre** | Materializado y resuelto. `SidebarMedico.jsx` contenía un enlace a `/medico/pacientes` que no estaba registrado en el router. Se creó la página `MisPacientes.jsx` y se registró la ruta correspondiente. |

---

### R-08 — Pérdida de sesión por token JWT inválido o expirado sin manejo adecuado

| Atributo | Detalle |
|---|---|
| **Categoría** | Seguridad y experiencia de usuario |
| **Descripción** | Si el token almacenado en `localStorage` expira o es inválido, las peticiones al backend retornan 401. Sin un manejo adecuado en el frontend, el usuario queda en un estado inconsistente donde la interfaz muestra contenido pero las peticiones fallan. |
| **Probabilidad** | Media (2) |
| **Impacto** | Medio (2) |
| **Exposición** | Medio |
| **Estrategia** | Mitigación |
| **Plan de mitigación** | En `AuthContext`, al cargar la aplicación, validar el token contra el endpoint `/api/auth/me`. Si la validación falla, limpiar el token de `localStorage` y redirigir al login. |
| **Estado al cierre** | Controlado. `AuthContext` implementa la validación del token al iniciar la aplicación y limpia el estado en caso de error, forzando el re-login. |

---

### R-09 — Dependencia de la IP pública del EC2 hardcodeada en el frontend

| Atributo | Detalle |
|---|---|
| **Categoría** | Mantenibilidad y despliegue |
| **Descripción** | La URL base de la API (`http://100.55.193.247/api`) está definida directamente en `api.js`. Si la IP del servidor cambia —por reinicio de la instancia EC2 o reasignación de la Elastic IP— el frontend deja de funcionar sin necesidad de modificar código. |
| **Probabilidad** | Baja (1) |
| **Impacto** | Alto (3) |
| **Exposición** | Medio |
| **Estrategia** | Aceptación con plan de contingencia |
| **Plan de mitigación** | Para el MVP, se acepta el riesgo dado que la Elastic IP mitiga el cambio de IP por reinicio. En versiones futuras se recomienda externalizar la URL base como variable de entorno de React (`REACT_APP_API_URL`) y configurar un dominio con Route 53. |
| **Estado al cierre** | Aceptado. La Elastic IP `100.55.193.247` está asociada a la instancia EC2 y no cambia con reinicios. El riesgo permanece latente para escenarios de migración de servidor. |

---

### R-10 — Subida de archivos sin validación de tipo y tamaño en el cliente

| Atributo | Detalle |
|---|---|
| **Categoría** | Seguridad y robustez |
| **Descripción** | El módulo de expedientes permite subir archivos adjuntos a S3. Si la validación de tipo y tamaño se realiza únicamente en el servidor, un cliente puede intentar subir archivos maliciosos o de gran tamaño antes de recibir el rechazo, consumiendo ancho de banda innecesariamente. |
| **Probabilidad** | Baja (1) |
| **Impacto** | Medio (2) |
| **Exposición** | Bajo |
| **Estrategia** | Mitigación en servidor |
| **Plan de mitigación** | El middleware `multer` en el backend valida el tipo MIME (`image/jpeg`, `image/png`, `application/pdf`, `image/gif`) y el tamaño máximo (10 MB) antes de procesar el archivo. En versiones futuras se recomienda agregar validación también en el cliente. |
| **Estado al cierre** | Controlado. La validación en servidor está implementada y funcional. |

---

### R-11 — Ausencia de manejo de transacciones en operaciones multi-tabla

| Atributo | Detalle |
|---|---|
| **Categoría** | Integridad de datos |
| **Descripción** | Operaciones como el registro de un nuevo usuario (que inserta en `users` y luego en `patients` o `doctors`) se ejecutan como queries independientes. Si la segunda inserción falla, el registro en `users` queda huérfano en la base de datos. |
| **Probabilidad** | Baja (1) |
| **Impacto** | Alto (3) |
| **Exposición** | Medio |
| **Estrategia** | Aceptación con deuda técnica documentada |
| **Plan de mitigación** | Para el MVP, el riesgo se acepta dado que las operaciones multi-tabla son pocas y los errores en la segunda inserción son poco probables en condiciones normales. En versiones futuras se recomienda envolver estas operaciones en transacciones MySQL (`BEGIN`, `COMMIT`, `ROLLBACK`). |
| **Estado al cierre** | Aceptado como deuda técnica. No se materializó durante el período de desarrollo y pruebas. |

---

### R-12 — Falta de paginación en endpoints que retornan listas

| Atributo | Detalle |
|---|---|
| **Categoría** | Rendimiento y escalabilidad |
| **Descripción** | Endpoints como `GET /api/citas` o `GET /api/pacientes` retornan la totalidad de los registros en una sola respuesta. Con un volumen de datos reducido esto es aceptable, pero en producción con miles de registros puede generar tiempos de respuesta elevados y consumo excesivo de memoria. |
| **Probabilidad** | Baja (1) — en el contexto del MVP |
| **Impacto** | Medio (2) |
| **Exposición** | Bajo |
| **Estrategia** | Aceptación con deuda técnica documentada |
| **Plan de mitigación** | Para el MVP, el volumen de datos es reducido y el riesgo es aceptable. En versiones futuras se recomienda implementar paginación con parámetros `page` y `pageSize` en los endpoints de listado. |
| **Estado al cierre** | Aceptado como deuda técnica. El endpoint `GET /api/pacientes` implementa búsqueda por texto como mitigación parcial. |

---

## 4. Resumen de Riesgos

### 4.1 Por nivel de exposición

| Nivel de exposición | Cantidad | Riesgos |
|---|---|---|
| Crítico | 2 | R-01, R-04 |
| Alto | 4 | R-02, R-03, R-05, R-07 |
| Medio | 4 | R-06, R-08, R-09, R-11 |
| Bajo | 2 | R-10, R-12 |
| **Total** | **12** | |

### 4.2 Por estado al cierre

| Estado | Cantidad | Riesgos |
|---|---|---|
| Materializado y resuelto | 6 | R-01, R-02, R-03, R-06, R-07, R-04 (parcial) |
| Controlado (no materializado) | 3 | R-05, R-08, R-10 |
| Aceptado (deuda técnica) | 3 | R-09, R-11, R-12 |
| **Total** | **12** | |

### 4.3 Por categoría

| Categoría | Cantidad |
|---|---|
| Integración | 1 |
| Arquitectura de software | 2 |
| Calidad de código | 1 |
| Configuración y despliegue | 1 |
| Seguridad y robustez | 2 |
| Integridad de datos | 2 |
| Mantenibilidad | 1 |
| Rendimiento y escalabilidad | 1 |
| Seguridad y experiencia de usuario | 1 |

---

## 5. Deuda Técnica Identificada

Los riesgos aceptados durante el desarrollo del MVP generan la siguiente deuda técnica, que deberá ser atendida en versiones posteriores del sistema:

| ID | Descripción | Prioridad sugerida |
|---|---|---|
| DT-01 (R-09) | Externalizar la URL base de la API como variable de entorno de React y configurar un dominio con Route 53 | Media |
| DT-02 (R-11) | Envolver las operaciones de registro multi-tabla en transacciones MySQL para garantizar atomicidad | Alta |
| DT-03 (R-12) | Implementar paginación en los endpoints de listado (`/pacientes`, `/citas`, `/medicos`) | Media |
| DT-04 (R-05) | Integrar una librería de validación de esquemas (como `joi` o `zod`) para validar el cuerpo de todas las peticiones de forma centralizada | Alta |

---

## 6. Conclusiones

De los doce riesgos identificados en el proceso de desarrollo, seis se materializaron y fueron resueltos durante el mismo período de desarrollo, tres fueron controlados mediante medidas preventivas y tres fueron aceptados conscientemente como deuda técnica del MVP.

La totalidad de los riesgos de nivel crítico y alto que se materializaron fueron resueltos sin impacto permanente sobre la funcionalidad del sistema. Los riesgos aceptados como deuda técnica no comprometen la operación del sistema en su estado actual, pero deberán ser atendidos antes de escalar el sistema a un entorno de producción con mayor volumen de usuarios y datos.

---
# Documento de Visión del Producto: MediSync

## 1. Introducción
**¿Qué es MediSync?**
MediSync es una plataforma web diseñada para ayudar a clínicas y consultorios médicos a administrar pacientes, citas y expedientes médicos en un solo sistema. La plataforma busca mejorar la organización médica y facilitar el acceso a la información tanto para médicos como para pacientes.

## 2. Audiencia Objetivo
MediSync está dirigido a los siguientes perfiles:
* **Médicos:** Para consulta de expedientes y gestión de consultas.
* **Recepcionistas:** Para la administración de la agenda y atención inicial.
* **Administradores de clínicas:** Para supervisión de métricas y gestión de usuarios.
* **Pacientes:** Para acceso a su propia información y recordatorios.

## 3. Declaración del Problema
Actualmente, muchas clínicas manejan información médica de manera manual o utilizando sistemas fragmentados. Esto provoca:
* Mala organización.
* Pérdida de información crítica.
* Errores en la programación de citas.
* Dificultad para consultar expedientes históricos.
* Retrasos en la atención médica.

**Solución:** MediSync centraliza toda la información en una sola plataforma para facilitar la administración médica integral.

## 4. Funciones Principales
* Registro de pacientes.
* Administración de citas.
* Consulta de historiales médicos.
* Gestión de agendas médicas.
* Subida de estudios y archivos médicos.
* Notificaciones de citas.
* Gestión de usuarios y roles.

## 5. Criterios de Éxito
El proyecto se considerará exitoso si:
1.  Las citas se organizan correctamente y sin traslapes.
2.  Los pacientes pueden consultar su información de forma remota.
3.  Los médicos acceden rápidamente a los expedientes durante la consulta.
4.  La clínica reduce notablemente los errores administrativos.
5.  La plataforma funciona de manera estable y bajo estándares de seguridad.

## 6. Product Backlog Inicial

| ID | Historia de Usuario | Prioridad | Criterios de Aceptación |
| :--- | :--- | :--- | :--- |
| **HU-01** | Registrar pacientes en el sistema | Alta | El sistema debe guardar correctamente la información del paciente. |
| **HU-02** | Buscar historial clínico por nombre o folio | Alta | El sistema debe mostrar el historial correspondiente. |
| **HU-03** | Ver citas previas del paciente | Alta | El paciente debe visualizar sus citas anteriores. |
| **HU-04** | Crear y modificar citas | Alta | El sistema debe permitir editar y guardar citas. |
| **HU-05** | Cancelar citas | Alta | El sistema debe liberar el horario cancelado. |
| **HU-06** | Ver agenda por médico y día | Alta | El sistema debe mostrar citas organizadas. |
| **HU-07** | Configurar duración de citas | Media | El administrador debe definir duración por especialidad. |
| **HU-08** | Enviar recordatorios de citas | Alta | El paciente debe recibir notificaciones antes de la cita. |
| **HU-09** | Generar alertas de cancelación | Media | El sistema debe avisar cuando una cita sea cancelada. |
| **HU-10** | Reasignar horarios cancelados | Media | El sistema debe permitir reutilizar espacios disponibles. |
| **HU-11** | Reprogramar citas | Media | El paciente debe poder cambiar la fecha de su cita. |
| **HU-12** | Ver horarios disponibles | Media | El sistema debe mostrar horarios actualizados. |
| **HU-13** | Consultar historial de citas | Media | El sistema debe mostrar citas pasadas. |
| **HU-14** | Ver tasa de cancelaciones | Media | El sistema debe mostrar métricas de cancelaciones. |
| **HU-15** | Ver métricas de médicos | Media | El sistema debe mostrar citas atendidas por médico. |
| **HU-16** | Ver agenda diaria del médico | Alta | El médico debe visualizar sus citas del día. |
| **HU-17** | Recibir notificaciones de cambios | Media | El paciente debe recibir avisos de cambios o cancelaciones. |
| **HU-18** | Buscar pacientes fácilmente | Alta | El sistema debe permitir búsqueda rápida de pacientes. |
| **HU-19** | Subir estudios al expediente | Alta | El sistema debe almacenar archivos médicos correctamente. |
| **HU-20** | Gestionar roles y permisos | Alta | El sistema debe controlar accesos según el rol. |

## 7. Definición del MVP (Producto Mínimo Viable)

**Historias incluidas en el MVP:**
* **HU-03:** Ver citas previas del paciente.
* **HU-08:** Enviar recordatorios de citas.
* **HU-14:** Ver tasa de cancelaciones.
* **HU-15:** Ver métricas de médicos.
* **HU-19:** Subir estudios al expediente.

**Justificación:**
Estas historias representan las funciones que generan mayor valor inmediato. El MVP permite validar el seguimiento médico, la reducción de inasistencias y la centralización de archivos antes de escalar el sistema.

## 8. Gestión de Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación Aplicada | Responsable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-02** | Conflictos entre rutas del backend | Media | Alto | Reorganización de rutas y revisión de código. | Backend Developer |
| **R-03** | Pérdida de sesión por token inválido | Media | Medio | Validación automática de JWT. | Frontend Developer |
| **R-04** | Datos incompletos en formularios | Alta | Medio | Validaciones en frontend y backend. | FE & BE |
| **R-05** | Duplicidad de usuarios | Media | Medio | Verificación previa de correos electrónicos. | Backend Developer |
| **R-06** | Errores de navegación | Media | Alto | Validación de rutas registradas. | Frontend Developer |
| **R-10** | Retrasos en el MVP | Media | Alto | Enfoque únicamente en funciones esenciales. | Scrum Master |
| **R-11** | Cambios de requerimientos | Media | Alta | Transformar o unificar con historias anteriores. | PO & Scrum |
| **R-12** | Mala organización de objetivos | Media | Alta | Manejo de notaciones propias y seguimiento constante. | Scrum Master |
| **R-13** | Funcionalidades incompletas | Alta | Alta | Revisión constante del trabajo enviado. | Equipo DEV |

## 9. Conclusión
MediSync se posiciona como una solución robusta para la modernización de la administración médica. Al centralizar expedientes y automatizar agendas, no solo optimiza la operación interna de las clínicas, sino que eleva la calidad de la atención al paciente. El enfoque en el MVP asegura una base sólida y funcional para el crecimiento futuro del ecosistema.
