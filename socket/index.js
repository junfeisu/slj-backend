exports.register = (server, options, next) => {
    const io = require('socket.io')(server.listener)

    io.on('connection', socket => {
        console.log('socket connection established')
        socket.emit('test')

        socket.on('hapi', () => {
            console.log('hapi')
        })
    })

    next()
}

exports.register.attributes = {
    name: 'hapi-socket'
}
