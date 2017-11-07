const token = require('../utils/token')
const notice = {
    noticeFriend: () => {},
    noticeAll: () => {}
}

exports.register = (server, options, next) => {
    const io = require('socket.io')(server.listener)
    const mapUserToSocket = {}

    io.sockets.on('connection', socket => {
        notice.noticeFriend = (type, data = null) => {
            if (socket.userInfo) {
                let friendId = socket.userInfo.friend
                if (friendId && io.sockets.connected[friendId]) {
                    data ? io.sockets.connected[friendId].emit(type, data) : io.sockets.connected[friendId].emit(type, data)
                } else {
                    console.log(type + ' friend is offline')
                }
            } else {
                console.log('user has not login')
            }
        }

        notice.noticeAll = (type, data = null) => {
            data ? io.sockets.emit(type, data) : io.sockets.emit(type)
        }

        socket.on('login', user => {
            console.log('login')
            socket.name = user.user_id
            socket.userInfo = user
            mapUserToSocket[user.user_id] = socket.id
            // 校验token并更新
            let newToken = user.token
            let verifyResult = token.verify(user.token, user.user_id)
            if (verifyResult && !verifyResult.isValid) {
                newToken = token.generate(user.user_id)
            }
            socket.emit('updateToken', user.token + '|' + user.user_id)
            
            // if a online, notice a his friend b is online
            let friendId = socket.userInfo.friend
            if (friendId && io.sockets.connected[friendId]) {
                io.sockets.connected[friendId].emit('friendOnline', socket.userInfo)
            }
        })

        socket.on('disconnect', () => {
            console.log('disconnect', socket.userInf)
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

exports.notice = notice
