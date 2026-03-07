require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixPassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔧 Actualizando contraseña del usuario admin...');

    // Generar nuevo hash para "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log(`🔐 Nuevo hash: ${hashedPassword.substring(0, 20)}...`);

    // Actualizar contraseña en la base de datos
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@zentura.com']
    );

    console.log('✅ Contraseña actualizada correctamente');

    // Verificar el cambio
    const [user] = await connection.execute(
      'SELECT password FROM users WHERE email = ?',
      ['admin@zentura.com']
    );
    
    // Verificar que la nueva contraseña funciona
    const isValidPassword = await bcrypt.compare('admin123', user[0].password);
    console.log(`🔍 Verificación: ${isValidPassword ? '✅ Correcta' : '❌ Incorrecta'}`);

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixPassword();
