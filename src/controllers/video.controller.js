import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query='', sortBy='views', sortType='desc', userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const matchStage = {
        $match:{
            title : new RegExp(query , 'i')
        }
    }
    if(userId){
        matchStage.$match._id = new mongoose.Types.ObjectId(userId) 
    }

    const sortStage = {
        $sort:{
            [sortBy]: sortBy === 'desc'? -1:1
        }
    }

    const pipeline = [matchStage, sortStage];

    const options = {
        page: page,
        limit: limit
    }
    const aggr =Video.aggregate(pipeline)
    
    const results = await Video.aggregatePaginate(aggr, options);

    return res.status(200).json(new ApiResponse(200,results,'videos fetched successfully'))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title){
        throw new ApiError(400,'title is required')
    }
    if(!description){
        throw new ApiError(400, 'description is required')
    }
    if(req.files?.videoFile.length===0){
        throw new ApiError(400, 'video is required')
    }
    if(req.files?.thumbnail.length===0){
        throw new ApiError(400,'thumbnail is required')
    }
    const _id = res.user._id
    
    const videoLocalPath = req.files.videoFile[0].path
    const video = await uploadOnCloudinary(videoLocalPath)

    const thumbnailLocalPath = req.files.thumbnail[0].path
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    const result = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner : _id
    })
    if(!result){
        throw new ApiError(500,'error uploading the video')
    }
    return res.status(200).json(new ApiResponse(200,result, 'video published successfully'))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(500, 'error fetching the video')
    }
    return res.status(200).json(new ApiResponse(200,video,'video fetched successfully'));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title , description} = req.body
    const _id = req.user._id
    const thumbnailPath = req.file?.path
    const video = await Video.findById(videoId)
    if (video.owner !== _id){
        throw new ApiError(400,'unauthorised: only the owner can change the video related feilds')
    }
    
    if(title){
        video.title = title
    }
    if(description){
        video.description = description
    }
    if(thumbnailPath){
        const oldUrl = video.thumbnail
        const thumbnail = await uploadOnCloudinary(thumbnailPath)
        video.thumbnail = thumbnail.url
        const deletion = await deleteFromCloudinary(oldUrl)
        if(!deletion){
            throw new ApiError(500, 'could not delete video from cloudinary')
        }
    }
    await video.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200,video,'details updated successfully'))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    try {

        //remove it from cloudinary also
        const video = await Video.findById(videoId)
        const isVideoDeleted = await deleteFromCloudinary(video.videoFile)
        if(!isVideoDeleted){
            throw new ApiError(500,'error deleting video')
        }
        const isThumbnailDeleted = await deleteFromCloudinary(video.thumbnail)
        if(!isThumbnailDeleted){
            throw new ApiError(500,'error deleting thumbnail')
        }
        const deletion = await Video.findByIdAndDelete(videoId)
        if(deletion){
           return res.status(200).json(new ApiResponse(200,{},'deleted successfully')) 
        }
        else{
            throw new ApiError(400,'no such video exists')
        }
    } catch (error) {
        throw new ApiError(500,error.message)
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const updatedValue = await Video.findByIdAndUpdate(videoId,{$set:{isPublished : {$not : isPublished}}},{new:true})
    if(updatedValue){
        return res.status(200).json(200,updatedValue,'toggle successful')
    }else{
        throw new ApiError(400 ,'such video does not exists')
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}