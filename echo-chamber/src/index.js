import fs from 'fs';
import fastify from 'fastify';
import { startWith } from 'rxjs';
import fastifyCors from '@fastify/cors';
import {
  insertEcho,
  sendServerEvent,
  createEchoStream,
  useMongoClient
} from './helpers/index.js';

const {
  PORT,
  DB_NAME,
  DB_COLLECTION_NAME
} = process.env;

// Setup Fastify server
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

// Routes
app.get('/', (request, reply) => {
  reply.code(404);
  reply.send("Not Found");
});

app.get('/echoes', {}, (request, reply) => {
  const { latitude, longitude } = request.query;
  // Setup Echo subscription based on provided location
  const echoSubscription = createEchoStream({latitude, longitude})
    .subscribe({
      next: (updatedEchoes) => { reply.sse(updatedEchoes) },
      error: (echoSubscriptionError) => {
        console.error(echoSubscriptionError);
        reply.sse(echoSubscriptionError, "close");
      },
      complete: () => { console.log("No more echoes will be emitted") }
    });
  // Cleanup subscription when client disconnects
  reply.raw.on('close', () => {
    echoSubscription.unsubscribe();
  });
});

app.post('/echo', async (request, reply) => {
  try {
    const collection = useMongoClient(DB_NAME, DB_COLLECTION_NAME);
    const newEcho = insertEcho({ data: request.body.data, collection});

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

// Start server
app.listen({port: PORT}, () => {
  console.log(`Server is listening on port ${PORT}`);
});