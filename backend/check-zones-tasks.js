require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkZonesAndTasks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando zonas y tareas...\n');

  try {
    // Verificar zonas del proyecto 1
    console.log('🗺️ Zonas del proyecto 1:');
    const [zones] = await connection.execute(
      'SELECT id, name FROM zones WHERE project_id = 1'
    );
    
    if (zones.length === 0) {
      console.log('   ❌ No hay zonas en el proyecto 1');
      console.log('   💡 Debes crear una zona primero antes de poder crear tareas');
    } else {
      zones.forEach(zone => {
        console.log(`   ✅ ID: ${zone.id}, Nombre: ${zone.name}`);
      });
      
      // Verificar tareas de cada zona
      console.log('\n📝 Tareas por zona:');
      for (const zone of zones) {
        const [tasks] = await connection.execute(
          'SELECT id, name, price, status FROM tasks WHERE zone_id = ?',
          [zone.id]
        );
        
        console.log(`   Zona ${zone.name} (ID: ${zone.id}):`);
        if (tasks.length === 0) {
          console.log('     📭 Sin tareas');
        } else {
          tasks.forEach(task => {
            console.log(`     ✅ Tarea: ${task.name} (€${task.price}) - ${task.status}`);
          });
        }
      }
    }

    // Verificar estructura de la tabla tasks
    console.log('\n🏗️ Estructura de la tabla tasks:');
    const [tasksStructure] = await connection.execute('DESCRIBE tasks');
    tasksStructure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkZonesAndTasks();
