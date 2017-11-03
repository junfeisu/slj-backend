const jsonWebToken = require('jsonwebtoken')
const secret = 'sjf203529'

const generateToken = (expire = '24h', userId) => {
    let token = jsonWebToken.sign({
        name: userId,
    }, secret, {
        expiresIn: expire
    })

    return token
}

const verifyToken = (token, userId) => {
    let result = {
        isValid: true,
        message: ''
    }

    try {
        let decodedToken = jsonWebToken.verify(token, secret)

        if (decodedToken.name === userId) {
            return result
        }
    } catch (err) {
        result.isValid = false
        result.message = err.message
        return result
    }
}

module.exports = {
    generate: generateToken,
    verify: verifyToken
}
