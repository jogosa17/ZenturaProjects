-- Añadir campos DNI y username a la tabla users
ALTER TABLE users 
ADD COLUMN dni VARCHAR(20) NULL AFTER email,
ADD COLUMN username VARCHAR(10) NULL AFTER dni,
ADD INDEX idx_username (username),
ADD INDEX idx_dni (dni);
