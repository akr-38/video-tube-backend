import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subcription, Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user?._id
    const exists = await Subscription.find({$and:[{channel: channelId}, {subscriber: userId}]})
    if(exists.length>0){
        const removed = Subscription.findByIdAndDelete(exists._id)
        if(removed){
            return res.status(200).json(new ApiResponse(200,{},"subscription removed successfully"))
        }else{
            throw ApiError(500,'error removing subscription')
        }
    }
    else{
        const newSubscriber = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        if(newSubscriber){
            res.status(200).json(new ApiResponse(200,{newSubscriber},"new subscriber added successfully"))
        }else{
            throw new ApiError(500,'error adding new subscriber')
        }
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subcription.aggregate([
        {
            $match:{
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriber',
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscriber:{
                    $first:'$subscriber'
                }
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,subscribers,'subscribers fetched successfully'))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const channels= Subscription.aggregate([
        {
            $match:{
                subscriber: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'channel',
                foreignField:'_id',
                as:'channel',
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                channel:{
                    $first:'$channel'
                }
            }
        }
    ])
    return res.status(200).json(200,channels,'subscribed channels fetched successfully')
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}