const { pool } = require('./config/database');

async function deleteZ7416() {
  try {
    // Eliminar el usuario con username Z7416
    const [result] = await pool.execute(
      'DELETE FROM users WHERE username = ?',
      ['Z7416']
    );
    
    console.log(`🗑️ Usuario Z7416 eliminado. Filas afectadas: ${result.affectedRows}`);
    
    if (result.affectedRows > 0) {
      console.log('⚠️ No se encontró el usuario Z7416');
    }
    
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
  } finally {
    process.exit(0);
  }
}

deleteZ7416();
