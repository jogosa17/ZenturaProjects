require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDNIColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando si el campo DNI existe realmente...\n');

  try {
    // Verificar la estructura actual de la tabla
    console.log('📋 Estructura actual de la tabla clients:');
    const [structure] = await connection.execute('DESCRIBE clients');
    structure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar si el campo DNI existe en INFORMATION_SCHEMA
    console.log('\n🔍 Verificando en INFORMATION_SCHEMA:');
    const [columnCheck] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'clients' 
      AND COLUMN_NAME = 'dni'
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (columnCheck.length > 0) {
      console.log('   ✅ Campo DNI encontrado en INFORMATION_SCHEMA:');
      columnCheck.forEach(col => {
        console.log(`   - Columna: ${col.COLUMN_NAME}, Tipo: ${col.DATA_TYPE}, Nulable: ${col.IS_NULLABLE}`);
      });
    } else {
      console.log('   ❌ Campo DNI NO encontrado en INFORMATION_SCHEMA');
    }

    // Verificar datos existentes para confirmar
    console.log('\n👥 Verificando datos existentes:');
    const [clients] = await connection.execute('SELECT id, name, phone, dni FROM clients LIMIT 3');
    clients.forEach(client => {
      console.log(`   ID: ${client.id}, Nombre: ${client.name}, DNI: ${client.dni || 'NULL'}, Teléfono: ${client.phone}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

verifyDNIColumn();
