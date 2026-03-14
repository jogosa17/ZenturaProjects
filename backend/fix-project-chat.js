require('dotenv').config();
const mysql = require('mysql2/promise');

async function createProjectChatRoom() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔧 Creando sala de chat para proyecto "El Saler"...');

  try {
    // 1. Obtener el proyecto El Saler
    const [projects] = await connection.execute('SELECT id, name FROM projects WHERE name = "El Saler"');
    
    if (projects.length === 0) {
      console.log('❌ Proyecto "El Saler" no encontrado');
      return;
    }

    const project = projects[0];
    console.log(`✅ Proyecto encontrado: ID ${project.id}, Nombre: ${project.name}`);

    // 2. Verificar si ya existe sala para este proyecto
    const [existingRoom] = await connection.execute(
      'SELECT id FROM chat_rooms WHERE project_id = ? AND type = "project"',
      [project.id]
    );

    if (existingRoom.length > 0) {
      console.log('⚠️  La sala de chat ya existe para este proyecto');
    } else {
      // 3. Crear sala de chat para el proyecto
      const [roomResult] = await connection.execute(
        'INSERT INTO chat_rooms (project_id, name, type) VALUES (?, ?, ?)',
        [project.id, `Chat - ${project.name}`, 'project']
      );
      
      const roomId = roomResult.insertId;
      console.log(`✅ Sala de chat creada con ID: ${roomId}`);

      // 4. Asignar workers al proyecto (si no tienen)
      const [workers] = await connection.execute('SELECT worker_id FROM project_workers WHERE project_id = ?', [project.id]);
      
      if (workers.length === 0) {
        console.log('📝 No hay trabajadores asignados, asignando workers disponibles...');
        
        // Obtener todos los workers
        const [allWorkers] = await connection.execute('SELECT id FROM users WHERE role = "worker" AND status = 1');
        
        for (const worker of allWorkers) {
          await connection.execute(
            'INSERT INTO project_workers (project_id, worker_id) VALUES (?, ?)',
            [project.id, worker.id]
          );
          console.log(`   ✅ Worker ${worker.id} asignado al proyecto`);
        }
      }

      // 5. Agregar todos los trabajadores del proyecto a la sala
      const [projectWorkers] = await connection.execute('SELECT worker_id FROM project_workers WHERE project_id = ?', [project.id]);
      
      for (const worker of projectWorkers) {
        await connection.execute(
          'INSERT IGNORE INTO chat_participants (room_id, user_id, role) VALUES (?, ?, ?)',
          [roomId, worker.worker_id, 'participant']
        );
        console.log(`   ✅ Worker ${worker.worker_id} agregado a la sala`);
      }

      // 6. Agregar todos los admins a la sala
      const [admins] = await connection.execute(
        'SELECT id FROM users WHERE role = "admin" AND status = 1'
      );
      
      for (const admin of admins) {
        await connection.execute(
          'INSERT IGNORE INTO chat_participants (room_id, user_id, role) VALUES (?, ?, ?)',
          [roomId, admin.id, 'admin']
        );
        console.log(`   ✅ Admin ${admin.id} agregado a la sala`);
      }

      console.log(`🎉 Sala de chat completada para proyecto "${project.name}"`);
    }

    // 7. Verificación final
    console.log('\n🔍 Verificación final:');
    
    const [finalRoom] = await connection.execute(
      'SELECT id FROM chat_rooms WHERE project_id = ? AND type = "project"',
      [project.id]
    );
    
    if (finalRoom.length > 0) {
      const [participants] = await connection.execute(
        'SELECT user_id, role FROM chat_participants WHERE room_id = ?',
        [finalRoom[0].id]
      );
      
      console.log(`   Sala ID: ${finalRoom[0].id}`);
      console.log(`   Participantes: ${participants.length}`);
      participants.forEach(p => console.log(`     - User ID: ${p.user_id}, Rol: ${p.role}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createProjectChatRoom();
