import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}= req.body
    if(!content){
        throw new ApiError(400, 'nothing to tweet')
    }
    const tweet = await Tweet.create({
        owner : req.user?._id,
        content : content 
    })

    if(!tweet){
        throw new ApiError(500,'an error occured while tweeting')
    }

    return res.status(200).json(new ApiResponse(200,tweet,'tweet created successfully'))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    if(tweets.length === 0){
        return res.status(200).json(new ApiResponse(200,[],'no tweets found'))
    }
    return res.status(200).json(new ApiResponse(200,tweets,'tweets fetched successfully'))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{ content:content },{new:true})
    if(!updatedTweet){
        throw new ApiError(400,'such tweet does not exists')
    }
    return res.status(200).json(new ApiResponse(200,updatedTweet,'tweet updated successfully'))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deletedTweet){
        throw new ApiError(400,'such tweet does not exists')
    }
    return res.status(200).json(new ApiResponse(200,{},'tweet deleted successfully'))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}