require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkProjectWorkersStructure() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando estructura de project_workers...\n');

  try {
    const [structure] = await connection.execute('DESCRIBE project_workers');
    console.log('Estructura de la tabla project_workers:');
    structure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n📊 Datos actuales:');
    const [data] = await connection.execute('SELECT * FROM project_workers');
    console.log('Registros existentes:', data.length);
    data.forEach(row => {
      console.log('   ', row);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkProjectWorkersStructure();
