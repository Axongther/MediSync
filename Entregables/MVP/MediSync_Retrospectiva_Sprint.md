# MediSync — Retrospectiva del Sprint
## Scrum Master: Nicolás Olvera

**Proyecto:** MediSync — Plataforma de Gestión Médica Digital  
**Sprint:** Sprint 1 (MVP)  
**Fecha:** 7 de mayo de 2026  
**Equipo:** Nicolás Olvera (SM + Fullstack), Alan (Arquitecto), Alejandro y Jair (Fullstack + PO)

---

## ¿Qué salió bien?

**Infraestructura AWS sólida desde el inicio.** La VPC, EC2, RDS, S3, Lambda y los Security Groups se desplegaron correctamente y sin errores. La separación entre subnets públicas y privadas funcionó como se diseñó, con la base de datos aislada y solo accesible desde la EC2.

**Arquitectura modular bien definida.** La decisión de usar un monolito modular con la estructura routes → controller → service demostró ser acertada. Cada módulo se pudo desarrollar y probar de forma independiente sin afectar a los demás. Al final se lograron implementar los 10 módulos del backend: auth, pacientes, médicos, citas, expedientes, notificaciones, calificaciones, dashboard, slots y usuarios.

**API funcional y probada.** Todos los endpoints fueron probados en Postman siguiendo el flujo completo del negocio: registrar usuario → crear médico → configurar horarios → crear paciente → consultar slots disponibles → agendar cita → completar cita → crear expediente → calificar médico → ver dashboard. Todo funcionó correctamente.

**Despliegue exitoso en AWS.** El backend se desplegó en EC2 con nginx como proxy inverso y pm2 como gestor de procesos. El frontend se compiló y se subió a S3 como sitio estático. Ambos componentes se comunican correctamente a través de la IP pública.

**Base de datos bien diseñada.** El modelo de 10 tablas cubre todos los requerimientos funcionales, incluyendo las features prometidas (calificación de doctores y métricas de cancelación). Las relaciones entre tablas están documentadas y justificadas.

**Features prometidas implementadas.** Se cumplieron las tres features adicionales: calificar doctores (tabla `doctor_ratings`), registrar cancelaciones con motivo (tabla `cancellation_log`), y métricas de cancelación en el dashboard (endpoint `/api/dashboard/cancelaciones`).

---

## ¿Qué se debe mejorar?

**Falta de iniciativa del equipo.** Hubo momentos en los que el equipo esperó demasiado para arrancar tareas o tomar decisiones. Se dependió mucho de que alguien tomara la iniciativa en lugar de que cada integrante asumiera responsabilidad sobre sus entregables de forma proactiva. Esto generó cuellos de botella innecesarios.

**No trabajar a las carreras.** Parte del desarrollo se hizo bajo presión de tiempo por no haber empezado con suficiente anticipación. Esto llevó a sesiones de trabajo extensas y decisiones apresuradas que podrían haberse evitado con mejor planificación del tiempo. El profesor lo advirtió: invertir el 80% del tiempo de la primera entrega en pensar y documentar, no en programar.

**Planificar antes de codear.** En la primera iteración se intentó escribir código sin tener clara la estructura del proyecto ni el modelo de datos. Después se tuvo que parar, diseñar el esquema de base de datos, definir el scaffolding y justificar las decisiones antes de continuar. Esto validó la recomendación del profesor pero costó tiempo.

**Pruebas más tempranas.** Las pruebas en Postman se hicieron módulo por módulo, lo cual fue positivo, pero se pudieron haber definido los casos de prueba desde el principio como parte de la planificación.

**Coordinación entre frontend y backend.** Al momento de desplegar, el frontend seguía apuntando a `localhost` en vez de la IP de producción. Este tipo de detalles se deben revisar en un checklist de despliegue antes de subir a AWS.

---

## Impedimentos

**Comunicación para prender el laboratorio.** Para trabajar con la infraestructura en AWS es necesario que el laboratorio esté encendido. Coordinar con el responsable para que el lab esté disponible cuando el equipo necesita trabajar generó retrasos. No siempre se pudo trabajar en el momento que se necesitaba porque el lab estaba apagado.

**Incompatibilidad de versiones en EC2.** La instancia EC2 corre Amazon Linux 2 con glibc 2.26, lo cual impidió instalar Node.js 18 directamente. Se tuvo que usar `nvm` para instalar Node.js 16 como alternativa. Esto no estaba previsto y consumió tiempo de depuración.

**Archivos vacíos en el scaffolding.** Al crear la estructura inicial del proyecto, los archivos se generaron vacíos (solo estructura de carpetas). Esto causó confusión al momento de instalar dependencias porque los `package.json` estaban sin contenido. Se tuvo que crear manualmente el contenido de cada archivo.

**Caché del navegador.** Al actualizar la URL del API en el frontend y subir el nuevo build a S3, el navegador seguía mostrando la versión anterior por caché. Se resolvió con `Ctrl+Shift+R` pero generó confusión temporal al pensar que los cambios no se habían aplicado.

**Falta de MySQL en ambiente local.** No se tenía MySQL instalado en la máquina de desarrollo. Se tuvo que instalar y configurar antes de poder probar el backend localmente.

---

## Acciones para el siguiente sprint

| Acción | Responsable |
|--------|------------|
| Cada integrante arranca sus tareas sin esperar a que otro tome la iniciativa | Todo el equipo |
| Establecer horarios fijos de trabajo en equipo para evitar sesiones a las carreras | Scrum Master |
| Coordinar con anticipación los horarios del laboratorio para tener AWS disponible | Scrum Master |
| Crear un checklist de despliegue (cambiar URLs, verificar .env, limpiar caché) | Arquitecto |
| Definir casos de prueba antes de codificar cada módulo | Desarrolladores |
| Hacer commits frecuentes con archivos completos, no vacíos | Todo el equipo |

---

*Documento elaborado por el Scrum Master — Proyecto MediSync, Universidad Tecmilenio, 2026.*
