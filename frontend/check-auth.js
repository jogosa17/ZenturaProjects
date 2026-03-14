// Script para verificar autenticación en el frontend
console.log('🔍 Verificando estado de autenticación...\n');

// Verificar si hay token en localStorage
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('📋 Estado de localStorage:');
console.log(`   Token: ${token ? '✅ Existe' : '❌ No existe'}`);
console.log(`   User: ${user ? '✅ Existe' : '❌ No existe'}`);

if (token) {
  console.log(`   Token length: ${token.length} caracteres`);
  console.log(`   Token preview: ${token.substring(0, 20)}...`);
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log(`   User data: ${userData.name} (${userData.role})`);
  } catch (error) {
    console.log('   ❌ Error parseando user data');
  }
}

// Verificar si estamos en la página correcta
console.log(`\n🌐 Página actual: ${window.location.pathname}`);
console.log(`   URL completa: ${window.location.href}`);

// Probar conexión al backend
console.log('\n🔗 Probando conexión al backend...');
fetch('http://localhost:3001/api/test')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend accesible:', data.message);
  })
  .catch(error => {
    console.log('❌ Error conectando al backend:', error.message);
  });

// Probar endpoint de asignaciones sin token
console.log('\n🔓 Probando endpoint de asignaciones (sin token)...');
fetch('http://localhost:3001/api/assignments/projects/1/workers/available')
  .then(response => response.json())
  .then(data => {
    console.log('Response sin token:', data);
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
  });

// Si hay token, probar con autenticación
if (token) {
  console.log('\n🔑 Probando endpoint de asignaciones (con token)...');
  fetch('http://localhost:3001/api/assignments/projects/1/workers/available', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Response con token:', data);
  })
  .catch(error => {
    console.log('❌ Error con token:', error.message);
  });
}
