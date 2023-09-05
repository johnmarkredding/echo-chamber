import fs from 'fs';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { insertEcho, sendServerEvent, createEchoStream } from './helpers/index.js';
import { create } from 'domain';

const PORT = process.env.PORT || 8443;

const app = fastify({
  http2: true,
  https: {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
  }
});

app.register(fastifyCors, {
  origin: '*',
  methods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE']
});

app.decorateReply('sse', sendServerEvent);

app.get('/', (request, reply) => {
  reply.code(404);
  reply.send("Not Found");
});

app.get('/echoes', {}, (request, reply) => {
  // Extract query parameters
  const { latitude, longitude } = request.query;

  // Setup Echo subscription based on provided location
  createEchoStream({latitude, longitude})
    .subscribe({
      next: (updatedEchoes) => { reply.sse(updatedEchoes) },
      error: (echoSubscriptionError) => {
        console.error(echoSubscriptionError);
        reply.code(500);
        reply.send("Internal Server Error");
      },
      complete: () => { console.log("No more permissions changes will be emitted") }
    });
  
  
});

app.post('/echo', async (request, reply) => {
  try {
    const newEcho = insertEcho(request.body.data);

    // Send back the complete echo object
    reply
      .code(200)
      .headers({
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'access-control-allow-origin': '*',
      })
      .send({data: newEcho}); // Echo the data back
  } catch (parseEchoPostError) {
    console.error("Error parsing JSON:", parseEchoPostError);
    reply.code(400); // Bad request
    reply.send('Bad Request');
  }
});

app.listen({port: PORT}, () => {
  console.log(`Server is listening on port ${PORT}`);
});