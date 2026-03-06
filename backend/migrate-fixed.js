require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Orden correcto de migraciones para evitar problemas de claves foráneas
const migrationOrder = [
    '01_create_users_table_fixed.sql',
    '02_create_clients_table.sql',
    '03_create_projects_table.sql',
    '05_create_zones_table.sql',
    '06_create_tasks_table.sql',
    '10_create_consultas_table.sql',
    '11_create_consultas_replies_table.sql',
    '12_create_notifications_table.sql',
    '04_create_project_workers_table.sql',
    '07_create_task_notes_table.sql',
    '08_create_files_table.sql',
    '09_create_file_tags_table.sql'
];

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

    console.log('🔄 Ejecutando migraciones en orden correcto...');

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

    await connection.end();
    console.log('🎉 Migraciones completadas');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations();
