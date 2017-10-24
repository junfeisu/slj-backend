const jsonWebToken = require('jsonwebtoken')
const secret = 'sjf203529'

const generateToken = (expire = '1h') => {
    let token = jsonWebToken.sign({
        name: 'slj',
    }, secret, {
        expiresIn: expire
    })

    return token
}

const verifyToken = (token) => {
    let result = {
        isValid: true,
        message: ''
    }

    try {
        let decoded = jsonWebToken.verify(token, secret)

        if (decoded.name === 'slj') {
            return result
        }
    } catch (err) {
        result.isValid = false
        result.message = err.message
        return result
    }
}

module.exports = {
    generateToken,
    verifyToken
}
