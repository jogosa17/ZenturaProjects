# Esquema de Base de Datos - Zentura Projects

## Relaciones entre tablas

```
users (administrativos, trabajadores)
├── project_workers (relación muchos a muchos)
│   └── projects
│       ├── zones
│       │   └── tasks
│       ├── files
│       ├── consultas
│       │   └── consultas_replies
│       └── notifications
├── clients
│   └── projects
└── files (archivos generales)
    └── file_tags
```

## Tablas

### 1. users
- id (PK)
- name
- email (unique)
- password (hash)
- role (admin/worker)
- status (active/inactive)
- created_at
- updated_at

### 2. clients
- id (PK)
- name
- phone
- created_at
- updated_at

### 3. projects
- id (PK)
- name
- client_id (FK)
- location
- phone
- contact_person (opcional)
- contact_phone
- comments
- priority (urgent/high/low)
- status (started/cancelled/accepted/finished/paid)
- start_date (opcional)
- end_date (opcional)
- is_urgent (boolean)
- created_at
- updated_at

### 4. project_workers (tabla pivote)
- project_id (FK)
- worker_id (FK)
- assigned_at

### 5. zones
- id (PK)
- project_id (FK)
- name
- created_at
- updated_at

### 6. tasks
- id (PK)
- name
- description
- status (pending/in_progress/finished)
- priority (urgent/high/low)
- price (decimal)
- zone_id (FK)
- project_id (FK)
- created_at
-  kTEXT
- creaatd_ad_at
upd
### 8. files
- id7(PK)
- filename
- original_name
- file_path
- file_size
- mime_type
- project_id (FK, nullable)
- task_id (FK, nullable)
- consulta_id (FK, nullable)
- uploaded_by (FK users.id)
- created_at

### 9. file_tags
- id (PK)
- file_id (FK)
- tag_name
- created_at

### 10. consultas
- id (PK)
- project_id (FK)
- user_id (FK)
- message
- created_at
- updated_at

### 11. consultas_replies
- id (PK)
- consulta_id (FK)
- user_id (FK)
- message
- reply_to_id (FK, nullable - para respuestas anidadas)
- created_at

### 12. notifications
- id (PK)
- user_id (FK)
- project_id (FK)
- type
- message
- is_read (boolean)
- created_at
