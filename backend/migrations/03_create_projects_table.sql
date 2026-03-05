-- Crear tabla projects
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
