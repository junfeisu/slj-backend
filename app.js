const server = require('./server').server

server.register(require('./socket/index'), err => {
    if (err) {
        console.log('register socket error')
        throw err
    }

    server.start(err => {
      if (err) {
        console.log('server start err is ' + err)
        throw err
      }

      console.log('server is start at ' + server.info.uri)
    })
})

