const Lab = require('lab')
const lab = exports.lab = Lab.script()
const { describe, it, before, after } = lab
const expect = require('chai').expect
const Hapi = require('hapi')
const server = require('../server').server
const articleModel = require('../schemas/articleSchema')
const userModel = require('../schemas/userSchema')
const commentModel = require('../schemas/commentSchema').model
const testUtils = require('../utils/testUtil')
const cryptic = require('../utils/cryptic')

// 测试用户信息
const testUserInfo = {
    user_id: '1',
    username: 'testcomment',
    password: 'comment'
}

// 登录测试用户比返回Promise
const login = () => {
    const loginInfo = {
        method: 'POST',
        url: '/user/login',
        payload: {
            username: testUserInfo.username,
            password: testUserInfo.password
        }
    }
    return new Promise((resolve, reject) => {
        server.inject(loginInfo, response => {
            resolve(response.result)
        })
    })
}

// 添加测试文章并返回Promise
const addArticle = (articleInfo) => {
    return new Promise((resolve, reject) => {
        new articleModel(articleInfo).save((err, result) => {
            err ? reject(err) : resolve(result)
        })
    })
}

// 测试添加评论API
describe('test add comment', () => {
    const options = {
        method: 'PUT',
        url: '/comment/add',
        payload: {}
    }

    const testArticleInfo = {
        title: 'test comment',
        content: 'this is test',
        author: 1,
        tags: ['test', 'add']
    }

    before(done => {
        let copyUserInfo = Object.assign({}, testUserInfo, {password: cryptic(testUserInfo.password)})
        new userModel(copyUserInfo).save((err, result) => {
            done()
        })
    })

    it('should return 400, article_id is need', done => {
        login()
            .then(user => {
                options.headers = {
                    Authorization: user.token
                }
                options.payload = {
                    comment_user: user.user_id,
                    comment_content: 'this is test'
                }

                server.inject(options, response => {
                    let badRequestMessage = 'child \"article_id\" fails because [\"article_id\" is required]'
                    testUtils.badRequest(response, badRequestMessage)
                    done()
                })
            })
    })

    it('should return 400, article_id is not a number', done => {
        options.payload.article_id = {value: '1'}
        server.inject(options, response => {
            let badRequestMessage = 'child \"article_id\" fails because [\"article_id\" must be a number]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, article_id is not an integer', done => {
        options.payload.article_id = '1.1'
        server.inject(options, response => {
            let badRequestMessage = 'child \"article_id\" fails because [\"article_id\" must be an integer]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, article_id is less than 1', done => {
        options.payload.article_id = '0'
        server.inject(options, response => {
            let badRequestMessage = 'child \"article_id\" fails because [\"article_id\" must be larger than or equal to 1]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, comment_user is need', done => {
        options.payload.article_id = '1'
        delete options.payload.comment_user

        server.inject(options, response => {
            let badRequestMessage = 'child \"comment_user\" fails because [\"comment_user\" is required]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, comment_user is not a number', done => {
        options.payload.comment_user = {value: '1'}

        server.inject(options, response => {
            let badRequestMessage = 'child \"comment_user\" fails because [\"comment_user\" must be a number]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, comment_user is not an integer', done => {
        options.payload.comment_user = '1.1'

        server.inject(options, response => {
            let badRequestMessage = 'child \"comment_user\" fails because [\"comment_user\" must be an integer]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, comment_user is less than 1', done => {
        options.payload.comment_user = '0'

        server.inject(options, response => {
            let badRequestMessage = 'child \"comment_user\" fails because [\"comment_user\" must be larger than or equal to 1]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, comment_content is need', done => {
        login()
            .then(user => {
                options.payload.comment_user = user.user_id
                testArticleInfo.author = user.user_id
                delete options.payload.comment_content

                server.inject(options, response => {
                    let badRequestMessage = 'child \"comment_content\" fails because [\"comment_content\" is required]'
                    testUtils.badRequest(response, badRequestMessage)
                    done()
                })
            })
    })

    it('should return 400, comment_content is not a string', done => {
        options.payload.comment_content = {value: 'this is test'}

        server.inject(options, response => {
            let badRequestMessage = 'child \"comment_content\" fails because [\"comment_content\" must be a string]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, comment_content length is less than 1', done => {
        options.payload.comment_content = ''

        server.inject(options, response => {
            let badRequestMessage = 'child \"comment_content\" fails because [\"comment_content\" is not allowed to be empty]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 200, return comment info', done => {
        addArticle(testArticleInfo)
            .then(article => {
                options.payload.article_id = article.article_id
                options.payload.comment_content = 'this is test'
                server.inject(options, response => {
                    expect(response).to.have.property('statusCode', 200)
                    expect(response).to.have.property('result')
                    expect(response.result).to.have.property('comment_user', options.payload.comment_user)
                    expect(response.result).to.have.property('comment_content', options.payload.comment_content)
                    expect(response.result).to.have.property('article_id', options.payload.article_id)
                    done()
                })
            })
            .catch(done)
    })

    after(done => {
        userModel.remove({username: 'testcomment'}, (err, result) => {
            done()
        })
    })
})