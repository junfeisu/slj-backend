const expect = require('chai').expect

const utils = {
    badRequest (response, badRequestMessage) {
        expect(response).to.have.property('statusCode', 400)
        expect(response).to.have.property('result')
        expect(response).to.have.property('statusMessage', 'Bad Request')
        expect(response.result).to.have.property('message', badRequestMessage)
    },
    notFound (response) {
        expect(response).to.have.property('statusCode', 404)
        expect(response).to.have.property('result')
        expect(response.result).to.have.property('error', 'Not Found')
        expect(response.result).to.have.property('message', 'Not Found')
    }
}

module.exports = utils
