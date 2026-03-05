-- Crear tabla consultas_replies
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
