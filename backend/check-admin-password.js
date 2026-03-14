require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAdminPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando contraseña del admin...\n');

  try {
    const [admin] = await connection.execute(
      'SELECT id, name, username, password FROM users WHERE role = "admin" AND status = 1'
    );

    if (admin.length > 0) {
      console.log('👤 Admin encontrado:');
      console.log(`   ID: ${admin[0].id}`);
      console.log(`   Nombre: ${admin[0].name}`);
      console.log(`   Username: ${admin[0].username}`);
      console.log(`   Password (hash): ${admin[0].password.substring(0, 20)}...`);
      
      // Probar con contraseña común
      const bcrypt = require('bcrypt');
      const testPasswords = ['123456', 'admin', 'password', 'A5724'];
      
      console.log('\n🔐 Probando contraseñas comunes:');
      for (const pwd of testPasswords) {
        const match = await bcrypt.compare(pwd, admin[0].password);
        console.log(`   "${pwd}": ${match ? '✅ Correcta' : '❌ Incorrecta'}`);
        
        if (match) {
          console.log(`\n🎉 Contraseña encontrada: "${pwd}"`);
          break;
        }
      }
    } else {
      console.log('❌ No hay admin activo');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAdminPassword();
