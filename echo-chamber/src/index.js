import fs from 'fs';
import http2 from 'http2';
import fastify from 'fastify';
import { Observable } from 'rxjs';

export function createGqlObservable(operation) {
  return new Observable(subscriber => {});
}


const app = fastify({
  http2: true  // Enable HTTP/2
});

// Load SSL certificate and key
const options = {
  key: fs.readFileSync('path/to/your/private-key.pem'),
  cert: fs.readFileSync('path/to/your/certificate.pem')
};

// Define your routes
app.get('/', (request, reply) => {
  reply.type('text/html').send('<h1>Hello, HTTP/2 Fastify Server!</h1>');
});

// Start the server
const server = http2.createSecureServer(options, app);
server.listen(3400, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
  console.log('Server listening on port 3000');
});
