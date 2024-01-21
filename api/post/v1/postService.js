const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand, DeleteObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');
const { Post, User, connection } = require('../../../db');
const EventManager = require('../../../EventManager');
const eventManager = new EventManager().getInstance();

class PostService {
    #AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
    #S3_BUCKET_URL = 'https://social-media-upload-mumbai.s3.ap-south-1.amazonaws.com/';

    #s3Client = new S3Client({
        region: 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    /**
    * 
    * @param {string} postId 
    * @param {string} userId 
    * @returns 
    */
    async getPost(authorId) {
        const author = await User.findOne({ _id: authorId });
        if (author) {
            const posts = [];
            const promises = []
            author.posts.forEach((postId) => {
                promises.push((async () => {
                    const post = await Post.aggregate([
                        {
                            $match: {
                                _id: new mongoose.Types.ObjectId(postId)
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
                                _id: 1,
                                caption: 1,
                                content: 1,
                                authorDetails: {
                                    // Include the fields you want from the User collection
                                    _id: 1,
                                    username: 1
                                    // Add more user fields as needed
                                },
                                comments: 1,
                                created_at: 1,
                                updated_at: 1
                            },
                        },
                    ]);
                    if (post.length > 0) {
                        posts.push(post[0]);
                    }
                })());
            })
            await Promise.all(promises);
            return {
                posts: posts,
                error: null
            };
        }
        return {
            posts: null,
            error: 'Author does not exist'
        }
    }

    /**
     * 
     * @param {string} postId 
     * @param {string} userId 
     * @returns 
     */
    async deletePost(postId, userId) {
        const session = await connection.startSession();
        session.startTransaction();
        try {
            const deletedPost = await Post.findOneAndDelete({ _id: postId });
            if (!deletedPost) {
                await session.abortTransaction();
                session.endSession();
                return {
                    deletedPost: null,
                    error: 'Post does not exist'
                }
            }
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { $pull: { posts: postId } },
                { new: true }, // This option returns the updated document
            );
            deletedPost.comments.forEach(commentId => {
                Comment.findOneAndDelete({_id: commentId});
            })
            const urlArr = deletedPost.content.url.split('/')
            const key = urlArr[urlArr.length - 1];
            await this.#removeFileFromS3(key)
            await session.commitTransaction();
            session.endSession();
            eventManager.emit('SEND_UPDATE', {
                event: 'POST_DELETED',
                message: deletedPost
            })
            return {
                deletedPost: deletedPost,
                error: null
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            logger.error("Delete Transaction aborted:", error);
            return {
                post: null,
                error: 'Failed to delete post'
            }
        }
    }

    /**
     * 
     * @param {*} file 
     * @param {string} caption 
     */
    async savePost(file, caption, userId) {
        const session = await connection.startSession();
        session.startTransaction();
        try {
            const mediaURL = await this.#uploadFileToS3(file)
            const savedPost = await this.#createAndSavePost(userId, caption, mediaURL, file);
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { posts: savedPost._id } },
                { new: true }, // This option returns the updated document
            );
            await session.commitTransaction();
            session.endSession();
            eventManager.emit('SEND_UPDATE', {
                event: 'POST_ADDED',
                message: savedPost
            })
            return {
                post: savedPost,
                error: null
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            logger.error("Save Transaction aborted:", error);
            return {
                post: null,
                error: 'Failed to create post'
            }
        }
    }
    async #uploadFileToS3(file) {
        // image/png image/jpg video/mp4
        const key = `${uuidv4()}.${file.mimetype.split('/')[1]}`
        const command = new PutObjectCommand({
            Bucket: this.#AWS_S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        });
        const data = await this.#s3Client.send(command);
        if (data.$metadata.httpStatusCode === 200) {
            return this.#S3_BUCKET_URL + key;
        }
        throw new Error("Failed to upload file to S3");
    }
    async #removeFileFromS3(key) {
        const command = new DeleteObjectCommand({
            Bucket: this.#AWS_S3_BUCKET_NAME,
            Key: key,
        });
        const data = await this.#s3Client.send(command);
        if (data.$metadata.httpStatusCode === 200) {
            return true
        }
        return new Error("Failed to remove file from S3");
    }
    async #createAndSavePost(userId, caption, mediaURL, file) {
        const newPost = new Post({
            author: userId,
            caption: caption,
            comments: [],
            content: {
                contentType: file.mimetype.split('/')[0].toUpperCase(),
                url: mediaURL,
            },
        });
        return await newPost.save();
    }
}

module.exports = {
    PostService
}