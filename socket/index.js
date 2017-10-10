const server = require('../server').server
const io = require('socket.io')(server)

io.on('connection', socket => {
    sokcet.emit('test')

    socket.on('hapi', () => {
        console.log('hapi')
    })
})
