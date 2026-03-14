require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetForAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔄 Preparando sistema para el admin...\n');

  try {
    // Eliminar asignación de prueba
    await connection.execute('DELETE FROM project_workers WHERE project_id = 1 AND worker_id = 11');
    
    // Eliminar de la sala de chat
    const [chatRoom] = await connection.execute(
      'SELECT id FROM chat_rooms WHERE project_id = 1 AND type = "project"'
    );
    
    if (chatRoom.length > 0) {
      await connection.execute(
        'DELETE FROM chat_participants WHERE room_id = ? AND user_id = ?',
        [chatRoom[0].id, 11]
      );
    }
    
    console.log('✅ Sistema reiniciado para pruebas del admin');
    
    // Verificación final
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
    
    console.log('\n👥 Workers que el admin podrá asignar:');
    available.forEach(w => {
      console.log(`   - ${w.name} (${w.email})`);
    });
    
    console.log('\n🎯 Sistema listo para que el admin:');
    console.log('   1. Inicie sesión como admin');
    console.log('   2. Vaya al proyecto "El Saler"');
    console.log('   3. Vea "Gestión de Trabajadores"');
    console.log('   4. Asigne workers con el botón ➕');
    console.log('   5. Los workers asignados verán el chat del proyecto');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

resetForAdmin();
