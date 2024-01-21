const { Schema, default: mongoose } = require("mongoose");

const PostSchema = new Schema({
    caption: {
        type: String,
        required: true
    },
    content: {
        contentType: {
            type: String,
            enum: {
                values: ['IMAGE', 'VIDEO'],
                message: 'Content-Type "{VALUE}" is not supported'
            },
            required: true
        },
        url: {
            type: String,
            required: true
        },
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Comment',
        required: true
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
})
PostSchema.index({ created_at: -1 });
module.exports = {
    PostSchema
}