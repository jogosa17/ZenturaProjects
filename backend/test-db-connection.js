const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { testConnection } = require('./config/database');

async function testDatabaseConnection() {
  console.log('Probando conexión a la base de datos...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Usuario:', process.env.DB_USER);
  console.log('Base de datos:', process.env.DB_NAME);
  console.log('Puerto:', process.env.DB_PORT);
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Conexión exitosa a la base de datos MySQL');
  } else {
    console.log('❌ Error al conectar a la base de datos');
  }
  
  process.exit(0);
}

testDatabaseConnection();
