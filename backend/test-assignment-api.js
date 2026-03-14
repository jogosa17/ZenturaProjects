require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAssignmentAPI() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🧪 Probando API de asignaciones...\n');

  try {
    // 1. Simular la consulta que hace el endpoint getAvailableWorkers
    console.log('🔍 Probando consulta getAvailableWorkers:');
    
    const projectId = 1;
    
    // Obtener todos los workers activos
    const [allWorkers] = await connection.execute(
      'SELECT id, name, email, username FROM users WHERE role = "worker" AND status = 1 ORDER BY name'
    );

    // Obtener workers ya asignados a este proyecto
    const [assignedWorkers] = await connection.execute(
      'SELECT worker_id FROM project_workers WHERE project_id = ?',
      [projectId]
    );

    const assignedIds = assignedWorkers.map(w => w.worker_id);

    // Separar disponibles y asignados
    const available = allWorkers.filter(w => !assignedIds.includes(w.id));
    const assigned = allWorkers.filter(w => assignedIds.includes(w.id));

    console.log(`📊 Resultados para proyecto ${projectId}:`);
    console.log(`   Workers disponibles: ${available.length}`);
    console.log(`   Workers asignados: ${assigned.length}`);
    
    console.log('\n👥 Workers disponibles:');
    available.forEach(w => {
      console.log(`   - ${w.name} (${w.email})`);
    });
    
    console.log('\n👥 Workers asignados:');
    assigned.forEach(w => {
      console.log(`   - ${w.name} (${w.email})`);
    });

    // 2. Simular asignación de un worker
    if (available.length > 0) {
      console.log('\n🔧 Simulando asignación del primer worker disponible...');
      const workerToAssign = available[0];
      
      // Verificar que el worker exista y esté activo
      const [workerCheck] = await connection.execute(
        'SELECT id, name FROM users WHERE id = ? AND role = "worker" AND status = 1',
        [workerToAssign.id]
      );

      if (workerCheck.length > 0) {
        console.log(`✅ Worker verificado: ${workerCheck[0].name}`);
        
        // Verificar que el proyecto exista
        const [projectCheck] = await connection.execute(
          'SELECT id, name FROM projects WHERE id = ?',
          [projectId]
        );

        if (projectCheck.length > 0) {
          console.log(`✅ Proyecto verificado: ${projectCheck[0].name}`);
          
          // Verificar si ya está asignado
            const [existingAssignment] = await connection.execute(
              'SELECT project_id FROM project_workers WHERE project_id = ? AND worker_id = ?',
              [projectId, workerToAssign.id]
            );

          if (existingAssignment.length === 0) {
            // Realizar asignación
            await connection.execute(
              'INSERT INTO project_workers (project_id, worker_id) VALUES (?, ?)',
              [projectId, workerToAssign.id]
            );
            
            console.log(`✅ Worker ${workerCheck[0].name} asignado al proyecto ${projectCheck[0].name}`);
            
            // Agregar worker a la sala de chat del proyecto
            const [chatRoom] = await connection.execute(
              'SELECT id FROM chat_rooms WHERE project_id = ? AND type = "project"',
              [projectId]
            );

            if (chatRoom.length > 0) {
              await connection.execute(
                'INSERT INTO chat_participants (room_id, user_id, role) VALUES (?, ?, "participant")',
                [chatRoom[0].id, workerToAssign.id]
              );
              console.log(`✅ Worker agregado a la sala de chat`);
            }
            
            console.log('\n🎉 Asignación completada exitosamente');
            
          } else {
            console.log('ℹ️ El worker ya estaba asignado');
          }
        }
      }
    }

    // 3. Verificación final
    console.log('\n🔍 Verificación final:');
    const [finalAssignments] = await connection.execute(
      'SELECT u.id, u.name, u.email FROM project_workers pw JOIN users u ON pw.worker_id = u.id WHERE pw.project_id = ? AND u.role = "worker"',
      [projectId]
    );
    
    console.log(`Workers asignados al proyecto: ${finalAssignments.length}`);
    finalAssignments.forEach(w => {
      console.log(`   - ${w.name} (${w.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testAssignmentAPI();
