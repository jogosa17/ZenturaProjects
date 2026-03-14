require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugAssignment() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Diagnosticando proceso de asignación...\n');

  try {
    const projectId = 1;
    const workerId = 11; // Jorge

    console.log(`📋 Intentando asignar Worker ${workerId} al Proyecto ${projectId}`);

    // 1. Verificar que el worker exista y esté activo
    console.log('\n1️⃣ Verificando worker...');
    const [workerCheck] = await connection.execute(
      'SELECT id, name, role, status FROM users WHERE id = ?',
      [workerId]
    );

    if (workerCheck.length === 0) {
      console.log('❌ Worker no encontrado');
      return;
    }

    const worker = workerCheck[0];
    console.log(`✅ Worker encontrado: ${worker.name} (rol: ${worker.role}, estado: ${worker.status})`);

    if (worker.role !== 'worker') {
      console.log('❌ El usuario no es un worker');
      return;
    }

    if (worker.status !== 1) {
      console.log('❌ El worker no está activo');
      return;
    }

    // 2. Verificar que el proyecto exista
    console.log('\n2️⃣ Verificando proyecto...');
    const [projectCheck] = await connection.execute(
      'SELECT id, name FROM projects WHERE id = ?',
      [projectId]
    );

    if (projectCheck.length === 0) {
      console.log('❌ Proyecto no encontrado');
      return;
    }

    const project = projectCheck[0];
    console.log(`✅ Proyecto encontrado: ${project.name}`);

    // 3. Verificar si ya está asignado
    console.log('\n3️⃣ Verificando asignación existente...');
    const [existingAssignment] = await connection.execute(
      'SELECT * FROM project_workers WHERE project_id = ? AND worker_id = ?',
      [projectId, workerId]
    );

    if (existingAssignment.length > 0) {
      console.log('ℹ️ El worker ya está asignado a este proyecto');
      return;
    }

    console.log('✅ Worker no está asignado previamente');

    // 4. Verificar estructura de la tabla project_workers
    console.log('\n4️⃣ Verificando estructura de tabla project_workers...');
    const [tableStructure] = await connection.execute('DESCRIBE project_workers');
    console.log('Estructura de project_workers:');
    tableStructure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // 5. Intentar realizar la asignación
    console.log('\n5️⃣ Intentando realizar asignación...');
    try {
      const [result] = await connection.execute(
        'INSERT INTO project_workers (project_id, worker_id) VALUES (?, ?)',
        [projectId, workerId]
      );
      console.log(`✅ Asignación exitosa. ID: ${result.insertId}`);
    } catch (error) {
      console.log('❌ Error en la inserción:', error.message);
      return;
    }

    // 6. Verificar sala de chat
    console.log('\n6️⃣ Verificando sala de chat...');
    const [chatRoom] = await connection.execute(
      'SELECT id, name FROM chat_rooms WHERE project_id = ? AND type = "project"',
      [projectId]
    );

    if (chatRoom.length === 0) {
      console.log('❌ No hay sala de chat para este proyecto');
      console.log('🔧 Creando sala de chat...');
      
      try {
        const [roomResult] = await connection.execute(
          'INSERT INTO chat_rooms (project_id, name, type) VALUES (?, ?, ?)',
          [projectId, `Chat - ${project.name}`, 'project']
        );
        console.log(`✅ Sala de chat creada. ID: ${roomResult.insertId}`);
        
        // Agregar admin a la sala
        await connection.execute(
          'INSERT INTO chat_participants (room_id, user_id, role) VALUES (?, ?, "admin")',
          [roomResult.insertId, 13] // ID del admin Rubén
        );
        console.log('✅ Admin agregado a la sala de chat');
        
        chatRoom.id = roomResult.insertId;
      } catch (error) {
        console.log('❌ Error creando sala de chat:', error.message);
        return;
      }
    } else {
      console.log(`✅ Sala de chat encontrada: ${chatRoom[0].name} (ID: ${chatRoom[0].id})`);
    }

    // 7. Agregar worker a la sala de chat
    console.log('\n7️⃣ Agregando worker a la sala de chat...');
    try {
      await connection.execute(
        'INSERT INTO chat_participants (room_id, user_id, role) VALUES (?, ?, "participant")',
        [chatRoom[0].id, workerId]
      );
      console.log('✅ Worker agregado a la sala de chat');
    } catch (error) {
      console.log('❌ Error agregando worker al chat:', error.message);
    }

    // 8. Verificación final
    console.log('\n8️⃣ Verificación final...');
    const [finalAssignment] = await connection.execute(
      'SELECT * FROM project_workers WHERE project_id = ? AND worker_id = ?',
      [projectId, workerId]
    );

    if (finalAssignment.length > 0) {
      console.log('✅ Asignación verificada en la base de datos');
    } else {
      console.log('❌ La asignación no se guardó');
    }

    console.log('\n🎉 Proceso de asignación completado exitosamente');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await connection.end();
  }
}

debugAssignment();
