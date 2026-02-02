const https = require('https');

const domains = ['api.slip2go.com', 'slip2go.com', 'app.slip2go.com', 'www.slip2go.com'];
const prefixes = ['', '/api', '/v1', '/api/v1', '/api/v2'];
const paths = ['/verify-slip/qr-image/info', '/verify-slip/qr-code/info', '/verify-slip', '/verify'];

const makeRequest = (hostname, path) => {
  return new Promise((resolve) => {
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': 'dummy'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      resolve({ status: res.statusCode, hostname, path });
    });

    req.on('error', (e) => {
      resolve({ status: 'ERR', hostname, path, error: e.message });
    });
    
    req.on('timeout', () => {
        req.destroy();
        resolve({ status: 'TIMEOUT', hostname, path });
    });

    req.write(JSON.stringify({ image: 'test' }));
    req.end();
  });
};

async function run() {
  console.log('Testing Slip2Go Enpdoints...');
  for (const domain of domains) {
    for (const prefix of prefixes) {
        for (const p of paths) {
            const fullPath = (prefix + p).replace('//', '/');
            const result = await makeRequest(domain, fullPath);
            // Ignore 404 (Not Found) and 405 (Method Not Allowed - unless it's a strong indicator)
            // We want 400 (Bad Request), 401 (Unauthorized), or 200 (OK)
            // 405 on a POST usually means path exists but wrong verb, OR path doesn't exist on that server type.
            if (result.status !== 404 && result.status !== 'ERR' && result.status !== 'TIMEOUT') {
                console.log(`[POTENTIAL MATCH] ${result.status} https://${domain}${fullPath}`);
            }
        }
    }
  }
  console.log('Done.');
}

run();
