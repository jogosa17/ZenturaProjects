require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugClientsProjects() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Diagnosticando proyectos de clientes...\n');

  try {
    // Verificar tabla clients
    console.log('📋 Estructura de la tabla clients:');
    const [clientStructure] = await connection.execute('DESCRIBE clients');
    clientStructure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar clientes existentes
    console.log('\n👥 Clientes existentes:');
    const [clients] = await connection.execute('SELECT id, name, phone, project_count FROM clients LIMIT 5');
    clients.forEach(client => {
      console.log(`   ID: ${client.id}, Nombre: ${client.name}, Proyectos: ${client.project_count || 'NULL'}`);
    });

    // Verificar si hay proyectos asignados
    console.log('\n🔗 Verificando asignaciones cliente-proyecto:');
    try {
      const [assignments] = await connection.execute(`
        SELECT c.name as client_name, p.name as project_name 
        FROM client_projects cp
        JOIN clients c ON cp.client_id = c.id
        JOIN projects p ON cp.project_id = p.id
        LIMIT 5
      `);
      assignments.forEach(assignment => {
        console.log(`   Cliente: ${assignment.client_name} -> Proyecto: ${assignment.project_name}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla client_projects no existe o error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await connection.end();
  }
}

debugClientsProjects();
