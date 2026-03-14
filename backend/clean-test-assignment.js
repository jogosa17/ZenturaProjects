require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanTestAssignment() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🧹 Limpiando asignación de prueba...\n');

  try {
    // Eliminar asignación de prueba
    await connection.execute('DELETE FROM project_workers WHERE project_id = 1 AND worker_id = 11');
    
    // Eliminar de la sala de chat
    await connection.execute(
      'DELETE FROM chat_participants WHERE room_id = 2 AND user_id = 11'
    );
    
    console.log('✅ Sistema limpio para pruebas');
    
    // Verificar estado
    const [workers] = await connection.execute(
      'SELECT id, name, email FROM users WHERE role = "worker" AND status = 1 ORDER BY name'
    );
    
    const [assigned] = await connection.execute(
      'SELECT worker_id FROM project_workers WHERE project_id = 1'
    );
    
    const assignedIds = assigned.map(w => w.worker_id);
    const available = workers.filter(w => !assignedIds.includes(w.id));
    
    console.log('\n📊 Estado final:');
    console.log(`   Workers disponibles: ${available.length}`);
    console.log(`   Workers asignados: ${assigned.length}`);
    
    console.log('\n👥 Workers disponibles para asignar:');
    available.forEach(w => {
      console.log(`   - ${w.name} (${w.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

cleanTestAssignment();
