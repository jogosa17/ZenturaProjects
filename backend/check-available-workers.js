require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAvailableWorkers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('👥 Verificando workers disponibles para asignación...\n');

  try {
    // 1. Verificar todos los workers activos
    console.log('📋 Workers activos en el sistema:');
    const [workers] = await connection.execute(
      'SELECT id, name, email, username FROM users WHERE role = "worker" AND status = 1 ORDER BY name'
    );
    
    if (workers.length === 0) {
      console.log('   ❌ No hay workers activos');
    } else {
      workers.forEach(w => {
        console.log(`   ✅ ID: ${w.id}, Nombre: ${w.name}, Email: ${w.email}, Username: ${w.username || 'N/A'}`);
      });
    }

    // 2. Verificar workers asignados al proyecto "El Saler"
    console.log('\n📋 Workers asignados al proyecto "El Saler":');
    const [assigned] = await connection.execute(`
      SELECT u.id, u.name, u.email, u.username
      FROM users u
      JOIN project_workers pw ON u.id = pw.worker_id
      WHERE pw.project_id = 1 AND u.role = 'worker' AND u.status = 1
      ORDER BY u.name
    `);
    
    if (assigned.length === 0) {
      console.log('   ℹ️ No hay workers asignados al proyecto');
    } else {
      assigned.forEach(w => {
        console.log(`   ✅ ID: ${w.id}, Nombre: ${w.name}, Email: ${w.email}`);
      });
    }

    // 3. Verificar workers disponibles (no asignados)
    const assignedIds = assigned.map(w => w.id);
    const available = workers.filter(w => !assignedIds.includes(w.id));
    
    console.log('\n📋 Workers disponibles para asignar:');
    if (available.length === 0) {
      console.log('   ℹ️ No hay workers disponibles (todos están asignados)');
    } else {
      available.forEach(w => {
        console.log(`   ✅ ID: ${w.id}, Nombre: ${w.name}, Email: ${w.email}`);
      });
    }

    // 4. Verificar sala de chat del proyecto
    console.log('\n💬 Sala de chat del proyecto:');
    const [chatRoom] = await connection.execute(
      'SELECT id, name FROM chat_rooms WHERE project_id = 1 AND type = "project"'
    );
    
    if (chatRoom.length > 0) {
      console.log(`   ✅ Sala: "${chatRoom[0].name}" (ID: ${chatRoom[0].id})`);
      
      // Verificar participantes en la sala
      const [participants] = await connection.execute(`
        SELECT u.id, u.name, u.role
        FROM chat_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.room_id = ?
      `, [chatRoom[0].id]);
      
      console.log('   Participantes:');
      participants.forEach(p => {
        console.log(`   - ${p.name} (${p.role})`);
      });
    } else {
      console.log('   ❌ No hay sala de chat para el proyecto');
    }

    console.log('\n🎯 Resumen para el admin:');
    console.log(`   - Workers totales: ${workers.length}`);
    console.log(`   - Workers asignados: ${assigned.length}`);
    console.log(`   - Workers disponibles: ${available.length}`);
    
    if (available.length > 0) {
      console.log('\n✅ El admin debería ver estos workers disponibles en la interfaz:');
      available.forEach(w => {
        console.log(`   👤 ${w.name} (${w.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAvailableWorkers();
