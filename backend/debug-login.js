require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugLogin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Depurando login...');
    
    // 1. Verificar el usuario
    const [users] = await connection.execute(
      'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
      ['admin@zentura.com']
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = users[0];
    console.log('✅ Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   Status: ${user.status} (tipo: ${typeof user.status})`);
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`);

    // 2. Verificar contraseña
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare('admin123', user.password);
    console.log(`   Contraseña válida: ${isValidPassword}`);

    // 3. Verificar status
    console.log(`   Status check: ${user.status} !== 1 = ${user.status !== 1}`);

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLogin();
