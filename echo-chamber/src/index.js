import fs from 'fs';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import {FastifySSEPlugin} from "fastify-sse-v2";
import { insertEcho, getEchoes } from './helpers/index.js';

const PORT = process.env.PORT || 8443;
const HOST = process.env.HOST || 'localhost';

const app = fastify({
  http2: true,
  https: {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
  }
});

app.register(fastifyCors, {
  origin: '*',
  methods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],

});
app.register(FastifySSEPlugin);

app.get('/', (request, reply) => {
  reply.code(404);
  reply.send("Not Found");
});
app.get('/events', {}, (request, reply) => {
  reply.sse({data: JSON.stringify(getEchoes())});
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