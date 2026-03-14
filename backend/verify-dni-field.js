require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDNIField() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando campo DNI en tabla clients...\n');

  try {
    // Verificar estructura actual de la tabla
    console.log('📋 Estructura actual de la tabla clients:');
    const [structure] = await connection.execute('DESCRIBE clients');
    structure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar si el campo DNI existe
    console.log('\n🔍 Verificando existencia del campo DNI:');
    const [dniCheck] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'clients' 
      AND COLUMN_NAME = 'dni'
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (dniCheck.length > 0) {
      console.log('   ✅ Campo DNI existe en la tabla clients');
      
      // Verificar datos de ejemplo
      console.log('\n👥 Verificando datos con DNI:');
      const [clients] = await connection.execute('SELECT id, name, phone, dni FROM clients WHERE dni IS NOT NULL LIMIT 3');
      if (clients.length > 0) {
        console.log('   Clientes con DNI registrado:');
        clients.forEach(client => {
          console.log(`   ID: ${client.id}, Nombre: ${client.name}, DNI: ${client.dni}, Teléfono: ${client.phone}`);
        });
      } else {
        console.log('   ℹ️  No hay clientes con DNI registrado todavía');
      }
    } else {
      console.log('   ❌ Campo DNI NO existe en la tabla clients');
      console.log('   💡 Se necesita añadir el campo DNI');
    }

  } catch (error) {
    console.error('❌ Error al verificar:', error.message);
  } finally {
    await connection.end();
  }
}

verifyDNIField();
