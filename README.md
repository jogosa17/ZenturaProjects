# Zentura Projects

## Descripción general

**Zentura Projects** es una aplicación web y móvil diseñada para la gestión de proyectos y tareas en una empresa de reformas o construcción.

La aplicación centraliza:

* Gestión de proyectos
* Gestión de tareas
* Organización por zonas de obra
* Gestión de archivos
* Comunicación interna
* Notificaciones
* Cálculo automático de presupuestos
* Gestión de clientes

El objetivo es que **administrativos y trabajadores puedan colaborar en tiempo real desde una misma plataforma**, sin depender de aplicaciones externas.

---

# Tecnologías del proyecto

## Frontend

* React
* Expo
* Diseño responsive
* Una sola base de código para **web y móvil**

El frontend estará contenido en **una única carpeta**, compartiendo código para web y dispositivos móviles.

---

## Backend

* Node.js
* Express.js
* API REST

El backend gestionará:

* autenticación
* lógica de negocio
* notificaciones
* subida de archivos
* conexión con la base de datos

---

## Base de datos

Se utilizará:

MySQL

---

## Almacenamiento de archivos

Los archivos se guardarán **en el servidor**, no en la base de datos.

Ejemplo de estructura:

```
/uploads
    /project_1
        presupuesto.pdf
        factura.pdf
        /files
        /tasks
        /consultas
```

---

# Tipos de usuario

Existen **dos tipos de usuario**.

## Administrativo

Los administradores tienen control completo del sistema.

Pueden:

* Crear proyectos
* Editar proyectos
* Crear tareas
* Editar tareas
* Eliminar tareas
* Añadir precio a las tareas
* Subir archivos
* Añadir notas a tareas
* Marcar tareas como finalizadas
* Ver estadísticas
* Acceder al dashboard
* Crear trabajadores
* Crear administradores
* Ver tabla de trabajadores
* Ver todos los proyectos
* Recibir notificaciones de todos los proyectos

Los administrativos se consideran **miembros de todos los proyectos automáticamente**.

---

## Trabajador

Los trabajadores tienen acceso limitado.

Pueden:

* Ver proyectos a los que están asignados
* Crear tareas
* Marcar tareas como finalizadas
* Subir archivos
* Añadir notas a tareas
* Participar en el chat del proyecto (Consultas)
* Crear clientes
* Editar clientes

Los trabajadores **solo ven los proyectos a los que están asociados**.

---

# Clientes

Los clientes están vinculados a proyectos.

Campos:

* Nombre
* Teléfono

Un cliente puede tener múltiples proyectos.

Tanto trabajadores como administrativos pueden:

* Crear clientes
* Editar clientes
* Ver información de clientes

Los clientes incluyen **botón para llamar directamente**.

---

# Proyectos

Los proyectos son el elemento central del sistema.

Campos:

* Nombre
* Cliente
* Ubicación
* Teléfono
* Persona de contacto (opcional)
* Teléfono de la persona de contacto
* Comentarios
* Prioridad
* Estado
* Fecha inicio
* Fecha fin
* Indicador de urgente

---

## Estados del proyecto

* Iniciado
* Cancelado
* Aceptado
* Finalizado
* Cobrado

---

## Prioridad del proyecto

* Urgente
* Alta
* Baja

---

# Fechas del proyecto

Los proyectos pueden tener:

* Fecha inicio
* Fecha fin

Estos campos son opcionales.

---

## Notificaciones por fechas

Si existen fechas se enviarán notificaciones automáticamente.

Fecha inicio:

* 7 días antes
* 2 días antes

Fecha fin:

* 7 días antes
* 2 días antes

Las notificaciones se enviarán a las **09:00 de la mañana**.

---

# Agenda

La aplicación tendrá una sección llamada **Agenda**.

Funciones:

* Mostrar fechas de inicio y fin de proyectos
* Al pulsar un proyecto se abrirá directamente

---

# Zonas de obra

Cada proyecto puede tener **zonas de obra**.

Ejemplo:

Proyecto: Reforma piso

Zonas:

* Cocina
* Baño
* Salón
* Habitación
* Terraza

Las zonas sirven para **organizar las tareas**.

---

# Tareas

Las tareas pertenecen a una zona dentro de un proyecto.

Relación:

Proyecto → Zona → Tarea

Las tareas **no se asignan a trabajadores**.

---

## Campos de tarea

* Nombre
* Descripción
* Estado
* Prioridad
* Precio
* Zona
* Proyecto

---

## Estado de tareas

* Pendiente
* En curso
* Finalizada

---

## Prioridad de tareas

* Urgente
* Alta
* Baja

---

# Presupuesto del proyecto

Cada tarea puede tener un precio.

El sistema calcula automáticamente el presupuesto del proyecto.

Presupuesto del proyecto = suma de precios de todas las tareas.

El cálculo es **dinámico**.

---

# Notas de tareas (historial)

Las tareas tendrán un sistema de **historial de notas**.

Cada nota incluye:

* Usuario
* Fecha
* Texto
* Archivos o imágenes

Permite registrar la evolución de la tarea.

---

# Archivos

Se pueden subir archivos en:

* Proyectos
* Tareas
* Chat del proyecto (Consultas)

Tipos permitidos:

* Imágenes
* Vídeos
* Documentos

---

# Etiquetas de archivos

Los archivos pueden tener **etiquetas con autocompletado**.

Ejemplo de etiquetas:

* antes
* después
* material
* factura
* plano

Si el usuario escribe:

```
an
```

El sistema sugerirá:

```
antes
```

---

# Presupuesto y factura

Cada proyecto tendrá dos secciones especiales.

## Presupuesto

Botones:

* Subir presupuesto
* Descargar presupuesto

---

## Factura

Botones:

* Subir factura
* Descargar factura

Solo habrá **un presupuesto y una factura por proyecto**.

Si se sube uno nuevo reemplaza al anterior.

---

# Chat del proyecto (Consultas)

Cada proyecto tendrá una pestaña llamada **Consultas**.

Permite:

* Enviar mensajes
* Subir archivos
* Responder a mensajes concretos

Sirve como sistema de comunicación interno entre trabajadores y administrativos.

---

# Notificaciones

Las notificaciones se generan cuando ocurre algún evento relevante.

Ejemplos:

* Creación de tareas
* Edición de tareas
* Tareas finalizadas
* Archivos subidos
* Mensajes en chat
* Recordatorios de fechas

Las notificaciones están vinculadas a:

* Usuario
* Proyecto

El sistema tendrá **notificaciones en tiempo real con recarga periódica**.

---

# Event Listener

Cuando un trabajador marca una tarea como finalizada:

Un listener detecta la actualización y envía notificación a los administradores.

---

# Tabla de trabajadores

Los administradores pueden ver una tabla con:

* ID
* Nombre
* Estado (Activo / Inactivo)
* Proyectos asociados

---

# Dashboard

Los administradores tendrán un dashboard con:

* Estadísticas
* Últimas actualizaciones
* Actividad reciente

---

# Buscador global

La aplicación tendrá un buscador global que permitirá buscar:

* Proyectos
* Tareas
* Clientes
* Archivos
* Zonas

---

# Botones de llamada

Habrá botones de llamada en:

Clientes
Proyectos

En dispositivos móviles se usará:

tel:+34600000000

---

# Eliminaciones

Las eliminaciones serán **permanentes**.

Eliminar:

* tareas
* archivos
* proyectos

borra los datos de la base de datos y los archivos del servidor.
