require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkFieldName() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando nombre exacto del campo...\n');

  try {
    // Verificar información detallada del campo
    const [fieldInfo] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'clients' 
      AND COLUMN_NAME LIKE '%dni%'
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (fieldInfo.length > 0) {
      console.log('   ✅ Información del campo DNI:');
      fieldInfo.forEach(field => {
        console.log(`   - Nombre: ${field.COLUMN_NAME}`);
        console.log(`   - Tipo: ${field.DATA_TYPE}`);
        console.log(`   - Nulable: ${field.IS_NULLABLE}`);
        console.log(`   - Longitud máxima: ${field.CHARACTER_MAXIMUM_LENGTH}`);
      });
    } else {
      console.log('   ❌ No se encontró ningún campo con "dni" en el nombre');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkFieldName();
