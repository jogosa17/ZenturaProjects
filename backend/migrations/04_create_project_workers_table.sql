-- Crear tabla project_workers (tabla pivote)
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
