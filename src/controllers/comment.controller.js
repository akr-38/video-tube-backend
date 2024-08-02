import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    const aggregateQuery = Comment.aggregate([
        {
            $match:{
                video: videoId
            }
        },
        {
            $lookup:{
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $set:{
                owner : {$arrayElemAt: ['$owner', 0]}
            }
        }
    ])

    const comments = await Comment.aggregatePaginate(aggregateQuery,{page,limit})

    return res.status(200).json(new ApiResponse(200,comments,'coments fetched successfully'))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })
    return res.status(200).json(new ApiResponse(200,newComment, 'new comment added successfully'))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    const comment = await Comment.findById(commentId)
    comment.content = content
    comment.save({validateBeforeSave: false})
    return res.status(200).json(new ApiResponse(200,comment,"comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const deletion = await Comment.findByIdAndDelete(commmentId)
    return res.status(200).json(new ApiResponse(200,comment,'comment deleted successfully'))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }