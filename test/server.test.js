const Lab = require('lab')
const lab = exports.lab = Lab.script()
const { describe, it, expect } = lab
const Hapi = require('hapi')
const serverConf = require('../server').conf

describe('connection', () => {
    it('server is open success with the conf', (done) => {
        const server = new Hapi.Server()

        server.connection(serverConf)
        expect(server.info.host).to.equals(serverConf.host)
        expect(server.info.port).to.equals(serverConf.port)

        done()
    })
})