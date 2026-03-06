require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Verificar que las variables de entorno se cargaron correctamente
console.log('🔍 Configuración cargada:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

async function runMigrations() {
  try {
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔄 Ejecutando migraciones en la base de datos:', process.env.DB_NAME);

    // Leer y ejecutar cada archivo de migración
    const migrationsPath = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql') && file !== 'create_all_tables.sql')
      .sort();

    for (const file of migrationFiles) {
      console.log(`📄 Ejecutando: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
      
      try {
        await connection.query(sql);
        console.log(`✅ ${file} ejecutado correctamente`);
      } catch (error) {
        console.log(`⚠️  ${file} ya existe o tiene errores:`, error.message);
      }
    }

    await connection.end();
    console.log('🎉 Migraciones completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations();
