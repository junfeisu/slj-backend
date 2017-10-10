const Joi = require('joi')
const Boom = require('boom')
const EventEmitter = require('events')
const validateToken = require('../utils/interceptor')
const articleModel = require('../schemas/articleSchema')
const commentUtil = require('../utils/commentUtil')
const getDownloadUrl = require('../utils/qiniu').down

const domain = 'http://owu5dbb9y.bkt.clouddn.com'

// 获取文章列表
let getArticleList = {
    method: 'GET',
    path: '/article/list',
    config: {
        validate: {
            query: {
                skip: Joi.number().integer().min(0).required()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let skipNum = req.query.skip
            let events = new EventEmitter()
            
            // skip一定要放在limit前面，这样的结果是limit(skipNum + limitNum)-->skip(skipNum)
            articleModel.aggregate({$sort: {article_id: -1}}, {$skip: skipNum}, {$limit: 5}, {$lookup: {
                from: 'users',
                localField: 'author',
                foreignField: 'user_id',
                as: 'user'
            }}, {$unwind: '$user'}, {$project: {
                _id: 0,
                user: {
                    user_id: 1,
                    username: 1,
                    slogan: 1,
                    birthday: 1,
                    user_icon: 1
                },
                article_id: 1,
                title: 1,
                content: 1, 
                create_date: 1,
                tags: 1
            }}, (err, result) => {
                if (err) {
                    reply(Boom.badImplementation(err.message))
                } else {
                    
                    let newResult = result.map(article => {
                        article.user.user_icon = getDownloadUrl(domain, article.user.user_icon)
                        return article
                    })
                    reply(result)
                }
            })
        }
    }
}

// 获取单个文章
let getSingleArticle = {
    method: 'GET',
    path: '/article/{articleId}',
    config: {
        validate: {
            params: {
                articleId: Joi.number().integer().min(1).required()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let events = new EventEmitter()
            let articleId = req.params.articleId

            articleModel.aggregate({$lookup: {
                from: 'users',
                localField: 'author',
                foreignField: 'user_id',
                as: 'author'
            }}, {$unwind: '$author'}, {$lookup: {
                from: 'comments',
                localField: 'article_id',
                foreignField: 'article_id',
                as: 'comments'
            }}, {$match: {article_id: articleId}}, {$project: {
                _id: 0,
                author: {
                    user_id: 1,
                    username: 1,
                    slogan: 1,
                    birthday: 1,
                    user_icon: 1
                },
                comments: 1,
                article_id: 1,
                title: 1,
                content: 1,
                tags: 1,
                create_date: 1
            }}, (err, result) => {
                if (err) {
                    reply(Boom.badImplementation(err.message))
                } else {
                    if (!result.length) {
                        reply(Boom.badRequest('article_id is not found'))
                        return
                    }

                    result[0].author.user_icon = getDownloadUrl(domain, result[0].author.user_icon)
                    
                    reply(result[0])
                }
            })
        }
    }
}

// 添加新文章
let addArticle = {
    method: 'PUT',
    path: '/article/add',
    config: {
        validate: {
            payload: {
                title: Joi.string().min(1).required(),
                content: Joi.string().min(1).required(),
                author: Joi.number().integer().min(1).required(),
                tags: Joi.array().required()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let articleInfo = req.payload

            new articleModel(articleInfo).save((err, result) => {
                if (err) {
                    reply(Boom.badImplementation(err.message))
                } else {
                    reply(result)
                }
            })
        }
    }
}

// 修改文章
let updateArticle = {
    method: 'POST',
    path: '/article/update/{articleId}',
    config: {
        validate: {
            params: {
                articleId: Joi.number().integer().min(1).required()
            },
            payload: {
                title: Joi.string().min(1),
                content: Joi.string().min(1),
                tags: Joi.array()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let articleId = req.params.articleId
            let articleInfo = req.payload

            articleModel.update({article_id: articleId}, {$set: articleInfo}, (err, result) => {
                if (err) {
                    reply(Boom.badImplementation(err.message))
                } else {
                    result.ok && result.nModified ? reply({message: '修改文章成功'}) : reply({message: '修改文章失败'})
                }
            })
        }
    }
}

// 删除文章
let removeArticle = {
    method: 'DELETE',
    path: '/article/remove/{articleId}',
    config: {
        validate: {
            params: {
                articleId: Joi.number().integer().min(1).required()
            }
        }
    },
    handler: (req, reply) => {
        if (validateToken(req, reply)) {
            let articleId = req.params.articleId
            let events = new EventEmitter()

            commentUtil.getComments(articleId, events)
            // 出现错误的处理
            events.on('Error', err => {
                reply(Boom.badImplementation(err))
            })
            // 获取该文章的评论数正常时
            events.on('getCommentsNormal', comments => {
                if (comments.length) {
                    commentUtil.deleteComments(articleId, events)
                } else {
                    events.emit('deleteArticle')
                }
            })
            // 删除该文章的评论正常时
            events.on('deleteCommentsNormal', modifiedNum => {
                if (!modifiedNum) {
                    reply(Boom.badImplementation('删除文章评论失败'))
                } else {
                    events.emit('deleteArticle')
                }
            })

            events.on('deleteArticle', () => {
                articleModel.remove({article_id: articleId}, (err, result) => {
                    if (err) {
                        reply(Boom.badImplementation(err.message))
                    } else {
                        result.result.n ? reply({message: '删除文章成功'}) : reply({message: '删除文章失败'})
                    }
                })
            })

        }
    }
}

module.exports = [getArticleList, getSingleArticle, addArticle, updateArticle, removeArticle]
