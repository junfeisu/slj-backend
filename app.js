const server = require('./server').server

server.register(require('./socket/index'), err => {
    if (err) {
        throw err
    }

    server.start(startErr => {
      if (startErr) {
        throw startErr
      }

      console.log('server is start at ' + server.info.uri)
    })
})
