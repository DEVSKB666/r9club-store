// Test script for Slip2Go QR Code Generation endpoint
const https = require('https');

// Replace with your actual API secret from the dashboard
const API_SECRET = process.env.SLIP2GO_SECRET || 'YOUR_API_SECRET_HERE';

const hosts = ['api.slip2go.com', 'app.slip2go.com', 'slip2go.com'];
const paths = ['/api/qr-payment/generate-qr-code', '/shop/api/qr-payment/generate-qr-code'];

const testPayload = {
    promptPayCode: '0902369994',
    promptPayType: 'phone_number',
    accountName: 'Test Account',
    amount: '100'
};

async function testEndpoint(hostname, path) {
    return new Promise((resolve) => {
        const data = JSON.stringify(testPayload);
        
        const options = {
            hostname,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_SECRET}`,
                'Content-Length': Buffer.byteLength(data)
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`\n[${res.statusCode}] https://${hostname}${path}`);
                console.log('Response:', body.substring(0, 300));
                resolve({ status: res.statusCode, body });
            });
        });

        req.on('error', (e) => {
            console.log(`\n[ERROR] https://${hostname}${path}: ${e.message}`);
            resolve({ status: 'ERROR', error: e.message });
        });
        
        req.on('timeout', () => {
            req.destroy();
            console.log(`\n[TIMEOUT] https://${hostname}${path}`);
            resolve({ status: 'TIMEOUT' });
        });

        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('=== Testing Slip2Go QR Code Generation ===');
    console.log('API Secret (first 20 chars):', API_SECRET.substring(0, 20) + '...');
    
    for (const host of hosts) {
        for (const path of paths) {
            await testEndpoint(host, path);
        }
    }
    
    console.log('\n=== Done ===');
}

main();
