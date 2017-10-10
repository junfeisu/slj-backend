const jsonWebToken = require('jsonwebtoken')
const secret = 'sjf203529'

// 生成token
const generateToken = (expire = '1h') => {
    let token = jsonWebToken.sign({
        name: 'slj',
    }, secret, {
        expiresIn: expire // 过期时间
    })

    return token
}

// 验证token
const verify = (token) => {
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
    verify
}
