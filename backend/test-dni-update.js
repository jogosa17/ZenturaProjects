require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDNIUpdate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🧪 Probando actualización de DNI en clientes...\n');

  try {
    // Primero, crear un cliente de prueba
    console.log('📝 Creando cliente de prueba con DNI...');
    const [createResult] = await connection.execute(
      'INSERT INTO clients (name, phone, dni) VALUES (?, ?, ?)',
      ['Cliente Test DNI', '600123456', '12345678Z']
    );
    
    const newClientId = createResult.insertId;
    console.log(`   ✅ Cliente creado con ID: ${newClientId}`);

    // Luego, actualizar el cliente
    console.log('\n📝 Actualizando cliente con DNI...');
    const [updateResult] = await connection.execute(
      'UPDATE clients SET name = ?, phone = ?, dni = ? WHERE id = ?',
      ['Cliente Test DNI Actualizado', '600999999', '87654321X', newClientId]
    );
    
    console.log(`   ✅ Filas afectadas: ${updateResult.affectedRows}`);

    // Verificar el resultado
    console.log('\n🔍 Verificando actualización:');
    const [verifyResult] = await connection.execute(
      'SELECT id, name, phone, dni FROM clients WHERE id = ?',
      [newClientId]
    );

    if (verifyResult.length > 0) {
      const client = verifyResult[0];
      console.log('   ✅ Cliente actualizado correctamente:');
      console.log(`   ID: ${client.id}`);
      console.log(`   Nombre: ${client.name}`);
      console.log(`   Teléfono: ${client.phone}`);
      console.log(`   DNI: ${client.dni}`);
    } else {
      console.log('   ❌ Error: No se encontró el cliente actualizado');
    }

    // Limpiar: eliminar el cliente de prueba
    console.log('\n🧹 Limpiando cliente de prueba...');
    await connection.execute('DELETE FROM clients WHERE id = ?', [newClientId]);
    console.log('   ✅ Cliente de prueba eliminado');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await connection.end();
  }
}

testDNIUpdate();
