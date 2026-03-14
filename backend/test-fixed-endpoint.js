require('dotenv').config();

// Test del endpoint corregido
async function testFixedEndpoint() {
  try {
    console.log('🧪 Probando endpoint corregido...\n');
    
    // Primero obtener workers disponibles
    console.log('1️⃣ Obteniendo workers disponibles...');
    const availableResponse = await fetch('http://localhost:3001/api/assignments/projects/1/workers/available', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const availableData = await availableResponse.json();
    console.log('Status:', availableResponse.status);
    console.log('Response:', availableData);
    
    if (availableData.success && availableData.data.available.length > 0) {
      const workerToAssign = availableData.data.available[0];
      console.log(`\n2️⃣ Intentando asignar worker: ${workerToAssign.name} (ID: ${workerToAssign.id})`);
      
      // Intentar asignar worker (esto debería funcionar ahora)
      console.log('\n3️⃣ Probando asignación con endpoint corregido...');
      const assignResponse = await fetch(`http://localhost:3001/api/assignments/projects/1/workers/${workerToAssign.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const assignData = await assignResponse.json();
      console.log('Status:', assignResponse.status);
      console.log('Response:', assignData);
      
      if (assignData.success) {
        console.log('\n✅ Asignación exitosa con el endpoint corregido');
      } else {
        console.log('\n❌ Error en asignación:', assignData.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFixedEndpoint();
