const tokenOperation = require('./token')

const validateToken = (req, reply) => {
    let headers = req.headers

    if (headers.hasOwnProperty('authorization')) {
        let token = headers.authorization.split('|')[0]
        let userId = headers.authorization.split('|')[1]
        let result = tokenOperation.verify(token, userId)
        
        if (!result.isValid) {
            reply(result).code(400)
            return false
        } else {
            return true
        }
    } else {
        reply({message: 'Authorization header is need'}).code(400)
        return false
    }
}

module.exports = validateToken
