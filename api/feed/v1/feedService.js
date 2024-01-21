const { Post } = require("../../../db")

class FeedService {
    async get() {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: 'users', // Name of the User collection
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorDetails',
                },
            },
            {
                $unwind: '$authorDetails',
            },
            {
                $project: {
                    // Include the fields you want from the Post collection
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
        ])
        return posts;
    }
}

module.exports = {
    FeedService
}