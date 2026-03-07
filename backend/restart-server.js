const { spawn } = require('child_process');

console.log('🔄 Reiniciando servidor backend...');

const server = spawn('node', ['index.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('close', (code) => {
  console.log(`Servidor detenido con código ${code}`);
  setTimeout(() => {
    console.log('🔄 Reiniciando...');
    require('child_process').spawn('node', ['restart-server.js'], {
      stdio: 'inherit',
      cwd: __dirname,
      detached: true
    }).unref();
  }, 1000);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  server.kill('SIGINT');
  process.exit(0);
});
