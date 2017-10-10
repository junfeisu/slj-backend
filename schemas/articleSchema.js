const mongoose = require('mongoose')
const Schema = mongoose.Schema
const articleGenerate = require('./sequence').article
const commentSchema = require('./commentSchema').schema

let articleSchema = new Schema({
    article_id: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        required: false,
        default: Date.now()
    },
    tags: {
        type: [String],
        required: true
    }
}, {versionKey: false})

articleSchema.index({author: -1, title: 1}, {unique: true})

articleSchema.pre('save', function (next) {
    let self = this
    if (self.isNew) {
        articleGenerate.increase('Article', function (err, result) {
            if (err) {
                console.log('err is ' + JSON.stringify(err))
            } else {
                self.article_id = result.value.next
                next()
            }
        })
    } else {
        next()
    }
})

module.exports = mongoose.model('Article', articleSchema)
