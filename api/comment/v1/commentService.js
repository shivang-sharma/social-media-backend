const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../../logger');
const { Post, Comment, User, connection } = require('../../../db');
const EventManager = require('../../../EventManager');
const eventManager = new EventManager().getInstance();

class CommentService {
    async getComment(postId) {
        const post = await Post.findOne({ _id: postId })
        if (post) {
            const comments = [];
            const promises = []
            post.comments.forEach((commentId) => {
                promises.push((async () => {
                    const comment = await Comment.aggregate([
                        {
                            $match: {
                                _id: new mongoose.Types.ObjectId(commentId)
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'author',
                                foreignField: '_id',
                                as: 'authorDetail'
                            },
                        },
                        {
                            $unwind: '$authorDetail'
                        },
                        {
                            $project: {
                                // Include the fields you want from the Comment collection
                                _id: 1,
                                text: 1,
                                authorDetail: {
                                    _id: 1,
                                    username: 1
                                },
                                created_at: 1,
                                updated_at: 1
                            },
                        },
                    ]);
                    if (comment.length > 0) {
                        comments.push(comment[0]);
                    }
                })());
            })
            await Promise.all(promises);
            return {
                comments: comments,
                error: null
            };
        }
        return {
            comments: null,
            error: 'Post does not exist'
        }
    }
    async postComment(postId, comment, userId) {
        const session = await connection.startSession()
        session.startTransaction();
        try {
            const newComment = new Comment({
                author: userId,
                text: comment
            });
            const savedComment = await newComment.save();
            const updatedPost = await Post.findOneAndUpdate(
                { _id: postId },
                { $push: { comments: savedComment._id } },
                { new: true }, // This option returns the updated document
            );
            await session.commitTransaction();
            session.endSession();
            eventManager.emit('SEND_UPDATE', {
                event: 'COMMENT_ADDED',
                message: savedComment
            })
            return {
                comment: savedComment,
                error: null
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            logger.error("Save Transaction aborted:", error);
            return {
                post: null,
                error: 'Failed to add comment'
            }
        }
    }
    async deleteComment(postId, commentId) {
        const session = await connection.startSession()
        session.startTransaction();
        try {
            const deletedComment = await Comment.findOneAndDelete({ _id: commentId });
            logger.debug(commentId);
            const updatedPost = await Post.findOneAndUpdate(
                { _id: postId },
                { $pull: { comments: deletedComment._id } },
                { new: true }, // This option returns the updated document
            );
            await session.commitTransaction();
            session.endSession();
            eventManager.emit('SEND_UPDATE', {
                event: 'COMMENT_DELETED',
                message: deletedComment
            })
            return {
                comment: deletedComment,
                error: null
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            logger.error("Delete Transaction aborted:", error);
            return {
                comment: null,
                error: 'Failed to delete comment'
            }
        }
    }
}

module.exports = {
    CommentService
}