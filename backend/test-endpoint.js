require('dotenv').config();

// Test simple de conexión al endpoint
async function testAssignmentEndpoint() {
  try {
    console.log('🧪 Probando endpoint de asignaciones...');
    
    const response = await fetch('http://localhost:3001/api/assignments/projects/1/workers/available', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testAssignmentEndpoint();
