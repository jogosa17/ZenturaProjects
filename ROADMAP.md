# Roadmap de Desarrollo — Zentura Projects

Este roadmap define el orden recomendado para desarrollar **Zentura Projects**.
Cada tarea puede marcarse como completada usando los **checkboxes**.

---

# Fase 1 — Configuración inicial del proyecto

* [x] Crear repositorio Git
* [x] Configurar `.gitignore`
* [x] Crear estructura inicial de carpetas
* [x] Configurar backend con Node.js
* [x] Instalar Express
* [x] Configurar servidor básico
* [x] Configurar conexión a MySQL
* [x] Crear archivo `.env`
* [x] Configurar frontend con React
* [x] Configurar Expo
* [x] Verificar funcionamiento de frontend y backend

---

# Fase 2 — Arquitectura de base de datos

* [x] Diseñar modelo de base de datos
* [x] Crear tabla `users`
* [x] Crear tabla `clients`
* [x] Crear tabla `projects`
* [x] Crear tabla `project_workers`
* [x] Crear tabla `zones`
* [x] Crear tabla `tasks`
* [x] Crear tabla `task_notes`
* [x] Crear tabla `files`
* [x] Crear tabla `file_tags`
* [x] Crear tabla `consultas`
* [x] Crear tabla `consultas_replies`
* [x] Crear tabla `notifications`
* [x] Crear migraciones SQL

---

# Fase 3 — Sistema de autenticación

* [x] Implementar login
* [x] Implementar hash de contraseñas
* [x] Implementar JWT
* [x] Crear middleware de autenticación
* [x] Crear middleware de roles
* [x] Crear endpoint de login
* [x] Crear endpoint de validación de token
* [x] Crear pantalla de login en frontend

---

# Fase 4 — Gestión de usuarios

* [x] Endpoint para crear trabajadores
* [x] Endpoint para crear administradores
* [x] Endpoint para editar usuarios
* [x] Endpoint para activar o desactivar usuarios
* [x] Endpoint para listar trabajadores
* [x] Crear vista de tabla de trabajadores
* [x] Mostrar ID
* [x] Mostrar nombre
* [x] Mostrar estado
* [x] Mostrar proyectos asociados

---

# Fase 5 — Gestión de clientes

* [x] Endpoint para crear cliente
* [x] Endpoint para editar cliente
* [x] Endpoint para listar clientes
* [x] Endpoint para ver proyectos de un cliente
* [x] Crear vista de clientes
* [x] Añadir botón de llamada

---

# Fase 6 — Gestión de proyectos

* [x] Endpoint para crear proyecto
* [x] Endpoint para editar proyecto
* [x] Endpoint para eliminar proyecto
* [x] Endpoint para listar proyectos
* [x] Asignar trabajadores a proyecto (Backend implementado)
* [x] Definir prioridad del proyecto
* [x] Definir estado del proyecto
* [x] Configurar fechas de inicio y fin
* [x] Crear vista de proyectos
* [x] Crear vista de detalle de proyecto

---

# Fase 7 — Sistema de zonas

* [x] Endpoint para crear zonas
* [x] Endpoint para editar zonas
* [x] Endpoint para eliminar zonas
* [x] Endpoint para listar zonas por proyecto
* [x] Crear interfaz de gestión de zonas

---

# Fase 8 — Sistema de tareas

* [x] Endpoint para crear tareas
* [x] Endpoint para editar tareas
* [x] Endpoint para eliminar tareas
* [x] Endpoint para listar tareas por zona
* [x] Cambiar estado de tarea
* [x] Cambiar prioridad de tarea
* [x] Añadir precio a tareas
* [x] Crear interfaz de tareas

---

# Fase 9 — Cálculo dinámico del presupuesto

* [x] Sumar precios de tareas
* [x] Calcular presupuesto total del proyecto
* [x] Actualizar presupuesto automáticamente
* [x] Mostrar presupuesto en la vista del proyecto

---

# Fase 10 — Sistema de archivos

* [x] Endpoint para subir archivos a proyectos
* [x] Endpoint para subir archivos a tareas
* [x] Endpoint para subir archivos a consultas
* [x] Guardar archivos en servidor
* [x] Crear sistema de etiquetas
* [x] Implementar autocompletado de etiquetas
* [x] Crear vista de archivos

---

# Fase 11 — Presupuesto y factura

* [x] Endpoint para subir presupuesto
* [x] Endpoint para descargar presupuesto (Vía URL directa)
* [x] Endpoint para subir factura
* [x] Endpoint para descargar factura (Vía URL directa)
* [x] Crear botones en interfaz de proyecto

---

# Fase 12 — Notas de tareas

* [x] Endpoint para crear notas
* [x] Endpoint para listar notas
* [x] Permitir subir archivos en notas (Backend preparado con migración 19)
* [x] Crear historial de actividad de tareas (Tabla task_notes sirve para esto)
* [x] Crear interfaz de notas

---

# Fase 13 — Chat del proyecto (Consultas)

* [x] Endpoint para enviar mensajes
* [x] Endpoint para listar mensajes
* [x] Endpoint para responder mensajes
* [x] Permitir subir archivos en chat (Backend preparado)
* [x] Crear interfaz de chat

---

# Fase 14 — Sistema de notificaciones

* [x] Crear sistema de notificaciones
* [x] Notificación al crear tarea
* [x] Notificación al actualizar tarea
* [x] Notificación al finalizar tarea
* [x] Notificación al subir archivos
* [x] Notificación en chat
* [x] Notificaciones de fechas de proyecto (Requiere cron job o check periódico)
* [x] Crear panel de notificaciones

---

# Fase 15 — Agenda

* [x] Crear vista de agenda
* [x] Mostrar fechas de inicio de proyectos
* [x] Mostrar fechas de fin de proyectos
* [x] Abrir proyecto desde agenda

---

# Fase 16 — Dashboard

* [x] Crear dashboard administrativo
* [x] Mostrar estadísticas
* [x] Mostrar actividad reciente
* [x] Mostrar últimas notificaciones

---

# Fase 17 — Buscador global

* [x] Crear API de búsqueda
* [x] Buscar proyectos
* [x] Buscar tareas
* [x] Buscar clientes
* [x] Buscar archivos
* [x] Buscar zonas
* [x] Crear interfaz de buscador

---

# Fase 18 — Optimización final

* [ ] Mejorar rendimiento
* [ ] Manejo de errores
* [ ] Mejoras de interfaz
* [ ] Pruebas del sistema
* [ ] Preparar entorno de producción