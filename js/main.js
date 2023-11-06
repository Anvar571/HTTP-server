const net = require('net')
const fs = require('fs')
const path = require('path')
const port = 5000;

const Headers = require('./header')

const textResponse = (text) => {
  return (
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: text/plain\r\n' +
    `Content-Length: ${text.length}\r\n\r\n${text}`
  )
}

const firstFunction = () => {
  return (
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: text/html\r\n' +
    'Content-Length: 100\r\n' +
    '\r\n' +
    '<html><head><title>Hello World</title></head><h1>Welcome to HTTP server</h1></html >\r\n'
  )
}

const helloHtmlFunction = () => {
  return (
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: text/html\r\n' +
    'Content-Length: 100\r\n' +
    '\r\n' +
    '<html><head><title>Hello World</title></head><h1>Hello World</h1></html >\r\n'
  )
}

const fileResponse = (bytesRead, buffer) => {
  return (
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: application/octet-stream\r\n' +
    `Content-Length: ${bytesRead}\r\n\r\n${buffer}`
  )
}

const sendJsonData = (body) => {
  return (
    `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
  )
}

const fileCreatedResponse = () => {
  return (
    'HTTP/1.1 201 Created\r\n\r\n'
  )
}

const notFoundResponse = () => {
  return 'HTTP/1.1 404 Not Found\r\n\r\n'
}

const handlers = {
  '/echo': function () {
    const [, text] = this.headers.path.match(/\/echo\/(.+)/)

    this.socket.write(textResponse(text), 'utf-8')
  },
  '/user-agent': function () {
    this.socket.write(textResponse(this.headers.ua), 'utf-8')
  },
  '/files': function () {
    const [, filename] = this.headers.path.match(/\/files\/(.+)/)

    const dirFlag = process.argv.indexOf('--directory') + 1
    const directory = process.argv[dirFlag]

    const filePath = path.join(directory, filename)

    try {
      if (this.headers.method === 'GET') {
        const fd = fs.openSync(filePath, 'r')
        const contents = fs.readFileSync(fd)

        this.socket.write(fileResponse(contents.length, contents))
      } else if (this.headers.method === 'POST') {
        fs.writeFileSync(filePath, this.headers.data)
        this.socket.write(fileCreatedResponse())
      }
    } catch (error) {
      this.socket.write(notFoundResponse())
    }
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
  }
}

const getHandler = (path, handlers) => {
  const [, route] = path.split('/');
  const handlerKey = `/${route}`;

  return handlers[handlerKey];
}

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const headers = Headers.parse(data)
    const handler = getHandler(headers.path, handlers)

    if (!handler) {
      socket.write(notFoundResponse())
      socket.end();

      return;
    }

    handler.call({ socket, headers })
    socket.end()
  })

  socket.on('close', () => {
    socket.end()
  })
})

server.listen(port, 'localhost', () => {
  console.log(`Server listen on ${port} port`);
})