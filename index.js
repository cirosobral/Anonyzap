function getRandomInt(min, max) {
  return (Math.random() * (++max | 0 - min | 0) + min | 0) | 0;
}

// const deepai = require('deepai')
// deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K');

Bun.serve({
  port: 3000,
  fetch(req, server) {
    // Necessário para funcionar o WebSocket
    if (server.upgrade(req)) {
      return;
    }

    const url = new URL(req.url);

    if (url.pathname == '/')
      url.pathname = 'index.html'

    return new Response(Bun.file(`.${url.pathname}`));
  },
  websocket: {
    message(ws, message) {
      if (JSON.parse(message).message == '')
        return;

      console.log(ws, message)
      // setTimeout(async () => {
      //   try {
      //     const response = await deepai.callStandardApi("text-generator", {
      //       text: JSON.parse(message)['message'],
      //     });

      //     const msg = {
      //       'message': response.output,
      //       'time': new Date().toJSON()
      //     }

      //     ws.send(JSON.stringify(msg))

      //     console.log(msg)
      //   }
      //   catch (e) {
      //     console.log(e)
      //   }
      // }, getRandomInt(1000, 2000))
      ws.publish('chat', message)
    }, // a message is received
    open(ws) {
      console.log(ws)
      ws.subscribe('chat')
    }, // a socket is opened
    close(ws, code, message) {
      console.log(ws, code, message)
    }, // a socket is closed
    drain(ws) {
      console.log(ws)
    }, // the socket is ready to receive more data

  }
})