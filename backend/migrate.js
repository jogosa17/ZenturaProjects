const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');

// Orden correcto de migraciones
const migrationOrder = [
    'complete_schema.sql'
];

async function runMigrations() {
  try {
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zentura_projects',
      multipleStatements: true
    });

    console.log('🔄 Ejecutando migraciones finales...');

    for (const file of migrationOrder) {
      console.log(`📄 Ejecutando: ${file}`);
      const filePath = path.join(__dirname, 'migrations', file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${file}`);
        continue;
      }
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await connection.query(sql);
        console.log(`✅ ${file} ejecutado correctamente`);
      } catch (error) {
        console.log(`⚠️  ${file} error:`, error.message);
      }
    }

    // Verificar tablas creadas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Tablas creadas:');
    tables.forEach(table => {
      console.log(`  ✅ ${Object.values(table)[0]}`);
    });

    await connection.end();
    console.log('\n🎉 Migraciones completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations();
