export default function (data) {
    try {
      this.code(200);
      this.type('text/event-stream');
      this.headers({
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
  
      this.raw.writeHead(
        200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      );
  
      this.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (sseError) {
      console.error("Error sending SSE:", sseError);
      this.code(500);
      this.send("Internal Server Error");
    }
  }