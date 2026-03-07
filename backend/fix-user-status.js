require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixUserStatus() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Actualizando status del usuario admin a 1 (activo)...');
    
    // Actualizar status del usuario admin a 1
    await connection.execute(
      'UPDATE users SET status = 1 WHERE email = ?',
      ['admin@zentura.com']
    );
    
    // Verificar el cambio
    const [user] = await connection.execute(
      'SELECT status FROM users WHERE email = ?',
      ['admin@zentura.com']
    );
    
    console.log(`✅ Status actualizado: ${user[0].status}`);
    console.log('✅ Usuario admin ahora está activo (1)');

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixUserStatus();
