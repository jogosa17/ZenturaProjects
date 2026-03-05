-- Crear tabla file_tags
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
