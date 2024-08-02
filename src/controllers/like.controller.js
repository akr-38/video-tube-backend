import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const exists = await Like.find({video: videoId})
    if(exists){
        const deletion = await Like.findByIdAndDelete(exists._id)
        if(!deletion){
            throw new ApiError(500,'error deleting the like')
        }
        return res.status(200).json(new ApiResponse(200, {}, 'like removed successfully'))
    }else{
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })
        if(!newLike){
            throw new ApiError(500,'error liking the video')
        }
        return res.status(200).json(new ApiResponse(200, newLike, 'video liked successfully'))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const exists = await Like.find({comment: commentId})
    if(exists){
        const deletion = await Like.findByIdAndDelete(exists._id)
        if(!deletion){
            throw new ApiError(500,'error deleting the like')
        }
        return res.status(200).json(new ApiResponse(200, {}, 'like removed successfully'))
    }else{
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
        if(!newLike){
            throw new ApiError(500,'error liking the comment')
        }
        return res.status(200).json(new ApiResponse(200, newLike, 'comment liked successfully'))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const exists = await Like.find({tweet: tweetId})
    if(exists){
        const deletion = await Like.findByIdAndDelete(exists._id)
        if(!deletion){
            throw new ApiError(500,'error deleting the like')
        }
        return res.status(200).json(new ApiResponse(200, {}, 'like removed successfully'))
    }else{
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        if(!newLike){
            throw new ApiError(500,'error liking the tweet')
        }
        return res.status(200).json(new ApiResponse(200, newLike, 'tweet liked successfully'))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos of the user
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user?._id
            }
        },
        {
            $lookup:{
                from:'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video'
            }
        },
        {
            $set:{
                video : { $arrayElemAt: [ '$video',0 ] }
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, likedVideos, 'all liked videos returned successfully'))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}