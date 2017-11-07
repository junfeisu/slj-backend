const token = require('../utils/token')
const notice = {
    noticeFriend: () => {},
    noticeAll: () => {}
}

exports.register = (server, options, next) => {
    const io = require('socket.io')(server.listener)
    const mapUserToSocket = {}

    io.sockets.on('connection', socket => {
        notice.noticeFriend = () => {
            return (type, data = null) => {
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
        }

        notice.noticeAll = () => {
            return (type, data = null) => {
                if (data) {
                    io.sockets.emit(type, data)
                } else {
                    io.sockets.emit(type)
                }
            }
        }

        socket.on('login', user => {
            console.log('login')
            socket.name = user.user_id
            socket.userInfo = user
            mapUserToSocket[user.user_id] = socket.id
            // 校验token并更新
            let verifyResult = token.verify(user.token, user.user_id)
            if (verifyResult && !verifyResult.isValid) {
                let newToken = token.generate(user.user_id)
                socket.emit('updateToken', newToken + '|' + user.user_id)
            } else {
                socket.emit('updateToken', user.token + '|' + user.user_id)
            }
            
            // if a online, notice a his friend b is online
            let friendId = socket.userInfo.friend
            if (friendId && io.sockets.connected[friendId]) {
                io.sockets.connected[friendId].emit('friendOnline', socket.userInfo)
            }
        })

        socket.on('disconnect', () => {
            console.log('disconnect')
            console.log('clientUser', socket.userInfo)
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
