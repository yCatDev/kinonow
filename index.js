var http = require('http');

http.createServer(function (request, response) {

  response.writeHead(200, {
     'Content-Type': 'text/plain'
  });

  console.log('Example app listening on port 8080!')
  response.end('Hello HTTP!');
  console.log('Example app listening on port 8080!')
}).listen(8080);
