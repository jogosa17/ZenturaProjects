require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Verificando usuarios workers...\n');
    
    const [users] = await connection.execute(
      `SELECT 
        u.id, u.name, u.email, u.dni, u.username, u.status, u.created_at,
        GROUP_CONCAT(p.name SEPARATOR ', ') as projects
      FROM users u
      LEFT JOIN project_workers pw ON u.id = pw.user_id
      LEFT JOIN projects p ON pw.project_id = p.id
      WHERE u.role = 'worker'
      GROUP BY u.id
      ORDER BY u.name ASC`
    );
    
    console.log(`📊 Total de workers: ${users.length}`);
    
    if (users.length === 0) {
      console.log('\n⚠️ No hay usuarios con rol worker');
      console.log('\n🔍 Verificando todos los usuarios:');
      
      const [allUsers] = await connection.execute(
        'SELECT id, name, email, username, role, status FROM users'
      );
      
      console.log(`Total usuarios: ${allUsers.length}`);
      allUsers.forEach(user => {
        console.log(`  ID ${user.id}: ${user.name} - ${user.role} - ${user.username || 'NULL'}`);
      });
    } else {
      users.forEach(user => {
        console.log(`\nID: ${user.id}`);
        console.log(`  Nombre: ${user.name}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  DNI: ${user.dni}`);
        console.log(`  Email: ${user.email}`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
