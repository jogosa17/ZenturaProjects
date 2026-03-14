require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugClientsDNI() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando campo DNI en clientes...\n');

  try {
    // Verificar la estructura de la tabla clients
    console.log('📋 Estructura de la tabla clients:');
    const [clientStructure] = await connection.execute('DESCRIBE clients');
    clientStructure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar si hay campo dni
    console.log('\n🔍 Buscando campo DNI:');
    const [dniField] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'clients' 
      AND COLUMN_NAME = 'dni'
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (dniField.length > 0) {
      console.log('   ✅ Campo DNI encontrado en la tabla clients');
      
      // Verificar datos existentes
      console.log('\n👥 Verificando DNI en clientes existentes:');
      const [clients] = await connection.execute('SELECT id, name, phone, dni FROM clients LIMIT 5');
      clients.forEach(client => {
        console.log(`   ID: ${client.id}, Nombre: ${client.name}, DNI: ${client.dni || 'NULL'}`);
      });
    } else {
      console.log('   ❌ Campo DNI NO encontrado en la tabla clients');
      console.log('   💡 Necesario añadir el campo DNI a la tabla');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await connection.end();
  }
}

debugClientsDNI();
