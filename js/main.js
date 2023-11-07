const { firstFunction, helloHtmlFunction, notFoundResponse, sendJsonData, textResponse, upgradeWebSocket } = require('./protocol-types');
const Headers = require('./header')
const net = require('net')
const fs = require('fs')
const path = require('path')
const port = 5000;
const crypto = require('crypto');

const handlers = {
  '/echo': function () {
    const text = 'lorem ipsum';
    this.socket.write(textResponse(text), 'utf-8')
  },
  '/user-agent': function () {
    this.socket.write(textResponse(this.headers.ua), 'utf-8')
  },
  '/': function () {
    this.socket.write(firstFunction(), 'utf-8')
  },
  '/hello': function () {
    this.socket.write(helloHtmlFunction());
  },
  '/json': function () {
    const data = {
      name: 'lorem',
      age: 22,
      lastname: 'ipsum'
    };
    const jsonData = JSON.stringify(data);
    this.socket.write(sendJsonData(jsonData));
  },
  '/wss': function () {
    const acceptKey = getWebSocketAcceptKey(request);

    const responseHeaders = upgradeWebSocket(acceptKey);
    console.log('ws', responseHeaders);

    this.socket.write(responseHeaders);
  }
}

const getHandler = (path, handlers) => {
  const [, route] = path.split('/');
  const handlerKey = `/${route}`;

  return handlers[handlerKey];
}

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const headers = Headers.parse(data);
    const handler = getHandler(headers.path, handlers);
    const request = data.toString();

    // websocket communication
    if (request.includes('Upgrade: websocket')) {
      const acceptKey = getWebSocketAcceptKey(request);

      const responseHeaders = upgradeWebSocket(acceptKey);
      console.log('ws', responseHeaders);

      socket.write(responseHeaders);

      handleWebSocketCommunication(socket);
    } else {
      // rest api
      if (!handler) {
        const body = {
          status: 404,
          message: 'Not found endpoint'
        };
        const jsonData = JSON.stringify(body);
        socket.write(notFoundResponse(jsonData))
        socket.end();

        return;
      }

      handler.call({ socket, headers })
      socket.end()
    }
  })

  socket.on('close', () => {
    socket.end()
  })
})

function getWebSocketAcceptKey(request) {
  const key = request.match(/Sec-WebSocket-Key: (.+)/)[1].trim();
  const secret = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const hash = crypto.createHash('sha1').update(key + secret).digest('base64');
  return hash;
}

function handleWebSocketCommunication(socket) {
  console.log('web socket');
  const clients = [];
  clients.push(socket);
  clients.forEach((val) => {
    val.write('connection successfully');
  })
}

server.listen(port, 'localhost', () => {
  console.log(`Server listen on ${port} port`);
})