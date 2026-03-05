-- Crear tabla tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'finished') NOT NULL DEFAULT 'pending',
    priority ENUM('urgent', 'high', 'low') NOT NULL DEFAULT 'low',
    price DECIMAL(10, 2) DEFAULT 0.00,
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
