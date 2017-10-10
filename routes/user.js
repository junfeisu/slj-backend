const Boom = require('boom')
const Joi = require('joi')
const cryptic = require('../utils/cryptic')
const userModel = require('../schemas/userSchema')
const token = require('../utils/token')
const validateToken = require('../utils/interceptor')
const getDownloadUrl = require('../utils/qiniu').down

const returnInfo = {
    _id: 0,
    username: 1,
    user_id: 1,
    birthday: 1,
    user_icon: 1,
    slogan: 1
}

// 获取用户信息
let getUser = {
    method: 'GET',
    path: '/user/{user_id}',
    config: {
        validate: {
            params: {
                user_id: Joi.number().integer().min(1).required()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let userId = req.params.user_id
            let matchInfo = {
                user_id: userId
            }

            userModel.aggregate([{$match: matchInfo}, {$project: returnInfo}], (err, result) => {
                if (err) {
                    reply(Boom.badImplementation(err.message))
                } else {
                    if (result.length) {
                        reply(result[0])
                    } else {
                        reply({message: 'user_id is not exist'}).code(400)
                    }
                }
            })
        }
    }
}

// 新增用户
let addUser = {
    method: 'PUT',
    path: '/user/add',
    config: {
        validate: {
            payload: {
                username: Joi.string().min(1).required(),
                password: Joi.string().min(6).required(),
                slogan: Joi.string().min(1),
                user_icon: Joi.string().regex(/^.+\.(jpg|jpeg|png|gif)$/),
                birthday: Joi.string().regex(/^(19[0-9]{2}|20[0-1][0-7])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)
            }
        }
    },
    handler: (req, reply) => {
        let userInfo = req.payload
        userInfo.password = cryptic(userInfo.password)

        new userModel(userInfo).save((err, result) => {
            if (err) {
                reply(Boom.badImplementation(err.message))
            } else {
                delete result._doc.password
                delete result._doc._id
                reply(result._doc)
            }
        })
    }
}

// 修改用户信息
let updateUser = {
    method: 'POST',
    path: '/user/update/{user_id}',
    config: {
        validate: {
            params: {
                user_id: Joi.number().integer().min(1).required()
            },
            payload: {
                username: Joi.string().min(1),
                slogan: Joi.string().min(1),
                user_icon: Joi.string().regex(/^.+\.(jpg|jpeg|png|gif)$/),
                birthday: Joi.string().regex(/^(19[0-9]{2}|20[0-1][0-7])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let userId = req.params.user_id
            let modifiedInfo = req.payload

            userModel.update({user_id: userId}, {$set: modifiedInfo}, (err, result) => {
                if (err) {
                    reply(Boom.badImplementation(err.message))
                } else {
                    result.ok ? reply({message: '更改信息成功'}) : reply({message: '更改信息失败'})
                }
            })
        }
    }
}

// 用户登录
let loginUser = {
    method: 'POST',
    path: '/user/login',
    config: {
        validate: {
            payload: {
                username: Joi.string().min(1).required(),
                password: Joi.string().min(6).required()
            }
        }
    },
    handler: (req, reply) => {
        let userInfo = req.payload
        userInfo.password = cryptic(userInfo.password)

        userModel.find({username: userInfo.username}, (err, result) => {
            if (err) {
                reply(Boom.badImplementation(err.message))
            } else {
                if (result.length) {
                    for (let i = 0, userLen = result.length; i < userLen; i++) {
                        if (result[i].password === userInfo.password) {
                            delete result[i]._doc.password
                            delete result[i]._doc._id
                            if (result[i]._doc.user_icon) {
                                let domain = 'http://owu5dbb9y.bkt.clouddn.com'
                                result[i]._doc.user_icon = getDownloadUrl(domain, result[i]._doc.user_icon)
                            }
                            result[i]._doc['token'] = process.env.NODE_ENV === 'test' ? token.generateToken('2s') : token.generateToken()
                            reply(result[i]._doc)
                            return
                        }
                    }
                    reply(Boom.forbidden('password is not right'))
                } else {
                    reply(Boom.badRequest('user has not register'))
                }
            }
        })
    }
}

// 更改密码
let updatePassword = {
    method: 'POST',
    path: '/user/password',
    config: {
        validate: {
            payload: {
                user_id: Joi.number().integer().min(1).required(),
                oldPassword: Joi.string().min(6).required(),
                newPassword: Joi.string().min(6).required()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            const { user_id, oldPassword, newPassword } = req.payload
            if (newPassword === oldPassword) {
                reply(Boom.badRequest('新旧密码不能相同'))
            } else {
                let searchInfo = {
                    user_id: user_id,
                    password: cryptic(oldPassword)
                }
                userModel.update(searchInfo, {$set: {password: cryptic(newPassword)}}, (err, result) => {
                    if (result.n) {
                        result.nModified ? reply({message: '修改密码成功，请重新登录'}) : reply({message: '修改密码失败'})
                    } else {
                        reply(Boom.badRequest('旧密码输入不正确'))
                    }
                })
            }
        }
    }
}

module.exports = [getUser, addUser, updateUser, loginUser, updatePassword]
