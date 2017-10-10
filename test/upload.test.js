const Lab = require('lab')
const lab = exports.lab = Lab.script()
const { describe, it, before, after } = lab
const expect = require('chai').expect
const Hapi = require('hapi')
const server = require('../server').server
const userModel = require('../schemas/userSchema')
const testUtils = require('../utils/testUtil')
const cryptic = require('../utils/cryptic')

const testUserInfo = {
    username: 'testupload',
    password: 'testupload'
}

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

const beforeAddUser = () => {
    before(done => {
        let copyUserInfo = Object.assign({}, testUserInfo, {password: cryptic(testUserInfo.password)})
        new userModel(copyUserInfo).save((err, result) => {
            done()
        })
    })
}

const afterRemoveUser = () => {
    after(done => {
        userModel.remove({username: testUserInfo.username}, (err, result) => {
            done()
        })
    })
}

// 测试获取上传token
describe('get upload token', () => {
    const options = {
        method: 'GET',
        url: '/upload/up'
    }

    beforeAddUser()
    
    it('should be return 200, return the upload token', done => {
        login()
            .then(user => {
                options.headers = {
                    Authorization: user.token
                }
                
                server.inject(options, response => {
                    expect(response).to.have.property('statusCode', 200)
                    expect(response).to.have.property('result')
                    expect(response.result).to.have.property('uploadToken')
                    done()
                })
            })
            .catch(done)
    })

    afterRemoveUser()
})

describe('get download url', () => {
    const options = {
        method: 'POST',
        url: '/upload/download',
        payload: {}
    }

    beforeAddUser()

    it('should return 400, domain is need', done => {
        login()
            .then(user => {
                options.headers = {
                    Authorization: user.token
                }

                options.payload = {
                    key: 'test.jpg'
                }

                server.inject(options, response => {
                    let badRquestMessage = 'child \"domain\" fails because [\"domain\" is required]'
                    testUtils.badRequest(response, badRquestMessage)
                    done()
                })
            })
            .catch(done)
    })

    it('should return 400, domain is not a string', done => {
        options.payload.domain = {value: 'http://test.com'}

        server.inject(options, response => {
            let badRquestMessage = 'child \"domain\" fails because [\"domain\" must be a string]'
            testUtils.badRequest(response, badRquestMessage)
            done()
        })
    })

    it('should return 400, domain format is not valid', done => {
        options.payload.domain = 'test.hello'

        server.inject(options, response => {
            let badRquestMessage = 'child \"domain\" fails because [\"domain\" with value \"test.hello\" fails to match the required pattern: /^http(s)?:\\/\\/.*/]'
            testUtils.badRequest(response, badRquestMessage)
            done()
        })
    })

    it('should return 400, key ie need', done => {
        options.payload = {
            domain: 'http://test.com'
        }

        server.inject(options, response => {
            let badRquestMessage = 'child \"key\" fails because [\"key\" is required]'
            testUtils.badRequest(response, badRquestMessage)
            done()
        })
    })

    it('should return 400, key is not a string', done => {
        options.payload.key = {value: 'test.jpg'}

        server.inject(options, response => {
            let badRquestMessage = 'child \"key\" fails because [\"key\" must be a string]'
            testUtils.badRequest(response, badRquestMessage)
            done()
        })
    })

    it('should return 400, key format is not valid', done => {
        options.payload.key = 'test.hello'

        server.inject(options, response => {
            let badRquestMessage = 'child \"key\" fails because [\"key\" with value \"test.hello\" fails to match the required pattern: /^.*\\.(jpg|jpeg|png|gif)$/i]'
            testUtils.badRequest(response, badRquestMessage)
            done()
        })
    })

    it('should return 200, return the download url', done => {
        options.payload.key = 'test.jpg'

        server.inject(options, response => {
            const { domain, key } = options.payload
            let urlReg = new RegExp('^' + domain + '/' + key + '\\?e=' + '\\d+' + '&token=.*')
            expect(response).to.have.property('statusCode', 200)
            expect(response).to.have.property('result')
            expect(response.result).to.have.property('url')
            expect(response.result.url).to.match(urlReg)
            done()
        })
    })

    afterRemoveUser()
})
