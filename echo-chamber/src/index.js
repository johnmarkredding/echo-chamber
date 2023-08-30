import fs from 'fs';
import http2 from 'http2';

const PORT = process.env.PORT || 8443;
const HOST = process.env.HOST || 'localhost';

const serverOptions = {
  host: HOST,
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

const server = http2.createSecureServer(serverOptions);

server.on('error', (err) => {
  console.error(err);
});

server.on('stream', (stream, headers) => {
  if (headers[":path"] === '/events') {
    // Set headers for SSE
    stream.respond({
      ':status': 200,
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'access-control-allow-origin': '*',
    });

    // Send initial message
    const initialMessage = 'data: Connected\n\n';
    stream.write(initialMessage);

    // Send SSE at regular intervals
    const intervalId = setInterval(() => {
      const event = `data: ${JSON.stringify({ message: 'Hello from server!' })}\n\n`;
      stream.write(event);
    }, 1000);

    // Close the connection when the client disconnects
    stream.on('close', () => {
      clearInterval(intervalId);
    });
  } else {
    // For other paths, respond with a 404 status
    stream.respond({ ':status': 404 });
    stream.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});