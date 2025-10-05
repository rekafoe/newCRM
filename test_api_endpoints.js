const http = require('http');

async function testAPIEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Заглушка для теста
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            error: 'Invalid JSON'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing API endpoints...');
  
  const endpoints = [
    '/api/notifications/stock-alerts',
    '/api/notifications/stock/check',
    '/api/notifications/telegram/config',
    '/api/notifications/telegram-users',
    '/api/notifications/telegram-users/stats'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint}...`);
      const result = await testAPIEndpoint(endpoint);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint} - OK (${result.status})`);
        if (result.data && result.data.data) {
          console.log(`   Data: ${Array.isArray(result.data.data) ? result.data.data.length + ' items' : 'object'}`);
        }
      } else if (result.status === 401) {
        console.log(`🔐 ${endpoint} - Unauthorized (${result.status}) - Expected for protected endpoint`);
      } else {
        console.log(`❌ ${endpoint} - Error (${result.status})`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        if (result.data && result.data.message) {
          console.log(`   Message: ${result.data.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Connection error: ${error.message}`);
    }
  }
}

async function main() {
  try {
    await testEndpoints();
    console.log('\n🎉 API endpoints test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main();
