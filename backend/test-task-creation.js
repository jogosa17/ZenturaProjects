require('dotenv').config();

// Test del endpoint de creación de tareas
async function testTaskCreation() {
  try {
    console.log('🧪 Probando endpoint de creación de tareas...\n');
    
    // Primero obtener zonas para tener un zone_id válido
    console.log('1️⃣ Obteniendo zonas del proyecto 1...');
    const zonesResponse = await fetch('http://localhost:3001/api/zones/project/1', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const zonesData = await zonesResponse.json();
    console.log('Zones Status:', zonesResponse.status);
    console.log('Zones Response:', zonesData);
    
    if (zonesData.success && zonesData.data.length > 0) {
      const zoneId = zonesData.data[0].id;
      console.log(`\n2️⃣ Usando zona ID: ${zoneId} (${zonesData.data[0].name})`);
      
      // Probar creación de tarea
      console.log('\n3️⃣ Probando crear tarea...');
      const taskResponse = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zone_id: zoneId,
          name: 'Tarea de prueba',
          description: 'Descripción de prueba',
          price: 100.50,
          priority: 1
        })
      });
      
      const taskData = await taskResponse.json();
      console.log('Task Creation Status:', taskResponse.status);
      console.log('Task Creation Response:', taskData);
      
      if (taskData.success) {
        console.log('\n✅ Tarea creada exitosamente');
      } else {
        console.log('\n❌ Error creando tarea:', taskData.message);
      }
    } else {
      console.log('\n❌ No hay zonas disponibles para crear tareas');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTaskCreation();
