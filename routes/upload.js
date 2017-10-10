const Joi = require('joi')
const Boom = require('boom')
const validateToken = require('../utils/interceptor')
const tokenGenerator = require('../utils/qiniu')

let getUpToken = {
    method: 'GET',
    path: '/upload/up',
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let upToken = tokenGenerator.up()
            reply({uploadToken: upToken})
        }
    }
}

let getDownloadUrl = {
    method: 'POST',
    path: '/upload/download',
    config: {
        validate: {
            payload: {
                domain: Joi.string().regex(/^http(s)?:\/\/.*/).required(),
                key: Joi.string().regex(/^.*\.(jpg|jpeg|png|gif)$/i).required()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            const { domain, key } = req.payload
            let downloadUrl = tokenGenerator.down(domain, key)
            reply({url: downloadUrl})
        }
    }
}

module.exports = [getUpToken, getDownloadUrl]
