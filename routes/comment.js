const Joi = require('joi')
const Boom = require('boom')
const commentModel = require('../schemas/commentSchema').model
const validateToken = require('../utils/interceptor')

// 添加评论
let addComment = {
    method: 'PUT',
    path: '/comment/add',
    config: {
        validate: {
            payload: {
                comment_user: Joi.number().integer().min(1).required(),
                comment_content: Joi.string().min(1).required(),
                article_id: Joi.number().integer().min(1).required()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let commentInfo = req.payload

            new commentModel(commentInfo).save((err, result) => {
                if (err) {
                    reply(Boom.badImplementation(err.message))
                } else {
                    reply(result)
                }
            })
        }
    }
}

module.exports = [addComment]
