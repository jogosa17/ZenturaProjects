require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTableNames() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando nombres de tablas...\n');

  try {
    // Verificar todas las tablas que contienen 'zone'
    console.log('📋 Tablas que contienen "zone":');
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name LIKE '%zone%'
    `);
    
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Verificar la estructura de la tabla zones
    console.log('\n🗺️ Estructura de la tabla "zones":');
    try {
      const [zonesStructure] = await connection.execute('DESCRIBE zones');
      zonesStructure.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.log('   ❌ La tabla "zones" no existe');
    }

    // Verificar la estructura de la tabla task_zones
    console.log('\n🗺️ Estructura de la tabla "task_zones":');
    try {
      const [taskZonesStructure] = await connection.execute('DESCRIBE task_zones');
      taskZonesStructure.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.log('   ❌ La tabla "task_zones" no existe');
    }

    // Verificar las claves foráneas de la tabla tasks
    console.log('\n🔗 Claves foráneas de la tabla "tasks":');
    const [constraints] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'tasks'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.CONSTRAINT_NAME}:`);
      console.log(`     ${constraint.COLUMN_NAME} → ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTableNames();
