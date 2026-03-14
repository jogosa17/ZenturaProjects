require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verifyAndResetPassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Verificando contraseña del usuario W9928...\n');
    
    // Obtener el usuario W9928
    const [users] = await connection.execute(
      'SELECT id, name, email, username, password FROM users WHERE username = ?',
      ['W9928']
    );
    
    if (users.length === 0) {
      console.log('❌ Usuario W9928 no encontrado');
      await connection.end();
      return;
    }
    
    const user = users[0];
    console.log('📝 Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Nombre:', user.name);
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Password Hash:', user.password);
    console.log('');
    
    // Verificar si la contraseña es W1234
    const isW1234 = await bcrypt.compare('W1234', user.password);
    console.log('🔐 Verificación con "W1234":', isW1234 ? '✅ Correcta' : '❌ Incorrecta');
    
    // Verificar si la contraseña es 123456
    const is123456 = await bcrypt.compare('123456', user.password);
    console.log('🔐 Verificación con "123456":', is123456 ? '✅ Correcta' : '❌ Incorrecta');
    
    // Verificar si la contraseña es W9928
    const isW9928 = await bcrypt.compare('W9928', user.password);
    console.log('🔐 Verificación con "W9928":', isW9928 ? '✅ Correcta' : '❌ Incorrecta');
    
    // Verificar si la contraseña es 4489 (últimos 4 del DNI)
    const is4489 = await bcrypt.compare('4489', user.password);
    console.log('🔐 Verificación con "4489":', is4489 ? '✅ Correcta' : '❌ Incorrecta');
    
    console.log('');
    
    // Si ninguna contraseña funciona, preguntar si quiere resetear
    if (!isW1234 && !is123456 && !isW9928 && !is4489) {
      console.log('⚠️  Ninguna contraseña estándar coincide');
      console.log('');
      console.log('🔄 Opciones de reseteo:');
      console.log('1. Restablecer a "W1234"');
      console.log('2. Restablecer a "123456"');
      console.log('3. Restablecer a "W9928"');
      console.log('4. Restablecer a "4489"');
      console.log('');
      
      // Por defecto, resetear a W1234
      console.log('🔧 Restableciendo contraseña a "W1234"...');
      
      const newHashedPassword = await bcrypt.hash('W1234', 10);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [newHashedPassword, 'W9928']
      );
      
      console.log('✅ Contraseña restablecida exitosamente');
      console.log('');
      console.log('🔐 NUEVAS CREDENCIALES:');
      console.log('   Username: W9928');
      console.log('   Contraseña: W1234');
    } else {
      console.log('✅ La contraseña funciona con una de las opciones estándar');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyAndResetPassword();
