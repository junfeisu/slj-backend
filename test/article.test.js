const Lab = require('lab')
const lab = exports.lab = Lab.script()
const { describe, it, before, after } = lab
const expect = require('chai').expect
const Hapi = require('hapi')
const server = require('../server').server
const articleModel = require('../schemas/articleSchema')
const userModel = require('../schemas/userSchema')
const testUtils = require('../utils/testUtil')
const cryptic = require('../utils/cryptic')

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
const addArticle = (articleInfo, token) => {
    const addArticleOptions = {
        method: 'PUT',
        url: '/article/add',
        payload: articleInfo,
        headers: {
            Authorization: token
        }
    }

    return new Promise((resolve, reject) => {
        server.inject(addArticleOptions, response => {
            resolve(response.result)
        })
    })
}

// 每个API测试之前的操作
const beforeTestOperations = (testUserInfo) => {
    before(done => {
        let copyUserInfo = Object.assign({}, testUserInfo, {password: cryptic(testUserInfo.password)})
        new userModel(copyUserInfo).save((err, result) => {
            done()
        })
    })
}

// 每个API测试之后的操作
const afterTestOperations = () => {
    after(done => {
        userModel.remove({username: 'testarticle'}, (err, result) => {
            done()
        })
    })
}

// 测试用户信息
const testUserInfo = {
    user_id: '1',
    username: 'testarticle',
    password: 'article'
}

