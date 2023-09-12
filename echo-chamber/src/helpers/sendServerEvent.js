export default function sendServerEvent (data, eventName = 'message') {
  try {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    };
    if (!this.raw.headersSent) {
      this.code(200);
      this.headers(headers);
      /*Server sent events don't seem to like the fastify abstraction, 
      so we need to use the raw response. */
      this.raw.writeHead(200, headers);
    }
    this.raw.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch (sseError) {
    console.error("Error sending SSE:", sseError);
    this.code(500);
    this.send("Internal Server Error");
  }
}