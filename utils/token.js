const jsonWebToken = require('jsonwebtoken')
const secretKey = 'sjf203529'

const generateToken = (expire = '1h') => {
    let token = jsonWebToken.sign({
        name: 'slj',
    }, secretKey, {
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
        let decodedToken = jsonWebToken.verify(token, secret)

        if (decodedToken.name === 'slj') {
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
