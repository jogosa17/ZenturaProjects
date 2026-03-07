require('dotenv').config();
const mysql = require('mysql2/promise');

async function testQuery() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('Testing getWorkers query...\n');
    
    // Simplified query without projects
    const [rows] = await conn.execute(`
      SELECT 
        u.id, u.name, u.email, u.dni, u.username, u.status, u.created_at
      FROM users u
      WHERE u.role = 'worker'
      ORDER BY u.name ASC
    `);
    
    console.log('Workers found:', rows.length);
    rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.name}, Username: ${row.username}`);
    });
    
    await conn.end();
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testQuery();
