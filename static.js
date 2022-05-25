const fs = require('fs')

const reader = function (mime) {
  return function (req, res) {
    try {
      const buffer = fs.readFileSync(`./public${req.url}`)
      let mimeType = ''

      switch (mime) {
        case 'html': mimeType = 'text/html';                break;
        case 'js':   mimeType = 'application/javascript';   break;
        case 'css':  mimeType = 'text/css';                 break;
        default:     mimeType = 'application/octet-stream'; break;
      }

      res.statusCode = 200;
      res.setHeader('Content-Length', buffer.byteLength);
      res.setHeader('Content-Type', mimeType);
      res.write(buffer);
    }
    
    catch (error) {
      const date = new Date();
      fs.appendFileSync(`./log/${date.toLocaleDateString('pt-br').replace(/\/|\-/g, '')}.log`, JSON.stringify({
        mode: mime,
        func: 'static',
        text: error.toString()
      }));
      res.statusCode = 404;
    }
  }
}

exports.static = function (req, res) {
  this.__html = () => ({
    is: /\/html\/.*\.html$/g.test(req.url),
    caller: reader('html')
  })

  this.__js = () => ({
    is: /\/js\/.*\.js$/g.test(req.url),
    caller: reader('js')
  })

  this.__css = () => ({
    is: /\/css\/.*\.css$/g.test(req.url),
    caller: reader('css')
  })

  for (const key of Object.keys(this)) {
    if ((key.substring(0, 2) == '__') == false) continue;
    const { is, caller } = this[key]();

    if (is == false) continue;
    caller(req, res);
    return true;
  }

  return false;
}