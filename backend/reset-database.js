require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

async function resetDatabase() {
  try {
    // Conectar sin especificar base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('🔄 Reseteando base de datos:', process.env.DB_NAME);

    // Eliminar base de datos si existe
    await connection.execute(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\``);
    console.log('🗑️  Base de datos eliminada');

    // Crear base de datos nueva
    await connection.execute(`CREATE DATABASE \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Base de datos creada');

    await connection.end();
    console.log('🎉 Base de datos reseteada exitosamente');
    
  } catch (error) {
    console.error('❌ Error reseteando base de datos:', error);
    process.exit(1);
  }
}

resetDatabase();
