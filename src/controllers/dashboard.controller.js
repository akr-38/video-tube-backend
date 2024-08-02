import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subcription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const viewsResult = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        },
        {
            $group:{
                _id: null,
                viewsSum: { $sum: "$views" } 
            }
        }
    ])
    const totalViews = viewsResult[0].viewsSum

    const subscriberResult= await Subcription.aggregate([
        {
            $match:{
                channel: req.user._id
            }
        },
        {
            $count: 'subscriberCount'
        }
    ])
    const totalSubcriber = subscriberResult[0].subscribercount

    const likesResult = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        },
        {
            $lookup:{
                from: 'likes',
                localField: '_id',
                foreignField: 'video',
                as : 'likedBy'
            }
        },
        {
            $project:{
                likesCount:{ $size:'$likedBy' }
            }
        },
        {
            $group:{
                _id: null,
                likes: { $sum : '$likesCount' }
            }
        }
    ])
    const totalLikes = likesResult[0].likes

    const videoResult = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            },
        },
        {
            $count: 'videoCount'
        }
    ])
    const totalVideos = videoResult[0].videoCount

    res.status(200).json(new ApiResponse(200,{totalViews,totalSubcriber,totalLikes,totalVideos},'stats returned successfully'))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        }
    ])

    res.status(200).json(new ApiResponse(200, videos, 'all videos returned successfully'))
})

export {
    getChannelStats, 
    getChannelVideos
    }