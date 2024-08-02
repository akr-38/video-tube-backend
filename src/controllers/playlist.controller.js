import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    const newPlaylist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id
    })
    if(!newPlaylist){
        throw new ApiError(500,"error creating new playlist")
    }
    res.status(200).json(new ApiResponse(200,newPlaylist,'new Playlist created successfully'))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    try {
        const playlists = await Playlist.aggregate([
            {
                $match:{
                    _id: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from: 'videos',
                    localField: 'videos',
                    foreignField: '_id',
                    as: 'videos',
                    pipeline:[
                        {
                            $project:{
                                thumbnail:1
                            }
                        }
                    ]
                }
            },
            {
                $project:{
                    name:1,
                    thumbnail:{$arrayElemAt: ['$videos', 0]},
                }
            }
        ])
    
        res.status(200).json(new ApiResponse(200, playlists,'playlists fetched successfully'))
    } catch (error) {
        throw new ApiError(500,"error while fetching this user's playlists")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id  //try-catch 
    const videos = await Playlist.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: 'videos',
                localField: 'videos',
                foreignField: '_id',
                as:'videos',
                pipeline:[
                    {
                        $lookup:{
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project:{
                                        username: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $set:{
                            owner: { $arrayElemAt: [ '$owner',0 ] }
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'owner',
                foreignField:'_id',
                as: 'owner',
                pipeline:[
                    {
                        $project: {
                            username:1,
                            fullName:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $set:{
                owner: { $arrayElemAt: ['$owner', 0] }
            }
        }
    ])

    res.status(200).json(new ApiResponse(200,videos,'all videos of this playlists fetched successfully'))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const result = await Playlist.updateOne({_id: playlistId}, {$push: {videos: videoId}});
    if(!result){
        throw new ApiError(500,'error adding the video to the playlist')
    }
    return res.status(200).json(new ApiResponse(200,result.nModified, 'video added successfully'))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const result = await Playlist.updateOne({_id: playlistId}, {$pull: {videos: videoId}});
    if(!result){
        throw new ApiError(500,'error removing video from the playlist')
    }
    return res.status(200).json(new ApiResponse(200,result.nModified, 'video removed successfully'))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const deletion = await Playlist.findByIdAndDelete(playlistId)
    if(!deletion){
        throw new ApiError(500,'error while deleting Playlist')
    }
    return res.status(200).json(200,{},'Playlist deleted successfully')
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findById(playlistId)
    if(name){
        playlist.name = name
    }
    if(description){
        playlist.description = description
    }
    await playlist.save({validateBeforeSave: false})
    return res.status(200).json(200,playlist,'playlist updated successfully')
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}