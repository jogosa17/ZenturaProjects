require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkProjectsTasks() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Verificando estructura de tablas projects y tasks...');
    
    // Verificar estructura de projects
    console.log('\n📋 Estructura de tabla projects:');
    const [projectsColumns] = await connection.execute('DESCRIBE projects');
    projectsColumns.forEach(col => {
      if (col.Field.includes('status') || col.Field.includes('priority')) {
        console.log(`   ${col.Field}: ${col.Type}`);
      }
    });

    // Verificar estructura de tasks
    console.log('\n📋 Estructura de tabla tasks:');
    const [tasksColumns] = await connection.execute('DESCRIBE tasks');
    tasksColumns.forEach(col => {
      if (col.Field.includes('status') || col.Field.includes('priority')) {
        console.log(`   ${col.Field}: ${col.Type}`);
      }
    });

    // Verificar datos existentes
    console.log('\n📊 Status en projects:');
    const [projectStatuses] = await connection.execute('SELECT DISTINCT status FROM projects');
    projectStatuses.forEach(row => {
      console.log(`   Status: "${row.status}" (tipo: ${typeof row.status})`);
    });

    console.log('\n📊 Status en tasks:');
    const [taskStatuses] = await connection.execute('SELECT DISTINCT status FROM tasks');
    taskStatuses.forEach(row => {
      console.log(`   Status: "${row.status}" (tipo: ${typeof row.status})`);
    });

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProjectsTasks();
