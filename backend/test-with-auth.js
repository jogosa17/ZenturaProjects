require('dotenv').config();

// Test con autenticación para ver el error exacto
async function testWithAuth() {
  try {
    console.log('🧪 Probando endpoint con autenticación simulada...\n');
    
    // Primero obtener un token válido (login)
    console.log('1️⃣ Intentando login para obtener token...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'A5724', // username del admin
        password: '123456'  // contraseña por defecto
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginData);
    
    if (loginData.success && loginData.data.token) {
      const token = loginData.data.token;
      console.log('✅ Token obtenido:', token.substring(0, 20) + '...');
      
      // Ahora probar la asignación con el token
      console.log('\n2️⃣ Probando asignación con token válido...');
      const assignResponse = await fetch('http://localhost:3001/api/assignments/projects/1/workers/11/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const assignData = await assignResponse.json();
      console.log('Assign Status:', assignResponse.status);
      console.log('Assign Response:', assignData);
      
      if (!assignData.success) {
        console.log('\n❌ Error específico:', assignData.message);
      }
    } else {
      console.log('❌ No se pudo obtener token de autenticación');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWithAuth();
