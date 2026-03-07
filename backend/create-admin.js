require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Creando usuario administrador...\n');
    
    // Datos del admin
    const name = 'Administrador';
    const email = 'admin@zentura.com';
    const dni = '12345678Z';
    
    // Generar username: letra del DNI + 4 números aleatorios del DNI
    const letra = dni.slice(-1); // Z
    const numerosDni = dni.slice(0, -1); // 12345678
    const numerosArray = numerosDni.split('');
    
    // Mezclar y tomar 4
    for (let i = numerosArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numerosArray[i], numerosArray[j]] = [numerosArray[j], numerosArray[i]];
    }
    const username = letra + numerosArray.slice(0, 4).join(''); // Ej: Z4829
    
    // Generar contraseña: 4 números aleatorios del DNI
    const numerosArray2 = numerosDni.split('');
    for (let i = numerosArray2.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numerosArray2[i], numerosArray2[j]] = [numerosArray2[j], numerosArray2[i]];
    }
    const password = numerosArray2.slice(0, 4).join(''); // Ej: 1823
    
    console.log('📝 Datos generados:');
    console.log('   Nombre:', name);
    console.log('   Email:', email);
    console.log('   DNI:', dni);
    console.log('   Username:', username);
    console.log('   Password:', password);
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Verificar si el email ya existe
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      // Actualizar usuario existente
      await connection.execute(
        'UPDATE users SET username = ?, dni = ?, password = ?, role = ?, status = 1 WHERE email = ?',
        [username, dni, hashedPassword, 'admin', email]
      );
      console.log('\n✅ Usuario administrador actualizado');
    } else {
      // Crear nuevo usuario
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password, role, status, dni, username) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, 'admin', 1, dni, username]
      );
      console.log('\n✅ Usuario administrador creado con ID:', result.insertId);
    }
    
    console.log('\n🔐 CREDENCIALES DE ACCESO:');
    console.log('   Usuario:', username);
    console.log('   Contraseña:', password);
    console.log('\n⚠️  GUARDA ESTAS CREDENCIALES - solo se mostrarán una vez');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();
