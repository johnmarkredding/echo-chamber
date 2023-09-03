import fs from 'fs';
import http2 from 'http2';
import { insertEcho, getEchoes } from './helpers/index.js';

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
  const routeHandlers = {
    "/": ({stream}) => {
      // For other paths, respond with a 404 status
      stream.respond({ ':status': 404 });
      stream.end('Not Found');
    },
    "/echo": ({stream, headers}) => {
      switch (headers[":method"]) {
        case 'POST': {
          let requestBody = ''; // To store the incoming data
      
          // Read incoming data from the client
          stream.on('data', (chunk) => {
            requestBody += chunk;
          });
      
          // When all data is received
          stream.on('end', () => {
            try {
              const jsonData = JSON.parse(requestBody).data;
              const newEcho = insertEcho(jsonData);
              console.log("New echo:", newEcho);
              // Respond to the client
              stream.respond({
                ':status': 200,
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'access-control-allow-origin': 'http://localhost:3000',
              });
              stream.end(JSON.stringify({data: newEcho})); // Echo the data back
            } catch (error) {
              console.error("Error parsing JSON:", error);
              stream.respond({ ':status': 400 }); // Bad request
              stream.end('Bad Request');
            }
          });
          break;
        }
        case 'OPTIONS': {
          stream.respond({
            ':status': 204, // No content
            'access-control-allow-origin': 'http://localhost:3000',
            'access-control-allow-methods': 'POST, GET, OPTIONS, PATCH, DELETE',
            'access-control-allow-headers': 'content-type'
          });
          stream.end();
          break;
        }
      }
    },
    "/events": ({stream}) => {
        // Set headers for SSE
        stream.respond({
          ':status': 200,
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          'access-control-allow-origin': '*',
        });
    
        // Send SSE at regular intervals
        const intervalId = setInterval(() => {
          const event = `data: ${JSON.stringify(getEchoes())}\n\n`;
          stream.write(event);
        }, 1000);
    
        // Close the connection when the client disconnects
        stream.on('close', () => {
          clearInterval(intervalId);
        });
    }
  }
  // Execute the corresponding function for the route
  routeHandlers[headers[":path"]]({stream, headers});
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});