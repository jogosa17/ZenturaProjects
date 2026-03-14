require('dotenv').config();
const mysql = require('mysql2/promise');

async function addDNIFieldToClients() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔧 Añadiendo campo DNI a la tabla clients...\n');

  try {
    // Añadir el campo DNI a la tabla clients
    console.log('📝 Ejecutando ALTER TABLE para añadir campo DNI...');
    await connection.execute(`
      ALTER TABLE clients 
      ADD COLUMN dni VARCHAR(20) NULL 
      AFTER phone
    `);
    console.log('   ✅ Campo DNI añadido exitosamente');

    // Verificar que se haya añadido correctamente
    console.log('\n🔍 Verificando estructura actualizada:');
    const [updatedStructure] = await connection.execute('DESCRIBE clients');
    updatedStructure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n🎉 Campo DNI añadido correctamente a la tabla clients');

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('   ⚠️  El campo DNI ya existe en la tabla');
    } else {
      console.error('   ❌ Error al añadir campo DNI:', error.message);
    }
  } finally {
    await connection.end();
  }
}

addDNIFieldToClients();
