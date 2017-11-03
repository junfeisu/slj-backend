const token = require('../utils/token')

exports.register = (server, options, next) => {
    const io = require('socket.io')(server.listener)
    const mapUserToSocket = {}
    
    io.sockets.on('connection', socket => {
        socket.on('login', user => {
            console.log('login')
            socket.name = user.user_id
            socket.userInfo = user
            mapUserToSocket[user.user_id] = socket.id
            // 校验token并更新
            if (!token.verify(user.token, user.user_id).isValid) {
                let newToken = token.generate(user.user_id)
                socket.emit('updateToken', newToken)
            } else {
                socket.emit('updateToken', '')
            }

            let friendId = socket.userInfo.friend
            if (friendId && io.sockets.connected[friendId]) {
                io.sockets.connected[friendId].emit('friendOnline', socket.userInfo)
            }
        })
        
        socket.on('disconnect', () => {
            console.log('disconnect')
            delete mapUserToSocket[socket.name]
            // let friendId = socket.userInfo.friend
            // if (friendId && io.sockets.connected[friendId]) {
            //     io.sockets.connected[friendId].emit('friendOffline', socket.userInfo)
            // }
        })
    })

    next()
}

exports.register.attributes = {
    name: 'hapi-socket'
}
