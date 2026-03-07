const { pool } = require('./config/database');
const { verifyPassword, hashPassword } = require('./utils/auth.utils');

async function updateAdmin() {
  try {
    // Verificar si el admin ya tiene username
    const [currentAdmin] = await pool.execute(
      'SELECT id, name, email, username FROM users WHERE role = "admin" LIMIT 1'
    );
    
    if (currentAdmin.length > 0) {
      const admin = currentAdmin[0];
      console.log('🔍 Admin actual:', admin);
      
      if (!admin.username) {
        console.log('🔝 El admin no tiene username, actualizando...');
        
        // Actualizar con username Z7416 y contraseña 7158
        const hashedPassword = await hashPassword('7158');
        
        await pool.execute(
          'UPDATE users SET username = ?, password = ? WHERE role = "admin"',
          ['Z7416', hashedPassword]
        );
        
        console.log('✅ Admin actualizado con username Z7416');
      } else {
        console.log('✅ Admin ya tiene username:', admin.username);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

updateAdmin();
