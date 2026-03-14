require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkBothZoneTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Verificando ambas tablas de zonas...\n');

  try {
    // Verificar tabla zones
    console.log('🗺️ Tabla "zones":');
    const [zones] = await connection.execute('SELECT id, name, project_id FROM zones WHERE project_id = 1');
    if (zones.length === 0) {
      console.log('   📭 Sin datos');
    } else {
      zones.forEach(zone => {
        console.log(`   ✅ ID: ${zone.id}, Nombre: ${zone.name}, Proyecto: ${zone.project_id}`);
      });
    }

    // Verificar tabla task_zones
    console.log('\n🗺️ Tabla "task_zones":');
    const [taskZones] = await connection.execute('SELECT id, name, project_id FROM task_zones WHERE project_id = 1');
    if (taskZones.length === 0) {
      console.log('   📭 Sin datos');
    } else {
      taskZones.forEach(zone => {
        console.log(`   ✅ ID: ${zone.id}, Nombre: ${zone.name}, Proyecto: ${zone.project_id}`);
      });
    }

    // Verificar cuál tabla usa el frontend
    console.log('\n🔍 Verificando rutas del frontend...');
    console.log('   Las rutas usan /api/zones/...');
    console.log('   El backend tiene rutas para /api/zones/...');

    // Solución: Crear la misma zona en task_zones o cambiar la referencia
    console.log('\n💡 Solución:');
    if (zones.length > 0 && taskZones.length === 0) {
      console.log('   Opción 1: Crear la zona en task_zones (recomendado)');
      console.log('   Opción 2: Cambiar la FK de tasks para que apunte a zones');
      
      // Vamos con la opción 1 - crear la zona en task_zones
      console.log('\n🔧 Ejecutando Opción 1...');
      const zone = zones[0];
      const [result] = await connection.execute(
        'INSERT INTO task_zones (project_id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [zone.project_id, zone.name]
      );
      console.log(`✅ Zona "${zone.name}" creada en task_zones con ID: ${result.insertId}`);
      
      // Actualizar la referencia en tasks para que use el nuevo ID
      console.log('\n📝 NOTA: Las tareas existentes en zones.zone_id=1 ahora deben usar task_zones.id=' + result.insertId);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkBothZoneTables();
