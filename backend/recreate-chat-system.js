require('dotenv').config();
const mysql = require('mysql2/promise');

async function dropAndRecreateChatTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🗑️ Eliminando tablas existentes del chat...\n');

    // Eliminar tablas en orden correcto (por foreign keys)
    await connection.execute('DROP TABLE IF EXISTS chat_notifications');
    console.log('✅ Tabla chat_notifications eliminada');
    
    await connection.execute('DROP TABLE IF EXISTS chat_messages');
    console.log('✅ Tabla chat_messages eliminada');
    
    await connection.execute('DROP TABLE IF EXISTS chat_participants');
    console.log('✅ Tabla chat_participants eliminada');
    
    await connection.execute('DROP TABLE IF EXISTS chat_rooms');
    console.log('✅ Tabla chat_rooms eliminada');

    console.log('\n🔨 Creando tablas nuevas para el sistema de chat interno...\n');

    // 1. Tabla de salas de chat (una por proyecto)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NULL,
        name VARCHAR(255) NOT NULL,
        type ENUM('project', 'general') NOT NULL DEFAULT 'project',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        INDEX idx_chat_room_project (project_id),
        INDEX idx_chat_room_type (type),
        INDEX idx_chat_room_active (is_active)
      )
    `);
    console.log('✅ Tabla chat_rooms creada');

    // 2. Tabla de participantes del chat
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('admin', 'moderator', 'participant') NOT NULL DEFAULT 'participant',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_read_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_room_user (room_id, user_id),
        INDEX idx_chat_participants_room (room_id),
        INDEX idx_chat_participants_user (user_id),
        INDEX idx_chat_participants_role (role)
      )
    `);
    console.log('✅ Tabla chat_participants creada');

    // 3. Tabla de mensajes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('text', 'file', 'system') NOT NULL DEFAULT 'text',
        file_url VARCHAR(500) NULL,
        reply_to_id INT NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reply_to_id) REFERENCES chat_messages(id) ON DELETE SET NULL,
        INDEX idx_chat_messages_room (room_id),
        INDEX idx_chat_messages_user (user_id),
        INDEX idx_chat_messages_created (created_at),
        INDEX idx_chat_messages_reply (reply_to_id),
        INDEX idx_chat_messages_type (message_type)
      )
    `);
    console.log('✅ Tabla chat_messages creada');

    // 4. Tabla de notificaciones de chat
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        room_id INT NOT NULL,
        message_id INT NOT NULL,
        type ENUM('new_message', 'mention', 'reply') NOT NULL DEFAULT 'new_message',
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
        INDEX idx_chat_notifications_user (user_id),
        INDEX idx_chat_notifications_room (room_id),
        INDEX idx_chat_notifications_message (message_id),
        INDEX idx_chat_notifications_read (is_read),
        INDEX idx_chat_notifications_created (created_at)
      )
    `);
    console.log('✅ Tabla chat_notifications creada');

    // 5. Crear salas de chat para todos los proyectos existentes
    console.log('\n🔧 Creando salas de chat para proyectos existentes...');
    
    const [projects] = await connection.execute(
      'SELECT id, name FROM projects WHERE id NOT IN (SELECT COALESCE(project_id, -1) FROM chat_rooms WHERE type = "project")'
    );

    for (const project of projects) {
      // Crear sala de chat para el proyecto
      const [roomResult] = await connection.execute(
        'INSERT INTO chat_rooms (project_id, name, type) VALUES (?, ?, ?)',
        [project.id, `Chat - ${project.name}`, 'project']
      );
      
      const roomId = roomResult.insertId;
      
      // Agregar todos los trabajadores del proyecto a la sala
      const [workers] = await connection.execute(
        'SELECT user_id FROM project_workers WHERE project_id = ?',
        [project.id]
      );
      
      for (const worker of workers) {
        await connection.execute(
          'INSERT IGNORE INTO chat_participants (room_id, user_id, role) VALUES (?, ?, ?)',
          [roomId, worker.user_id, 'participant']
        );
      }
      
      // Agregar todos los admins a todas las salas
      const [admins] = await connection.execute(
        'SELECT id FROM users WHERE role = "admin" AND status = 1'
      );
      
      for (const admin of admins) {
        await connection.execute(
          'INSERT IGNORE INTO chat_participants (room_id, user_id, role) VALUES (?, ?, ?)',
          [roomId, admin.id, 'admin']
        );
      }
      
      console.log(`✅ Sala creada para proyecto: ${project.name}`);
    }

    // 6. Crear sala general para admins
    const [generalRoom] = await connection.execute(
      'SELECT id FROM chat_rooms WHERE type = "general" LIMIT 1'
    );

    if (generalRoom.length === 0) {
      const [roomResult] = await connection.execute(
        'INSERT INTO chat_rooms (project_id, name, type) VALUES (NULL, "Chat General - Admins", "general")'
      );
      
      const generalRoomId = roomResult.insertId;
      
      // Agregar todos los admins a la sala general
      const [admins] = await connection.execute(
        'SELECT id FROM users WHERE role = "admin" AND status = 1'
      );
      
      for (const admin of admins) {
        await connection.execute(
          'INSERT IGNORE INTO chat_participants (room_id, user_id, role) VALUES (?, ?, ?)',
          [generalRoomId, admin.id, 'admin']
        );
      }
      
      console.log('✅ Sala general para admins creada');
    }

    console.log('\n🎉 Sistema de chat interno creado exitosamente');
    console.log('📊 Estadísticas:');
    
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT cr.id) as total_rooms,
        COUNT(DISTINCT cp.user_id) as total_participants,
        COUNT(DISTINCT cm.id) as total_messages
      FROM chat_rooms cr
      LEFT JOIN chat_participants cp ON cr.id = cp.room_id
      LEFT JOIN chat_messages cm ON cr.id = cm.room_id
    `);
    
    console.log(`   Salas: ${stats[0].total_rooms}`);
    console.log(`   Participantes: ${stats[0].total_participants}`);
    console.log(`   Mensajes: ${stats[0].total_messages}`);

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

dropAndRecreateChatTables();
