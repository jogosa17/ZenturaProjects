require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkProjectsAndChat() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando proyectos existentes:');
  const [projects] = await connection.execute('SELECT id, name FROM projects ORDER BY id');
  projects.forEach(p => console.log(`   ID: ${p.id}, Nombre: ${p.name}`));

  console.log('\n🔍 Verificando salas de chat:');
  const [rooms] = await connection.execute('SELECT id, project_id, name, type FROM chat_rooms ORDER BY id');
  rooms.forEach(r => console.log(`   Sala: ${r.name}, Project ID: ${r.project_id}, Type: ${r.type}`));

  console.log('\n🔍 Verificando trabajadores por proyecto:');
  for (const project of projects) {
    const [workers] = await connection.execute('SELECT worker_id FROM project_workers WHERE project_id = ?', [project.id]);
    console.log(`   Proyecto ${project.id} (${project.name}): ${workers.length} trabajadores`);
    workers.forEach(w => console.log(`     - Worker ID: ${w.worker_id}`));
  }

  console.log('\n🔍 Verificando participantes en salas de chat:');
  for (const room of rooms) {
    const [participants] = await connection.execute('SELECT user_id, role FROM chat_participants WHERE room_id = ?', [room.id]);
    console.log(`   Sala ${room.name}: ${participants.length} participantes`);
    participants.forEach(p => console.log(`     - User ID: ${p.user_id}, Rol: ${p.role}`));
  }

  await connection.end();
}

checkProjectsAndChat();
