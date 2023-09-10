export default function sendServerEvent (data, eventName = 'message') {
    try {
      if (!this.raw.headersSent) {
        this.code(200);
        this.type('text/event-stream');
        this.headers({
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        });
        /*Server sent events don't seem to like the fastify abstraction, 
        so we need to use the raw response. */
        this.raw.writeHead(
          200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
          }
        );
      }
      this.raw.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (sseError) {
      console.error("Error sending SSE:", sseError);
      this.code(500);
      this.send("Internal Server Error");
    }
  }