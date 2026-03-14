require('dotenv').config();

// Test directo del endpoint para ver el error 500
async function testDirectEndpoint() {
  try {
    console.log('🧪 Probando endpoint directamente para ver error 500...\n');
    
    // Intentar la asignación sin autenticación para ver el error exacto
    console.log('📡 Enviando petición POST a /api/assignments/projects/1/workers/11/assign');
    
    const response = await fetch('http://localhost:3001/api/assignments/projects/1/workers/11/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.status === 500) {
      console.log('\n❌ Error 500 - Error interno del servidor');
      console.log('Revisa los logs del backend para más detalles');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectEndpoint();
