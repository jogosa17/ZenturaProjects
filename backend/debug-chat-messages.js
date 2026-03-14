require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugChatMessages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Diagnosticando mensajes del chat...\n');

  try {
    // Verificar mensajes recientes en el chat del proyecto 1
    console.log('📝 Mensajes recientes en chat del proyecto 1:');
    const [messages] = await connection.execute(`
      SELECT cm.id, cm.message, cm.message_type, cm.user_id, cm.created_at, u.name as user_name
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      JOIN chat_rooms cr ON cm.room_id = cr.id
      WHERE cr.project_id = 1 AND cm.is_deleted = FALSE
      ORDER BY cm.created_at DESC
      LIMIT 10
    `);

    if (messages.length === 0) {
      console.log('   📭 No hay mensajes en el chat');
    } else {
      console.log(`   📊 Total mensajes: ${messages.length}`);
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. [${msg.created_at}] ${msg.user_name}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''} (${msg.message_type})`);
      });
    }

    // Verificar si hay mensajes de sistema
    console.log('\n🤖 Mensajes de sistema (message_type = "system"):');
    const systemMessages = messages.filter(m => m.message_type === 'system');
    console.log(`   📊 Mensajes de sistema: ${systemMessages.length}`);
    systemMessages.forEach(msg => {
      console.log(`   - ${msg.created_at}: ${msg.message.substring(0, 100)}`);
    });

    // Verificar estructura de la tabla chat_messages
    console.log('\n🏗️ Estructura de chat_messages:');
    const [structure] = await connection.execute('DESCRIBE chat_messages');
    structure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

debugChatMessages();
