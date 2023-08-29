import fs from 'fs';
import http2 from 'http2';

const PORT = process.env.PORT || 443;
const HOST = process.env.HOST || 'localhost';

const serverOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

const server = http2.createServer(serverOptions);

server.on('error', (err) => {
  console.error(err);
});

server.on('stream', (stream, headers) => {
  console.log("Hey");
  stream.respond({
    'content-type': 'text/html',
    ':status': 200
  });

  stream.end('<h1>Hello HTTP/2!</h1>');
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});