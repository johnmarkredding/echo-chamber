import fs from 'fs';
import http2 from 'http2';
import { Observable } from 'rxjs';
import Fastify from 'fastify';
const app = Fastify({
  logger: true
});


// Route for serving SSEs
app.get('/sse', (request, reply) => {
  console.log("--------------Client connected--------------------");
  // Set appropriate headers for SSEs
  reply.header('Content-Type', 'text/event-stream');
  reply.header('Cache-Control', 'no-cache');
  reply.header('Connection', 'keep-alive');
  reply.header('X-Accel-Buffering', 'no'); // Disable buffering for Nginx

  // Send initial data
  reply.send(':ok\n\n');

  // Simulate sending SSEs periodically
  const intervalId = setInterval(() => {
    const eventData = {
      event: 'message',
      data: `Message from server at ${new Date().toISOString()}`
    };

    reply.send(`event: ${eventData.event}\ndata: ${eventData.data}\n\n`);
  }, 5000); // Send data every 2 seconds

  // Clean up when the client closes the connection
  request.raw.on('close', () => {
    console.log("--------------Client closed connection--------------------");
    clearInterval(intervalId);
  });
});

// Create an HTTP/2 server using the provided SSL certificate and private key
const server = http2.createSecureServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt'),
}, app);

// Listen for the 'listening' event to handle server startup
server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening on ${address.address}:${address.port}`);
});

// Listen for the 'listening' event to handle server startup
server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening on ${address.address}:${address.port}`);
});

// Listen for the 'stream' event to handle incoming streams
server.on('stream', (stream, headers, flags) => {
  console.log("--------------Client connected--------------------");
  if (headers[':path'] === '/sse/') {
      stream.respond({
          ':status': 200,
          'content-type': 'text/event-stream'
      });
      setInterval(() => stream.write(`data: ${Math.random()}\n\n`), 2000);
      stream.on('close', () => console.log("--------------Client closed connection--------------------"));
  }
});


// Listen for the 'error' event to handle startup errors
server.on('error', (err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});

// Start the server
server.listen(process.env.PORT || 3210);