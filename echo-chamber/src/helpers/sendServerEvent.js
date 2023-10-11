const sseHeaders = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache',
  'Access-Control-Allow-Origin': '*'
};

export default function sendServerEvent (data, eventName = 'message') {
  try {
    // Can't set headers after sending the first message
    if (!this.raw.headersSent) {
      this.code(200);
      this.headers(sseHeaders);
      /*Server sent events don't seem to like the fastify abstraction, 
      so we need to use the raw response. */
      this.raw.writeHead(200, sseHeaders);
    }
    this.raw.write(`event: ${eventName}\ndata: ${JSON.stringify(data || 'No data')}\n\n`);
  } catch (sseError) {
    console.error('Error sending SSE:', sseError);
    this.code(500);
    this.send('Internal Server Error');
  }
}