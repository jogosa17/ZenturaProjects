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

* [ ] Implementar login
* [ ] Implementar hash de contraseñas
* [ ] Implementar JWT
* [ ] Crear middleware de autenticación
* [ ] Crear middleware de roles
* [ ] Crear endpoint de login
* [ ] Crear endpoint de validación de token
* [ ] Crear pantalla de login en frontend

---

# Fase 4 — Gestión de usuarios

* [ ] Endpoint para crear trabajadores
* [ ] Endpoint para crear administradores
* [ ] Endpoint para editar usuarios
* [ ] Endpoint para activar o desactivar usuarios
* [ ] Endpoint para listar trabajadores
* [ ] Crear vista de tabla de trabajadores
* [ ] Mostrar ID
* [ ] Mostrar nombre
* [ ] Mostrar estado
* [ ] Mostrar proyectos asociados

---

# Fase 5 — Gestión de clientes

* [ ] Endpoint para crear cliente
* [ ] Endpoint para editar cliente
* [ ] Endpoint para listar clientes
* [ ] Endpoint para ver proyectos de un cliente
* [ ] Crear vista de clientes
* [ ] Añadir botón de llamada

---

# Fase 6 — Gestión de proyectos

* [ ] Endpoint para crear proyecto
* [ ] Endpoint para editar proyecto
* [ ] Endpoint para eliminar proyecto
* [ ] Endpoint para listar proyectos
* [ ] Asignar trabajadores a proyecto
* [ ] Definir prioridad del proyecto
* [ ] Definir estado del proyecto
* [ ] Configurar fechas de inicio y fin
* [ ] Crear vista de proyectos
* [ ] Crear vista de detalle de proyecto

---

# Fase 7 — Sistema de zonas

* [ ] Endpoint para crear zonas
* [ ] Endpoint para editar zonas
* [ ] Endpoint para eliminar zonas
* [ ] Endpoint para listar zonas por proyecto
* [ ] Crear interfaz de gestión de zonas

---

# Fase 8 — Sistema de tareas

* [ ] Endpoint para crear tareas
* [ ] Endpoint para editar tareas
* [ ] Endpoint para eliminar tareas
* [ ] Endpoint para listar tareas por zona
* [ ] Cambiar estado de tarea
* [ ] Cambiar prioridad de tarea
* [ ] Añadir precio a tareas
* [ ] Crear interfaz de tareas

---

# Fase 9 — Cálculo dinámico del presupuesto

* [ ] Sumar precios de tareas
* [ ] Calcular presupuesto total del proyecto
* [ ] Actualizar presupuesto automáticamente
* [ ] Mostrar presupuesto en la vista del proyecto

---

# Fase 10 — Sistema de archivos

* [ ] Endpoint para subir archivos a proyectos
* [ ] Endpoint para subir archivos a tareas
* [ ] Endpoint para subir archivos a consultas
* [ ] Guardar archivos en servidor
* [ ] Crear sistema de etiquetas
* [ ] Implementar autocompletado de etiquetas
* [ ] Crear vista de archivos

---

# Fase 11 — Presupuesto y factura

* [ ] Endpoint para subir presupuesto
* [ ] Endpoint para descargar presupuesto
* [ ] Endpoint para subir factura
* [ ] Endpoint para descargar factura
* [ ] Crear botones en interfaz de proyecto

---

# Fase 12 — Notas de tareas

* [ ] Endpoint para crear notas
* [ ] Endpoint para listar notas
* [ ] Permitir subir archivos en notas
* [ ] Crear historial de actividad de tareas
* [ ] Crear interfaz de notas

---

# Fase 13 — Chat del proyecto (Consultas)

* [ ] Endpoint para enviar mensajes
* [ ] Endpoint para listar mensajes
* [ ] Endpoint para responder mensajes
* [ ] Permitir subir archivos en chat
* [ ] Crear interfaz de chat

---

# Fase 14 — Sistema de notificaciones

* [ ] Crear sistema de notificaciones
* [ ] Notificación al crear tarea
* [ ] Notificación al actualizar tarea
* [ ] Notificación al finalizar tarea
* [ ] Notificación al subir archivos
* [ ] Notificación en chat
* [ ] Notificaciones de fechas de proyecto
* [ ] Crear panel de notificaciones

---

# Fase 15 — Agenda

* [ ] Crear vista de agenda
* [ ] Mostrar fechas de inicio de proyectos
* [ ] Mostrar fechas de fin de proyectos
* [ ] Abrir proyecto desde agenda

---

# Fase 16 — Dashboard

* [ ] Crear dashboard administrativo
* [ ] Mostrar estadísticas
* [ ] Mostrar actividad reciente
* [ ] Mostrar últimas notificaciones

---

# Fase 17 — Buscador global

* [ ] Crear API de búsqueda
* [ ] Buscar proyectos
* [ ] Buscar tareas
* [ ] Buscar clientes
* [ ] Buscar archivos
* [ ] Buscar zonas
* [ ] Crear interfaz de buscador

---

# Fase 18 — Optimización final

* [ ] Mejorar rendimiento
* [ ] Manejo de errores
* [ ] Mejoras de interfaz
* [ ] Pruebas del sistema
* [ ] Preparar entorno de producción
