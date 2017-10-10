const Lab = require('lab')
const lab = exports.lab = Lab.script()
const { describe, it, before, after } = lab
const expect = require('chai').expect
const Hapi = require('hapi')
const server = require('../server').server
const userModel = require('../schemas/userSchema')
const testUtils = require('../utils/testUtil')
const cryptic = require('../utils/cryptic')
const deepCopy = require('../utils/deepCopy')

const userParamsCheck = {
    userId (options, subPath) {
        /* 对参数userId的一系列检测
         * 是否有userId参数
         * 是否为number类型
         * 是否为integer类型
         * 是否小于1
         */
        it('user_id is need', done => {
            typeof subPath !== 'undefined' ? options.url = '/user' + subPath : delete options.payload.user_id
            server.inject(options, response => {
                if (typeof subPath !== 'undefined') {
                    testUtils.notFound(response)
                } else {
                    let badRequestMessage = 'child \"user_id\" fails because [\"user_id\" is required]'
                    testUtils.badRequest(response, badRequestMessage)
                }
                done()
            })
        })

        it('should return 400, user_id is not the number', done => {
            typeof subPath !== 'undefined' ? options.url = '/user' + subPath + '/s' : options.payload.user_id = 'test'
            server.inject(options, response => {
                let badRequestMessage = 'child \"user_id\" fails because [\"user_id\" must be a number]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, user_id is not the integer', done => {
            typeof subPath !== 'undefined' ? options.url = '/user' + subPath + '/1.1' : options.payload.user_id = '1.1'
            server.inject(options, response => {
                let badRequestMessage = 'child \"user_id\" fails because [\"user_id\" must be an integer]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, user_id is less than 1', done => {
            typeof subPath !== 'undefined' ? options.url = '/user' + subPath + '/0' : options.payload.user_id = '0'
            server.inject(options, response => {
                let badRequestMessage = 'child \"user_id\" fails because [\"user_id\" must be larger than or equal to 1]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    username (options, isRequired) {
        /* 对参数username的一系列检测
         * 是否有username参数
         * 是否为string类型
         * string的长度是否小于1
         */
        it('should return 400, username is need', done => {
            if (isRequired) {
                delete options.payload.username

                server.inject(options, response => {
                    let badRequestMessage = 'child \"username\" fails because [\"username\" is required]'
                    testUtils.badRequest(response, badRequestMessage)
                    done()
                })
            } else {
                done()
            }
        })

        it('should return 400, username is not string', done => {
            options.payload.username = {
                name: 'test'
            }

            server.inject(options, response => {
                let badRequestMessage = 'child \"username\" fails because [\"username\" must be a string]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, username length less than 1', done => {
            options.payload.username = ''

            server.inject(options, response => {
                let badRequestMessage = 'child \"username\" fails because [\"username\" is not allowed to be empty]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    password (options) {
        /* 对参数password的一系列检测
         * 是否有password参数
         * 是否为string类型
         * string的长度是否小于6
         */
        it('should return 400, password is need', done => {
            delete options.payload.password

            server.inject(options, response => {
                let badRequestMessage = 'child \"password\" fails because [\"password\" is required]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, password is not string', done => {
            options.payload.password = {
                name: 'testadd'
            }

            server.inject(options, response => {
                let badRequestMessage = 'child \"password\" fails because [\"password\" must be a string]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, password length less than 6', done => {
            options.payload.password = 'test'

            server.inject(options, response => {
                let badRequestMessage = 'child \"password\" fails because [\"password\" length must be at least 6 characters long]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    slogan (options) {
        /* 对slogan参数的一系列检测
         * 是否为string类型
         * 长度是否小于1
         */
        it('should return 400, slogan is not a string', done => {
            options.payload.slogan = {
                value: 'this is for test'
            }

            server.inject(options, response => {
                let badRequestMessage = 'child \"slogan\" fails because [\"slogan\" must be a string]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, slogan length less than 1', done => {
            options.payload.slogan = ''

            server.inject(options, response => {
                let badRequestMessage = 'child \"slogan\" fails because [\"slogan\" is not allowed to be empty]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    birthday (options) {
        /* 对birthday参数的一系列检测
         * 是否为string类型
         * 格式是否符合
         */
        it('should return 400, birthday is not a string', done => {
            options.payload.birthday = {
                value: '1996-07-28'
            }

            server.inject(options, response => {
                let badRequestMessage = 'child \"birthday\" fails because [\"birthday\" must be a string]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, birthday format is not valid', done => {
            options.payload.birthday = '1996-13-12'

            server.inject(options, response => {
                let badRequestMessage = 'child \"birthday\" fails because [\"birthday\" with value \"' + options.payload.birthday + '\" fails to match the required pattern: /^(19[0-9]{2}|20[0-1][0-7])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    userIcon (options) {
        /* 对参数user_icon的一系列检测
         * 是否为string类型
         * 是否符合格式
         */
        it('should return 400, user_icon is not a string', done => {
            options.payload.user_icon = {
                src: 'test.png'
            }

            server.inject(options, response => {
                let badRequestMessage = 'child \"user_icon\" fails because [\"user_icon\" must be a string]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, user_icon format is not valid', done => {
            options.payload.user_icon = 'http://test.jng'

            server.inject(options, response => {
                let badRequestMessage = 'child \"user_icon\" fails because [\"user_icon\" with value \"http:&#x2f;&#x2f;test.jng\" fails to match the required pattern: /^.+\\.(jpg|jpeg|png|gif)$/]'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })
    },
    token (options, loginSuccessInfo) {
        /*
         * 没有Authorization的header
         * 错误的token
         * token过期
         */
        it('should return 400, token is not add to headers', done => {
            options.headers = {}
            server.inject(options, response => {
                let badRequestMessage = 'Authorization header is need'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, token is not right', done => {
            let tokenLen = loginSuccessInfo.token.length

            options.headers = {
                'Authorization': tokenLen > 0 ? loginSuccessInfo.token.substring(0, tokenLen - 1) : loginSuccessInfo.token
            }

            server.inject(options, response => {
                let badRequestMessage = 'invalid signature'
                testUtils.badRequest(response, badRequestMessage)
                done()
            })
        })

        it('should return 400, token is expired', {timeout: 5000}, done => {
            options.headers = {
                Authorization: loginSuccessInfo.token
            }

            setTimeout(() => {
                server.inject(options, response => {
                    let badRequestMessage = 'jwt expired'
                    testUtils.badRequest(response, badRequestMessage)
                    done()
                })
            }, 1000 * 2)
        })
    }
}

// 在测试之前启动服务
describe('server start', () => {
    before(done => {
        server.start()
        userModel.remove({username: 'test'}, (err, result) => {
            done()
        })
    })
})

// 添加用户API的测试
describe('add user API', () => {
    const options = {
        method: 'PUT',
        url: '/user/add',
        payload: {
            username: 'test',
            password: 'testadd'
        }
    }

    userParamsCheck.username(deepCopy(options), true)

    userParamsCheck.password(deepCopy(options))

    userParamsCheck.userIcon(deepCopy(options))
    
    userParamsCheck.birthday(deepCopy(options))
    
    userParamsCheck.slogan(deepCopy(options))

    /* 对200返回的一系列检测
     * 不应该返回password
     * 没填slogan，是否返回默认slogan
     * 没填birthday，是否返回默认birthday
     * 没填user_icon，是否返回默认user_icon
     * 返回的信息是否和提交的信息是否一致
     */
    it('should return 200, return the result does not have password', done => {
        userModel.remove({username: 'test'}, (err, result) => {
            server.inject(options, response => {
                expect(response).to.have.property('statusCode', 200)
                expect(response).to.have.property('result')
                expect(response.result).to.not.have.property('password')
                done()
            })
        })
    })

    it('should return 200, return the default slogan', done => {
        options.payload.user_icon = 'http://test.png',
        options.payload.birthday = '2017-09-15'
        
        userModel.remove({username: 'test'}, (err, result) => {
            server.inject(options, response => {
                expect(response).to.have.property('statusCode', 200)
                expect(response).to.have.property('result')
                expect(response.result).to.have.property('slogan', 'slj is forever') // default value
                done()
            })
        })
    })

    it('should return 200, return the default birthday', done => {
        delete options.payload.birthday
        options.payload.slogan = 'this is for test'
        
        userModel.remove({username: 'test'}, (err, result) => {
            server.inject(options, response => {
                expect(response).to.have.property('statusCode', 200)
                expect(response).to.have.property('result')
                expect(response.result).to.have.property('birthday', '1996-07-28') // default value
                done()
            })
        })
    })

    it('should return 200, return the default user_icon', done => {
        delete options.payload.user_icon
        options.payload.birthday = '2017-09-15'
        
        userModel.remove({username: 'test'}, (err, result) => {
            server.inject(options, response => {
                expect(response).to.have.property('statusCode', 200)
                expect(response).to.have.property('result')
                expect(response.result).to.have.property('user_icon', 'default.jpg') // default value
                done()
            })
        })
    })

    it('should return 200, return info is same with the payload', done => {
        options.payload.user_icon = 'http://test.png',
        
        userModel.remove({username: 'test'}, (err, result) => {
            server.inject(options, response => {
                expect(response).to.have.property('statusCode', 200)
                expect(response).to.have.property('result')
                expect(response.result).to.have.property('username', options.payload.username)
                expect(response.result).to.have.property('birthday', options.payload.birthday)
                expect(response.result).to.have.property('user_icon', options.payload.user_icon)
                expect(response.result).to.have.property('slogan', options.payload.slogan)
                done()
            })
        })
    })
})

// 测试登录API的测试
describe('user login API', () => {
    const options = {
        method: 'POST',
        url: '/user/login',
        payload: {
            username: 'test',
            password: 'testlogin'
        }
    }

    const testUserInfo = {
        username: 'test',
        password: 'testlogin',
        user_id: '1'
    }

    let addSuccessInfo = {
        username: 'test',
        password: '123456'
    }

    before(done => {
        let copyUserInfo = Object.assign({}, testUserInfo, {password: cryptic(testUserInfo.password)})
        new userModel(copyUserInfo).save((err, result) => {
            if (result) {
                addSuccessInfo.username = result.username
                addSuccessInfo.password = testUserInfo.password
            } else {
                console.error.bind(console, 'add login user failed')
            }
            done()
        })
    })

    userParamsCheck.username(deepCopy(options), true)

    userParamsCheck.password(deepCopy(options))

    // password is not right
    it('should return 403, password is not right', done => {
        let passwordLen = addSuccessInfo.password.length
        options.payload = {
            username: addSuccessInfo.username,
            password: passwordLen > 6 ? addSuccessInfo.password.substring(0, passwordLen - 1) : addSuccessInfo.password
        }

        server.inject(options, response => {
            expect(response).to.have.property('statusCode', 403)
            expect(response).to.have.property('result')
            expect(response).to.have.property('statusMessage', 'Forbidden')
            expect(response.result).to.have.property('message', 'password is not right')
            done()
        })
    })

    // username is not exist
    it('should return 400, user has not register', done => {
        options.payload = {
            username: 'testlogin',
            password: addSuccessInfo.password
        }

        server.inject(options, response => {
            let badRequestMessage = 'user has not register'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    /* 正常响应的一系列检测
     * 是否返回password
     * 是否返回token
     * 是否返回user_id
     */
    it('should return 200, return info should have token, user_id and not have password', done => {
        options.payload = addSuccessInfo

        server.inject(options, response => {
            expect(response).to.have.property('statusCode', 200)
            expect(response).to.have.property('result')
            expect(response.result).to.not.have.property('password')
            expect(response.result).to.have.property('user_id')
            expect(response.result).to.have.property('token')
            done()
        })
    })
})

// 获取用户信息API的测试
describe('get user API', () => {
    const options = {
        method: 'GET'
    }

    const testUserInfo = {
        user_id: '1',
        username: 'test',
        password: 'testget'
    }

    let loginSuccessInfo = {
        userId: 1,
        token: ''
    }
    // 添加测试用户
    before(done => {
        let copyUserInfo = Object.assign({}, testUserInfo, {password: cryptic(testUserInfo.password)})
        new userModel(copyUserInfo).save((err, result) => {
            done()
        })
    })
    
    // 测试用户登录
    before(done => {
        const loginOptions = {
            method: 'POST',
            url: '/user/login',
            payload: {
                username: testUserInfo.username,
                password: testUserInfo.password
            }
        }

        server.inject(loginOptions, response => {
            if (+response.statusCode === 200) {
                loginSuccessInfo.userId = response.result.user_id
                loginSuccessInfo.token = response.result.token
            }
            done()
        })
    })

    // 正确的检测
    it('should return 200, return info is match to the testUserInfo', done => {
        options.url = '/user/' + loginSuccessInfo.userId
        options.headers = {
            Authorization: loginSuccessInfo.token
        }

        server.inject(options, response => {
            expect(response).to.have.property('statusCode', 200)
            expect(response).to.have.property('result')
            expect(response.result).to.have.property('username', testUserInfo.username)
            expect(response.result).to.have.property('user_id', loginSuccessInfo.userId)
            done()
        })
    })
    
    // 对user_id的检测
    userParamsCheck.userId(deepCopy(options), '')
    it('should return 400, user_id is not exist', done => {
        options.url = '/user/' + (+loginSuccessInfo.userId + 1)
        server.inject(options, response => {
            let badRequestMessage = 'user_id is not exist'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })
    
    // 对token的检测
    options.url = '/user/' + loginSuccessInfo.userId
    userParamsCheck.token(deepCopy(options), loginSuccessInfo)
})

// 更改用户信息API的测试
describe('update user API', () => {
    const options = {
        method: 'POST',
        payload: {}
    }

    const testUserInfo = {
        username: 'test',
        password: 'testupdate',
        user_id: '1'
    }

    const loginSuccessInfo = {
        userId: 1,
        token: ''
    }

    before(done => {
        let copyUserInfo = Object.assign({}, testUserInfo, {password: cryptic(testUserInfo.password)})
        new userModel(copyUserInfo).save((err, result) => {
            done()
        })
    })

    before(done => {
        const loginOptions = {
            method: 'POST',
            url: '/user/login',
            payload: {
                username: testUserInfo.username,
                password: testUserInfo.password
            }
        }

        server.inject(loginOptions, response => {
            if (+response.statusCode === 200) {
                loginSuccessInfo.userId = response.result.user_id
                loginSuccessInfo.token = response.result.token
            }
            done()
        })
    })

    userParamsCheck.userId(deepCopy(options), '/update')

    // 正确的返回检测
    it('should return 200, update fail no message updated', done => {
        let copyOptions = deepCopy(options)
        copyOptions.url = '/user/update/' + loginSuccessInfo.userId
        copyOptions.headers = {
            Authorization: loginSuccessInfo.token
        }

        server.inject(copyOptions, response => {
            expect(response).to.have.property('statusCode', 200)
            expect(response).to.have.property('result')
            expect(response.result).to.have.property('message', '更改信息失败')
            done()
        })
    })

    it('should return 200, update success', done => {
        let copyOptions = deepCopy(options)
        copyOptions.payload = {
            slogan: 'this is for test'
        }
        copyOptions.url = '/user/update/' + loginSuccessInfo.userId
        copyOptions.headers = {
            Authorization: loginSuccessInfo.token
        }
        server.inject(copyOptions, response => {
            expect(response).to.have.property('statusCode', 200)
            expect(response).to.have.property('result')
            expect(response.result).to.have.property('message', '更改信息成功')
            done()
        })
    })

    // 不能修改password, 不能修改user_id
    it('should return 400, password is not allowed', done => {
        options.url = '/user/update/' + loginSuccessInfo.userId
        options.payload.password = '123456'
        options.headers = {
            Authorization: loginSuccessInfo.token
        }

        server.inject(options, response => {
            let badRequestMessage = '"password" is not allowed'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })

    it('should return 400, user_id is not allowed', done => {
        delete options.payload.password
        options.payload.user_id = '123456'
        options.headers = {
            Authorization: loginSuccessInfo.token
        }

        server.inject(options, response => {
            let badRequestMessage = '"user_id" is not allowed'
            testUtils.badRequest(response, badRequestMessage)
            done()
        })
    })
    
    options.url = '/user/update/' + loginSuccessInfo.userId
    
    userParamsCheck.username(deepCopy(options))

    userParamsCheck.userIcon(deepCopy(options))

    userParamsCheck.birthday(deepCopy(options))

    userParamsCheck.slogan(deepCopy(options))
    
    userParamsCheck.token(deepCopy(options), loginSuccessInfo)
})
