const fs = require('fs');
const http = require('http');

// 1x1 pixel transparent PNG
const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const data = JSON.stringify({
    frontImage: dummyImage,
    backImage: dummyImage
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-pdf',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    if (res.statusCode === 200 && res.headers['content-type'] === 'application/pdf') {
        console.log('SUCCESS: API returned a PDF');
    } else {
        console.error('FAILURE: API did not return a PDF');
    }

    const chunks = [];
    res.on('data', (chunk) => {
        chunks.push(chunk);
    });

    res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`Received ${buffer.length} bytes`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
