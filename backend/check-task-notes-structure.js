require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTaskNotesStructure() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando estructura de task_notes...\n');

  try {
    // Verificar si la tabla existe
    console.log('📋 Tablas que contienen "note":');
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name LIKE '%note%'
    `);
    
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Verificar estructura de task_notes
    console.log('\n🗺️ Estructura de la tabla "task_notes":');
    try {
      const [structure] = await connection.execute('DESCRIBE task_notes');
      structure.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } catch (error) {
      console.log('   ❌ La tabla "task_notes" no existe');
      
      // Verificar si hay otra tabla similar
      console.log('\n🔍 Buscando tablas similares...');
      const [allTables] = await connection.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND (table_name LIKE '%note%' OR table_name LIKE '%comment%')
      `);
      
      console.log('Tablas encontradas:');
      allTables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Verificar datos existentes
    console.log('\n📝 Datos actuales:');
    try {
      const [data] = await connection.execute('SELECT * FROM task_notes LIMIT 5');
      console.log(`Registros en task_notes: ${data.length}`);
      data.forEach(row => {
        console.log('   ', row);
      });
    } catch (error) {
      console.log('   No se pudieron obtener datos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTaskNotesStructure();
