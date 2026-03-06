-- 01_users_simple.sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'worker') NOT NULL DEFAULT 'worker',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 02_create_clients_table.sql
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_name (name),
    INDEX idx_client_phone (phone)
);

-- 03_create_projects_table.sql
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_id INT NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(50),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    comments TEXT,
    priority ENUM('urgent', 'high', 'low') NOT NULL DEFAULT 'low',
    status ENUM('started', 'cancelled', 'accepted', 'finished', 'paid') NOT NULL DEFAULT 'started',
    start_date DATE,
    end_date DATE,
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_project_name (name),
    INDEX idx_project_status (status),
    INDEX idx_project_priority (priority),
    INDEX idx_project_dates (start_date, end_date),
    INDEX idx_project_client (client_id)
);

-- 04_create_project_workers_table.sql
CREATE TABLE IF NOT EXISTS project_workers (
    project_id INT NOT NULL,
    worker_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, worker_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_workers_project (project_id),
    INDEX idx_project_workers_worker (worker_id)
);

-- 05_create_zones_table.sql
CREATE TABLE IF NOT EXISTS zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_zone_project (project_id),
    INDEX idx_zone_name (name)
);

-- 06_create_tasks_table.sql
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'finished') NOT NULL DEFAULT 'pending',
    priority TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0: Sin prioridad, 1: Media, 2: Urgente',
    price DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT DEFAULT NULL,
    zone_id INT NOT NULL,
    project_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_task_name (name),
    INDEX idx_task_status (status),
    INDEX idx_task_priority (priority),
    INDEX idx_task_zone (zone_id),
    INDEX idx_task_project (project_id)
);

-- 10_create_consultas_table.sql
CREATE TABLE IF NOT EXISTS consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_consultas_project (project_id),
    INDEX idx_consultas_user (user_id),
    INDEX idx_consultas_created (created_at)
);

-- 11_create_consultas_replies_table.sql
CREATE TABLE IF NOT EXISTS consultas_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consulta_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    reply_to_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consulta_id) REFERENCES consultas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES consultas_replies(id) ON DELETE SET NULL,
    INDEX idx_consultas_replies_consulta (consulta_id),
    INDEX idx_consultas_replies_user (user_id),
    INDEX idx_consultas_replies_reply_to (reply_to_id),
    INDEX idx_consultas_replies_created (created_at)
);

-- 12_create_notifications_table.sql
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NULL,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_project (project_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at)
);

-- 08_create_files_table.sql
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    project_id INT NULL,
    task_id INT NULL,
    consulta_id INT NULL,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_files_project (project_id),
    INDEX idx_files_task (task_id),
    INDEX idx_files_consulta (consulta_id),
    INDEX idx_files_uploaded_by (uploaded_by),
    INDEX idx_files_filename (filename),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (consulta_id) REFERENCES consultas(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 09_create_file_tags_table.sql
CREATE TABLE IF NOT EXISTS file_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    INDEX idx_file_tags_file (file_id),
    INDEX idx_file_tags_name (tag_name),
    UNIQUE KEY unique_file_tag (file_id, tag_name)
);

-- 13_insert_admin_user.sql
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Administrador', 'admin@zentura.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

-- 14_update_status_and_priority_to_tinyint.sql
-- Actualizar tabla users: cambiar status a TINYINT
UPDATE users SET status = CASE 
    WHEN status = 'active' THEN 1 
    ELSE 0 
END;

ALTER TABLE users 
MODIFY COLUMN status TINYINT(1) NOT NULL DEFAULT 1 COMMENT '0: Desactivado, 1: Activado';

-- Actualizar tabla tasks: cambiar priority a TINYINT
UPDATE tasks SET priority = CASE 
    WHEN priority = 'urgent' THEN 2 
    WHEN priority = 'high' THEN 1 
    ELSE 0 
END;

ALTER TABLE tasks 
MODIFY COLUMN priority TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0: Sin prioridad, 1: Media, 2: Urgente';

-- 15_add_indexes_optimization.sql
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_zone_status ON tasks(zone_id, status);
CREATE INDEX idx_consultas_project_date ON consultas(project_id, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- 17_add_budget_and_invoice_to_projects.sql
ALTER TABLE projects
ADD COLUMN budget_file_id INT NULL,
ADD COLUMN invoice_file_id INT NULL,
ADD CONSTRAINT fk_projects_budget_file FOREIGN KEY (budget_file_id) REFERENCES files(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_projects_invoice_file FOREIGN KEY (invoice_file_id) REFERENCES files(id) ON DELETE SET NULL;

CREATE INDEX idx_projects_budget_file ON projects(budget_file_id);
CREATE INDEX idx_projects_invoice_file ON projects(invoice_file_id);

-- 18_create_task_notes_table.sql
CREATE TABLE IF NOT EXISTS task_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_notes_task (task_id),
    INDEX idx_task_notes_user (user_id)
);

-- 19_add_note_id_to_files.sql
ALTER TABLE files
ADD COLUMN note_id INT NULL,
ADD CONSTRAINT fk_files_note FOREIGN KEY (note_id) REFERENCES task_notes(id) ON DELETE CASCADE;

CREATE INDEX idx_files_note ON files(note_id);
