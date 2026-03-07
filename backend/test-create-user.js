require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testCreateUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Probando inserción de usuario...');
    
    // Datos de prueba
    const name = 'Usuario Test';
    const email = 'test' + Date.now() + '@test.com';
    const password = await bcrypt.hash('W1234', 10);
    const dni = '12345678Z';
    const username = 'Z1234';
    
    console.log('📝 Datos a insertar:');
    console.log('   Nombre:', name);
    console.log('   Email:', email);
    console.log('   DNI:', dni);
    console.log('   Username:', username);
    
    // Intentar insertar
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role, status, dni, username) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, 'worker', 1, dni, username]
    );
    
    console.log('✅ Usuario insertado correctamente');
    console.log('   ID:', result.insertId);
    
    // Verificar que se guardó
    const [users] = await connection.execute(
      'SELECT id, name, email, dni, username FROM users WHERE id = ?',
      [result.insertId]
    );
    
    if (users.length > 0) {
      console.log('✅ Usuario verificado en la base de datos:');
      console.log('   ', users[0]);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    console.error('   Código:', error.code);
    console.error('   SQL State:', error.sqlState);
  }
}

testCreateUser();
