require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando estructura de tablas...\n');

  try {
    // Verificar estructura de la tabla tasks
    console.log('📋 Estructura de la tabla tasks:');
    const [tasksColumns] = await connection.execute('DESCRIBE tasks');
    tasksColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n📋 Estructura de la tabla consultas:');
    const [consultasColumns] = await connection.execute('DESCRIBE consultas');
    consultasColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n📋 Estructura de la tabla files:');
    const [filesColumns] = await connection.execute('DESCRIBE files');
    filesColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTableStructure();
