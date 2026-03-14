require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugUsersProjects() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Diagnosticando proyectos de usuarios...\n');

  try {
    // Verificar usuarios existentes
    console.log('� Usuarios existentes:');
    const [users] = await connection.execute('SELECT id, name, username, role FROM users LIMIT 5');
    users.forEach(user => {
      console.log(`   ID: ${user.id}, Nombre: ${user.name}, Usuario: ${user.username}, Rol: ${user.role}`);
    });

    // Verificar tabla project_workers
    console.log('\n� Estructura de project_workers:');
    try {
      const [pwStructure] = await connection.execute('DESCRIBE project_workers');
      pwStructure.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });

      // Verificar asignaciones
      console.log('\n🔗 Asignaciones project_workers:');
      const [assignments] = await connection.execute(`
        SELECT pw.*, u.name as user_name, p.name as project_name 
        FROM project_workers pw
        JOIN users u ON pw.worker_id = u.id
        JOIN projects p ON pw.project_id = p.id
        LIMIT 5
      `);
      assignments.forEach(assignment => {
        console.log(`   Usuario: ${assignment.user_name} -> Proyecto: ${assignment.project_name}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla project_workers no existe o error:', error.message);
    }

    // Verificar la consulta del backend
    console.log('\n🔍 Probando consulta del backend actualizada:');
    try {
      const [backendResult] = await connection.execute(`
        SELECT 
          u.id, u.name, u.email, u.dni, u.username, u.status, u.created_at,
          (SELECT GROUP_CONCAT(p.name SEPARATOR ', ')
           FROM project_workers pw
           JOIN projects p ON pw.project_id = p.id
           WHERE pw.worker_id = u.id) as projects
        FROM users u
        WHERE u.role = 'worker'
        ORDER BY u.name ASC
      `);
      
      console.log('   Resultado con proyectos concatenados:');
      backendResult.forEach(user => {
        console.log(`   ID: ${user.id}, Nombre: ${user.name}, Proyectos: ${user.projects || 'Ninguno'}`);
      });
    } catch (error) {
      console.log('   ❌ Error en consulta:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await connection.end();
  }
}

debugUsersProjects();
