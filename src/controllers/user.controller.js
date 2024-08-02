import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js';
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) =>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, 'something went wrong while generating token');
    }
}

const registerUser = asyncHandler( async(req,res)=>{
    
    const {fullName, email, username, password} = req.body;
    
    if([fullName, email, username, password].some((feild)=> feild?.trim() === '')){
        throw new ApiError(400, 'All feilds are required');
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409, 'user already exists')
    }

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let avatarLocalPath = ''
    let avatar = ''
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length>0){
        avatarLocalPath = req.files.avatar[0].path;
        avatar = await uploadOnCloudinary(avatarLocalPath);
    }

    let coverImageLocalPath = ''
    let coverImage = ''
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    const user = await User.create({
        fullName,
        avatar: avatar?.url||'',
        coverImage: coverImage?.url||'',
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, 'something went wrong while registering the user')
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

} )

const loginUser = asyncHandler( async(req,res)=>{

    //console.log(req.body);    
    const { username, password } = req.body;

    if(!username){
        throw new ApiError(400, 'username is required')
    }
    if(!password){
        throw new ApiError(400, 'password is required')
    }

    const user = await User.findOne({username});
    if(!user){
        throw new ApiError(401, 'incorrect username or the username does not exists')
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(402, 'password is incorrect')
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200, {user : loggedInUser,accessToken,refreshToken}, "User logged in Successfully")
    )

})

const logoutUser = asyncHandler( async(req,res)=>{
    const _id= req.user._id;
    await User.findByIdAndUpdate(_id,{
        $set:{
            refreshToken : undefined
        }},{
        new: true
        } 
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie('accessToken',options).clearCookie('refreshToken',options).json(new ApiResponse(200,'User Logged out'))
} )

const refreshTokens = asyncHandler( async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken||req.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(400, 'error extracting refresh token');
    }

    const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    if(!decodedRefreshToken){
        throw new ApiError(401, 'refresh token cannot be verified');
    }


    const user = await User.findById(decodedRefreshToken._id);
    if(!user){
        throw new ApiError(502, 'user could not be found');
    }

    const {accessToken:newAccessToken , refreshToken:newRefreshToken} = await generateAccessAndRefreshToken(user._id);


    const options= {
        httpOnly: true,
        secure: true
    }

    res.status(200).cookie('accessToken', newAccessToken, options).cookie('refreshToken', newRefreshToken, options).json(
        new ApiResponse(200, {newAccessToken: newAccessToken, newRefreshToken: newRefreshToken}, 'tokens refreshed successfully')
    )

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res.status(200).json(new ApiResponse(200,req.user,"current user details"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    //username //email //fullName
    const {username,email,fullName}=req.body
    const changes = {}
    if(username){
        changes.username = username
    }
    if(email){
        changes.email = email
    }
    if(fullName){
        changes.fullName = fullName
    }
    const _id = req.user._id
    const updatedUser = await User.findByIdAndUpdate(_id, changes, {new:true}).select("-password -refreshToken");

    if(!updatedUser){
        throw new ApiError('could not find user');
    }

    res.status(200).json(new ApiResponse(200,updatedUser,'user updated successfully'))
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImagePath = req.file?.path

    if(!coverImagePath){
        throw new ApiError(400,'coverImage is missing')
    }

    const coverImage = await uploadOnCloudinary(coverImagePath)

    if(!coverImage.url){
        throw new ApiError(400, "error while uploading on cloudinary")
    }

    const user = await User.findById(req.user?._id)

    const oldUrl = user.coverImage;

    user.coverImage = coverImage.url;

    await user.save({validateBeforeSave:false});

    const isdeleted = await deleteFromCloudinary(oldUrl);

    if(!isdeleted){
        throw new ApiError(500, 'error deleting the old file');
    }

    return res.status(200).json(new ApiResponse(200,user,'coverImage updated'))
})

const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarPath = req.file?.path

    if(!avatarPath){
        throw new ApiError(400,'avatar is missing')
    }

    const avatar = await uploadOnCloudinary(avatarPath)

    if(!avatar.url){
        throw new ApiError(400, "error while uploading on cloudinary")
    }

    const user = await User.findById(req.user?._id)

    const oldUrl = user.avatar;

    user.avatar = avatar.url;

    await user.save({validateBeforeSave:false});

    const isdeleted = await deleteFromCloudinary(oldUrl);

    if(!isdeleted){
        throw new ApiError(500, 'error deleting the old file');
    }

    return res.status(200).json(new ApiResponse(200,user,'avatar updated'))
})


const getChannelProfile = asyncHandler(async(req,res)=>{
    const {username} =req.params;
    //console.log(req.params);
    if(!username?.trim()){
        throw new ApiError(400,'username is missing')
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,'channel does not exists')
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "user channel fetched successfully"))

})

const getWatchHistory = asyncHandler(async(req,res)=>{

    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup:{
                            from: 'users',
                            localField: 'owner' ,
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project:{
                                        username:1,
                                        fullName : 1,
                                        avatar: 1,
                                    },
                                },
                            ]
                        },
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: '$owner'
                            }
                        }
                    }
                ]
            }
        }
    ])

    res.status(200).json(new ApiResponse(200,user[0].watchHistory,'watch history fetched successfully'));

})

export {registerUser, loginUser, logoutUser, refreshTokens, changeCurrentPassword,getCurrentUser,updateAccountDetails,
    updateCoverImage, updateAvatar, getChannelProfile, getWatchHistory
}