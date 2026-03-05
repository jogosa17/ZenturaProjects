-- Script completo para crear todas las tablas de Zentura Projects
-- Ejecutar en orden para mantener las relaciones de integridad referencial

-- Importar y ejecutar todas las migraciones en orden
SOURCE 01_create_users_table.sql;
SOURCE 02_create_clients_table.sql;
SOURCE 03_create_projects_table.sql;
SOURCE 04_create_project_workers_table.sql;
SOURCE 05_create_zones_table.sql;
SOURCE 06_create_tasks_table.sql;
SOURCE 07_create_task_notes_table.sql;
SOURCE 08_create_files_table.sql;
SOURCE 09_create_file_tags_table.sql;
SOURCE 10_create_consultas_table.sql;
SOURCE 11_create_consultas_replies_table.sql;
SOURCE 12_create_notifications_table.sql;

-- Confirmación de creación
SELECT 'Todas las tablas han sido creadas exitosamente' AS message;
