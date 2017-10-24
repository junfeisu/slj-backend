const mongoose = require('mongoose')
const dbConection = mongoose.connection

const connectMongo = () => {
    let dbName = process.env.NODE_ENV === 'test' ? 'sljTest' : 'sljRN'
    mongoose.connect('mongodb://localhost/' + dbName, {
        useMongoClient: true
    })

    dbConection.on('error', console.error.bind(console, 'connection mongodb sljRN fail:'))
    dbConection.on('open', () => console.log('mongodb connection has been established'))
}

module.exports = connectMongo
