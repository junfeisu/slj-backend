const crypto = require('crypto')

const cryptic = input => crypto.createHash('sha1')
        .update(input)
        .digest('hex')

module.exports = cryptic
