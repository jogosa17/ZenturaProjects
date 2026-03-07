require('dotenv').config();
const mysql = require('mysql2/promise');

async function listUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Usuarios existentes en la base de datos:\n');
    
    const [users] = await connection.execute(
      'SELECT id, name, email, username, dni, role, status FROM users ORDER BY id'
    );
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`  Nombre: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Username: ${user.username || 'NULL'}`);
        console.log(`  DNI: ${user.dni || 'NULL'}`);
        console.log(`  Rol: ${user.role}`);
        console.log(`  Estado: ${user.status === 1 ? 'Activo' : 'Inactivo'}`);
        console.log('---');
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listUsers();
