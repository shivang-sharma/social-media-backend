const { Schema, default: mongoose } = require("mongoose");

const CommentSchema = new Schema({
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
})
CommentSchema.index({ created_at: -1 });
module.exports = {
    CommentSchema
}