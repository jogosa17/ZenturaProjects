require('dotenv').config();
const mysql = require('mysql2/promise');

async function deleteOtherUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Eliminando usuarios excepto el administrador Z7416...\n');
    
    // Verificar usuarios antes de eliminar
    const [usersBefore] = await connection.execute(
      'SELECT id, name, username, email FROM users ORDER BY id'
    );
    
    console.log('📋 Usuarios existentes antes:');
    usersBefore.forEach(user => {
      console.log(`  ID ${user.id}: ${user.name} (${user.username || 'NULL'}) - ${user.email}`);
    });
    
    // Eliminar todos los usuarios excepto el que tiene username Z7416
    const [result] = await connection.execute(
      "DELETE FROM users WHERE username != 'Z7416' OR username IS NULL"
    );
    
    console.log(`\n✅ Usuarios eliminados: ${result.affectedRows}`);
    
    // Verificar usuarios después
    const [usersAfter] = await connection.execute(
      'SELECT id, name, username, email, role, dni FROM users'
    );
    
    console.log('\n📋 Usuarios restantes:');
    usersAfter.forEach(user => {
      console.log(`  ID ${user.id}: ${user.name}`);
      console.log(`     Username: ${user.username}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     DNI: ${user.dni}`);
      console.log(`     Rol: ${user.role}`);
    });
    
    if (usersAfter.length === 0) {
      console.log('\n⚠️  ATENCIÓN: No quedó ningún usuario!');
    } else {
      console.log('\n✅ Solo queda el administrador Z7416');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteOtherUsers();
