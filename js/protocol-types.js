
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

const sendJsonData = (body) => {
  return (
    `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
  )
}

const notFoundResponse = (body) => {
  return (
    `HTTP/1.1 404 Not Found\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`

  )
}

const upgradeWebSocket = (acceptKey) => {
  return (
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
    '\r\n'
  )
}

module.exports = {
  textResponse,
  firstFunction,
  helloHtmlFunction,
  sendJsonData,
  notFoundResponse,
  upgradeWebSocket,
}