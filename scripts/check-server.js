#!/usr/bin/env node

const http = require('http');

function checkServer(port = 3000, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ Server is running on port ${port}`);
      console.log(`Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.error(`❌ Server not accessible on port ${port}: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(timeout, () => {
      console.error(`❌ Server timeout on port ${port} (${timeout}ms)`);
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🔍 Checking development server...');
  
  const isRunning = await checkServer(3000);
  
  if (!isRunning) {
    console.log('\n🚀 To start the server, run:');
    console.log('   npm run dev');
    console.log('\n🔄 Alternative port:');
    console.log('   npm run dev:alt  (port 3001)');
  }
}

main().catch(console.error);
