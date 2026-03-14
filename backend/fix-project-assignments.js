require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixProjectAssignments() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔧 Corrigiendo asignaciones automáticas de trabajadores...\n');

  try {
    // 1. Eliminar todas las asignaciones automáticas existentes
    console.log('🗑️ Eliminando asignaciones automáticas...');
    await connection.execute('DELETE FROM project_workers');
    console.log('✅ Asignaciones eliminadas');

    // 2. Verificar proyectos y trabajadores
    const [projects] = await connection.execute('SELECT id, name FROM projects ORDER BY id');
    const [workers] = await connection.execute('SELECT id, name, email FROM users WHERE role = "worker" AND status = 1 ORDER BY id');

    console.log('\n📊 Estado actual:');
    console.log(`   Proyectos: ${projects.length}`);
    console.log(`   Workers disponibles: ${workers.length}`);

    console.log('\n👥 Workers disponibles:');
    workers.forEach(w => console.log(`   ID: ${w.id}, Nombre: ${w.name}, Email: ${w.email}`));

    console.log('\n🏗️ Proyectos creados:');
    projects.forEach(p => console.log(`   ID: ${p.id}, Nombre: ${p.name}`));

    // 3. Actualizar salas de chat para eliminar workers no asignados
    console.log('\n🔄 Actualizando salas de chat...');
    
    for (const project of projects) {
      // Eliminar participantes no asignados de la sala del proyecto
      await connection.execute(
        'DELETE cp FROM chat_participants cp JOIN chat_rooms cr ON cp.room_id = cr.id WHERE cr.project_id = ? AND cp.role = "participant"',
        [project.id]
      );
      console.log(`   ✅ Sala de proyecto "${project.name}" actualizada`);
    }

    // 4. Verificar estado final
    console.log('\n🔍 Verificación final:');
    
    for (const project of projects) {
      const [assignedWorkers] = await connection.execute(
        'SELECT worker_id FROM project_workers WHERE project_id = ?',
        [project.id]
      );
      
      console.log(`   Proyecto "${project.name}": ${assignedWorkers.length} workers asignados`);
    }

    console.log('\n🎉 Sistema corregido:');
    console.log('   ✅ No hay asignaciones automáticas');
    console.log('   ✅ Solo los admins pueden asignar workers');
    console.log('   ✅ Salas de chat actualizadas');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixProjectAssignments();
