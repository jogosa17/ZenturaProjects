-- Insertar usuario administrador por defecto (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Administrador', 'admin@zentura.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');