// 文章参数的检测
const articleParamCheck = {
    articleId (options, testArticleInfo, subPath) {
        it('should return 404, articleId is need', done => {
            login()
                .then(user => {
                    options.headers = {
                        Authorization: user.token
                    }
                    testArticleInfo.author = user.user_id

                    server.inject(options, response => {
                        testUtils.notFound(response)
                        done()
                    })
                })
                .catch(done)
        })

        it('should return 400, articleId is not a number', done => {
            options.url += subPath ? subPath + '/ss' : 'ss'
            server.inject(options, response => {
                let badRequestMessage = 'child \"articleId\" fails because [\"articleId\" must be a number]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, articleId is not a integer', done => {
            options.url = subPath ? '/article/' + subPath + '/1.1' : '/article/1.1'
            server.inject(options, response => {
                let badRequestMessage = 'child \"articleId\" fails because [\"articleId\" must be an integer]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, articleId is less than 1', done => {
            options.url = subPath ? '/article/' + subPath + '/0' : '/article/0'
            server.inject(options, response => {
                let badRequestMessage = 'child \"articleId\" fails because [\"articleId\" must be larger than or equal to 1]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    title (options, isNeed) {
        it('should return 400, title is need', done => {
            login()
                .then(userInfo => {
                    options.payload = {
                        content: 'this is test',
                        tags: ['add', 'test'],
                        author: userInfo.user_id
                    }
                    options.headers = {
                        Authorization: userInfo.token
                    }

                    if (isNeed) {
                        server.inject(options, response => {
                            let badRequestMessage = 'child \"title\" fails because [\"title\" is required]'
                            testUtils.badRequest(response, badRequestMessage)
                            done()
                        })
                    } else {
                        done()
                    }
                })
                .catch(done)
        })

        it('should return 400, title is not a string', done => {
            options.payload.title = {value: 'testarticle'}
            server.inject(options, response => {
                let badRequestMessage = 'child \"title\" fails because [\"title\" must be a string]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, title length less than 1', done => {
            options.payload.title = ''
            server.inject(options, response => {
                let badRequestMessage = 'child \"title\" fails because [\"title\" is not allowed to be empty]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    content (options, isNeed) {
        it('should return 400, content is need', done => {
            if (isNeed) {
                delete options.payload.content
                options.payload.title = 'test'

                server.inject(options, response => {
                    let badRequestMessage = 'child \"content\" fails because [\"content\" is required]'
                    testUtils.badRequest(response, badRequestMessage)
                    done()
                })
            } else {
                done()
            }
        })

        it('should return 400, content is not a string', done => {
            options.payload.content = {value: 'testarticle'}
            server.inject(options, response => {
                let badRequestMessage = 'child \"content\" fails because [\"content\" must be a string]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, content length less than 1', done => {
            options.payload.content = ''
            server.inject(options, response => {
                let badRequestMessage = 'child \"content\" fails because [\"content\" is not allowed to be empty]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    author (options, isNeed) {
        it('should return 400, author is need', done => {
            if (isNeed) {
                delete options.payload.author
                options.payload.content = 'this is test'

                server.inject(options, response => {
                    let badRequestMessage = 'child \"author\" fails because [\"author\" is required]'
                    testUtils.badRequest(response, badRequestMessage)
                    done()
                })
            } else {
                done()
            }
        })

        it('should return 400, author is not a number', done => {
            options.payload.author = {value: '1'}
            server.inject(options, response => {
                let badRequestMessage = 'child \"author\" fails because [\"author\" must be a number]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, author is not a integer', done => {
            options.payload.author = '1.1'
            server.inject(options, response => {
                let badRequestMessage = 'child \"author\" fails because [\"author\" must be an integer]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, author less than 1', done => {
            options.payload.author = '0'
            server.inject(options, response => {
                let badRequestMessage = 'child \"author\" fails because [\"author\" must be larger than or equal to 1]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    tags (options, isNeed) {
        it('should return 400, tags is need', done => {
            login()
                .then(userInfo => {
                    if (isNeed) {
                        options.payload.author = userInfo.user_id
                        delete options.payload.tags

                        server.inject(options, response => {
                            let badRequestMessage = 'child \"tags\" fails because [\"tags\" is required]'
                            testUtils.badRequest(response, badRequestMessage)
                            done()
                        })
                    } else {
                        done()
                    }
                })
                .catch(done)
        })

        it('should return 400, tags is not an array', done => {
            options.payload.tags = {name: 'test'}

            server.inject(options, response => {
                let badRequestMessage = 'child "tags" fails because ["tags" must be an array]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    }
}

// 在所有测试之前先删除以前的测试文章
describe('remove article before test', () => {
    before(done => {
        articleModel.remove({content: 'this is test'}, (err, result) => {
            done()
        })
    })
})

// 测试新增文章
describe('test add article', () => {
    const options = {
        method: 'PUT',
        url: '/article/add',
        payload: {}
    }

    beforeTestOperations(testUserInfo)

    articleParamCheck.title(options, true)
    articleParamCheck.content(options, true)
    articleParamCheck.author(options, true)
    articleParamCheck.tags(options, true)

    it('should return 200, return right info', done => {
        options.payload.tags = ["test", "add"]

        server.inject(options, response => {
            expect(response).to.have.property('statusCode', 200)
            expect(response).to.have.property('result')
            expect(response.result).to.have.property('article_id')
            expect(response.result).to.have.property('create_date')
            expect(response.result).to.have.property('title', options.payload.title)
            expect(response.result).to.have.property('content', options.payload.content)
            expect(response.result.tags).to.deep.equal(options.payload.tags)
            expect(response.result).to.have.property('author', options.payload.author)
            done()
        })
    })

    afterTestOperations()
})

// 测试获得单个文章
describe('test get single article', () => {
    const options = {
        method: 'GET',
        url: '/article/'
    }

    const testArticleInfo = {
        title: 'test add',
        content: 'this is test',
        author: 1,
        tags: ['test', 'add']
    }

    beforeTestOperations(testUserInfo)

    articleParamCheck.articleId(options, testArticleInfo)

    it('should return 200, return right info', done => {
        addArticle(testArticleInfo, options.headers.Authorization)
            .then(article => {
                options.url = '/article/' + article.article_id
                server.inject(options, response => {
                    expect(response).to.have.property('statusCode', 200)
                    expect(response).to.have.property('result')
                    expect(response.result).to.have.property('comments')
                    expect(response.result).to.have.property('author')
                    expect(response.result.author.user_id).to.equal(testArticleInfo.author)
                    expect(response.result).to.have.property('create_date')
                    expect(response.result).to.have.property('title', testArticleInfo.title)
                    expect(response.result).to.have.property('content', testArticleInfo.content)
                    expect(response.result.tags).to.deep.equal(testArticleInfo.tags)
                    done()
                })
            })
            .catch(done)
    })

    afterTestOperations()
})

// 测试修改文章
describe('test update article', () => {
    const options = {
        method: 'POST',
        url: '/article/',
        payload: {}
    }

    const testArticleInfo = {
        title: 'test update',
        content: 'this is test',
        author: '1',
        tags: ['test', 'update']
    }

    beforeTestOperations(testUserInfo)

    articleParamCheck.articleId(options, testArticleInfo, 'update')


    articleParamCheck.title(Object.assign({}, options, {url: '/article/update/1'}), false)
    articleParamCheck.content(Object.assign({}, options, {url: '/article/update/1'}), false)
    articleParamCheck.tags(Object.assign({}, options, {url: '/article/update/1', payload: {title: 'test update', content: 'this is test'}}), false)

    it('should return 200, update fail because none is update', done => {
        addArticle(testArticleInfo, options.headers.Authorization)
            .then(article => {
                options.payload = {
                    title: 'test update',
                    content: 'this is test'
                }
                options.url = '/article/update/' + article.article_id
                server.inject(options, response => {
                    expect(response).to.have.property('statusCode', 200)
                    expect(response).to.have.property('result')
                    expect(response.result).to.have.property('message', '修改文章失败')
                    done()
                })
            })
            .catch(done)
    })

    it('should return 200, update success', done => {
        options.payload = {
            title: 'this is the updated title',
            tags: ['test', 'upadte']
        }

        server.inject(options, response => {
            expect(response).to.have.property('statusCode', 200)
            expect(response).to.have.property('result')
            expect(response.result).to.have.property('message', '修改文章成功')
            done()
        })
    })

    afterTestOperations()
})

// 测试删除文章
describe('test remove article', () => {
    const options = {
        method: 'DELETE',
        url: '/article/',
        payload: {}
    }

    const testArticleInfo = {
        title: 'test delete',
        content: 'this is test',
        author: '1',
        tags: ['test', 'delete']
    }

    beforeTestOperations(testUserInfo)

    articleParamCheck.articleId(options, testUserInfo, 'remove')
    it('should return 200, delete success', done => {
        addArticle(testArticleInfo, options.headers.Authorization)
            .then(article => {
                options.url = '/article/remove/' + article.article_id
                server.inject(options, response => {
                    expect(response).to.have.property('statusCode', 200)
                    expect(response).to.have.property('result')
                    expect(response.result).to.have.property('message', '删除文章成功')
                    done()
                })
            })
            .catch(done)
    })

    afterTestOperations()
})

// 测试获取文章列表
describe('test get article list', () => {
    const options = {
        method: 'GET',
        url: '/article/list'
    }

    const testArticleInfo = {
        title: 'test get list',
        content: 'this is test',
        author: '1',
        tags: ['test', 'getList']
    }

    beforeTestOperations(testUserInfo)

    it('should return 400, skip is need', done => {
        login(testUserInfo)
            .then(user => {
                options.headers = {
                    Authorization: user.token
                }
                testArticleInfo.author = user.user_id
                server.inject(options, response => {
                    let badRequestMessage = 'child \"skip\" fails because [\"skip\" is required]'
                    testUtils.badRequest(response, badRequestMessage)
                    done()
                })
            })
            .catch(done)
    })

    it('should return 400, skip is not a number', done => {
        options.url += '?skip={name: 1}'
        server.inject(options, response => {
            let badRequestMessage = 'child \"skip\" fails because [\"skip\" must be a number]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, skip is not an integer', done => {
        options.url = '/article/list?skip=1.1'
        server.inject(options, response => {
            let badRequestMessage = 'child \"skip\" fails because [\"skip\" must be an integer]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, skip is less than 0', done => {
        options.url = '/article/list?skip=-1'
        server.inject(options, response => {
            let badRequestMessage = 'child \"skip\" fails because [\"skip\" must be larger than or equal to 0]'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 200, return a empty array', done => {
        options.url = '/article/list?skip=0'
        articleModel.remove({}, (err, result) => {
            server.inject(options, response => {
                expect(response).to.have.property('statusCode', 200)
                expect(response).to.have.property('result')
                expect(response.result).to.deep.equal([])
                done()
            })
        })
    })

    it('should return 200, return a array with one content', done => {
        options.url = '/article/list?skip=0'
        addArticle(testArticleInfo, options.headers.Authorization)
            .then(article => {
                server.inject(options, response => {
                    expect(response).to.have.property('statusCode', 200)
                    expect(response).to.have.property('result')
                    expect(response.result).to.be.an('array').with.lengthOf(1)
                    done()
                })
            })
            .catch(done)
    })

    afterTestOperations()
})
