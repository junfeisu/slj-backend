const commentModel = require('../schemas/commentSchema').model

const utils = {
    deleteComments (articleId, events) {
        commentModel.remove({article_id: articleId}, (err, result) => {
            if (err) {
                events.emit('Error', err.message)
            } else {
                events.emit('deleteCommentsNormal', result.result.n)
            }
        })
    },
    getComments (articleId, events, index) {
        commentModel.find({article_id: articleId}, (err, result) => {
            if (err) {
                events.emit('Error', err.message)
            } else {
                index !== undefined ? events.emit('getCommentsNormal', result, index) : events.emit('getCommentsNormal', result)
            }
        })
    }
}

module.exports = utils
