import fs from 'fs';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import {
  insertEcho,
  sendServerEvent,
  createEchoStream,
  useMongoClient
} from './helpers/index.js';

const {
  PORT,
  HOST,
  DB_NAME,
  DB_COLLECTION_NAME,
  TLS_KEY_PATH,
  TLS_CERT_PATH,
  TLS_KEY_PASSPHRASE
} = process.env;

// Setup Fastify server
const app = fastify({
  http2: true,
  https: {
    key: fs.readFileSync(TLS_KEY_PATH),
    cert: fs.readFileSync(TLS_CERT_PATH),
    passphrase: TLS_KEY_PASSPHRASE
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
  reply.send('Not Found');
});

app.get('/echoes', async (request, reply) => {
  const latitude = Number(request.query.latitude);
  const longitude = Number(request.query.longitude);

  // Setup Echo subscription based on provided location
  const echoStream = await createEchoStream({latitude, longitude});
  const echoSubscription = echoStream.subscribe({
    next: (updatedEchoes) => {reply.sse(updatedEchoes)},
    error: (echoSubscriptionError) => {
      console.error(echoSubscriptionError);
      reply.sse(echoSubscriptionError, 'error');
    },
    complete: () => {console.log('No more echoes will be emitted')}
  });
  // Cleanup subscription when client is disconnected
  reply.raw.on('close', () => {echoSubscription?.unsubscribe()});
  return reply;
});

app.post('/echo', async (request, reply) => {
  try {
    const collection = useMongoClient(DB_NAME, DB_COLLECTION_NAME);
    const newEcho = await insertEcho({data: request.body.data, collection});
    // Send back the complete echo object
    reply
      .code(200)
      .headers({
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'access-control-allow-origin': '*'
      })
      .send({data: newEcho}); // Echo the data back
  } catch (parseEchoPostError) {
    console.error('Error parsing JSON:', parseEchoPostError);
    reply.code(400); // Bad request
    reply.send('Bad Request');
  }
});

// Start server
app.listen({port: PORT, host: HOST}, () => {
  console.log(`Server is listening on port ${PORT}`);
});