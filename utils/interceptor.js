const token = require('./token')

const validateToken = (req, reply) => {
    let headers = req.headers

    if (headers.hasOwnProperty('authorization')) {
        let result = token.verify(headers.authorization)
        
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
