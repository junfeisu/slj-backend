const mongoose = require('mongoose')
const Schema = mongoose.Schema
const commentGenerate = require('./sequence').comment

let commentSchema = new Schema({
    comment_id: {
        type: Number
    },
    comment_user: {
        type: Number,
        required: true
    },
    comment_content: {
        type: String,
        required: true
    },
    article_id: {
        type: Number,
        required: true
    },
    comment_date: {
        type: Date,
        required: false,
        default: Date.now()
    }
}, {versionKey: false})

commentSchema.pre('save', function (next) {
    let self = this
    if (self.isNew) {
        commentGenerate.increase('Comment', function (err, result) {
            if (err) {
                console.log('err is' + JSON.stringify(err))
            } else{
                self.comment_id = result.value.next
                next()
            }
        })
    } else {
        next()
    }
})

module.exports = {
    model: mongoose.model('Comment', commentSchema),
    schema: commentSchema
}
