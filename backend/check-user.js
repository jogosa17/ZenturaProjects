require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Verificando usuario admin@zentura.com...');
    
    const [users] = await connection.execute(
      'SELECT id, name, email, role, status FROM users WHERE email = ?',
      ['admin@zentura.com']
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado');
    } else {
      const user = users[0];
      console.log('✅ Usuario encontrado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Estado: ${user.status}`);
      
      if (user.status !== 1) {
        console.log('🔧 Activando usuario...');
        await connection.execute(
          'UPDATE users SET status = ? WHERE id = ?',
          [1, user.id]
        );
        console.log('✅ Usuario activado correctamente');
        
        // Verificar el cambio
        const [updatedUser] = await connection.execute(
          'SELECT status FROM users WHERE id = ?',
          [user.id]
        );
        console.log(`📋 Nuevo estado: ${updatedUser[0].status}`);
      } else {
        console.log('✅ Usuario ya está activo');
      }
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser();
