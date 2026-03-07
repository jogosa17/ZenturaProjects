-- Actualizar usuarios existentes para que tengan username temporal
UPDATE users SET username = CONCAT('user', id) WHERE username IS NULL;
