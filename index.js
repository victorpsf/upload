const http = require('http');
const fs = require('fs');
const { static } = require('./static')

const readBody = (req) => new Promise((resolve) => {
  let body = ''

  req.on('data', (chunk) => {
    if (chunk) body += chunk.toString('utf-8')
  })

  req.on('end', () => {
    try {
      req.body = JSON.parse(body);
    }

    catch (error) {
      req.body = { text: body }
    }

    resolve()
  })
})

const server = http.createServer(async (req, res) => {
  console.log(req.url)
  await readBody(req);

  switch (req.method.toUpperCase()) {
    case 'GET':
      if (static(req, res)) {
        break;
      }
      break;
    case 'POST':
      const result = JSON.stringify({
        status: 'accepted'
      })
      fs.writeFileSync(`./${req.body.name}`, Buffer.from(req.body.buffer));
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Length', result.length);

      res.statusCode = 200;
      res.write(Buffer.from(result));
      break;
    case 'PUT':
    case 'DELETE':
    default:
      res.statusCode = 404;
      break;
  }

  res.end();
  return;
});

server.listen(3000);