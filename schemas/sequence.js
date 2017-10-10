const mongoose = require('mongoose')
const Schema = mongoose.Schema
const models = {}

const UserGenerateSchema = new Schema({
    _id: String,
    next: {
        type: Number,
        default: 1
    }
})

const ArticleGenerateSchema = new Schema({
    _id: String,
    next: {
        type: Number,
        default: 1
    }
})

const CommentGenerateSchema = new Schema({
    _id: String,
    next: {
        type: Number,
        default: 1
    }
})

const increase = function (schemaName, cb) {
    return this.collection.findOneAndUpdate(
        {"_id": schemaName},
        {$inc: {"next": 1}},
        {upsert: true, returnNewDocument: true},
        cb
    )
}

UserGenerateSchema.statics.increase = increase
ArticleGenerateSchema.statics.increase = increase
CommentGenerateSchema.statics.increase = increase

models.user = mongoose.model('UserGenerate', UserGenerateSchema)
models.article = mongoose.model('ArticleGenerate', UserGenerateSchema)
models.comment = mongoose.model('CommentGenerate', CommentGenerateSchema)

module.exports = models
