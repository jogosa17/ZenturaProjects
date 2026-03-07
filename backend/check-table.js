require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Verificando estructura de la tabla users...');
    
    const [columns] = await connection.execute('DESCRIBE users');
    
    console.log('📋 Estructura de la tabla users:');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Verificar el estado actual del usuario admin
    const [users] = await connection.execute(
      'SELECT id, name, email, role, status FROM users WHERE email = ?',
      ['admin@zentura.com']
    );

    if (users.length > 0) {
      const user = users[0];
      console.log('\n👤 Estado actual del usuario admin:');
      console.log(`   Status: "${user.status}" (tipo: ${typeof user.status})`);
      
      // Actualizar con el valor correcto del tinyint
      console.log('\n🔧 Actualizando status a 1 (activo)...');
      await connection.execute(
        'UPDATE users SET status = ? WHERE id = ?',
        [1, user.id]
      );
      
      // Verificar el cambio
      const [updatedUser] = await connection.execute(
        'SELECT status FROM users WHERE id = ?',
        [user.id]
      );
      console.log(`✅ Nuevo estado: "${updatedUser[0].status}"`);
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTable();
