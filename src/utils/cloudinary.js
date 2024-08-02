import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './ApiError.js';

const uploadOnCloudinary = async (localFilePath) => {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

    try {
        if(!localFilePath){
            return null;
        }
         
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: 'auto',
            }
        )
        //console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;    
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteFromCloudinary = async(url)=>{
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

    const regex = /\/([^\/]*?)\.(jpg|jpeg|png|gif|bmp|tiff|svg|webp)$/; // Match the public ID and the extension
    const match = url.match(regex);

    const publicId = match ? match[1] : null;
    if (!publicId) {
        throw new ApiError(500, 'Invalid Cloudinary URL or public ID could not be extracted.')
    }
    const result = await cloudinary.uploader.destroy(publicId);
    if(result){
        return true;
    }else{
        return false;
    }
}

export {uploadOnCloudinary,deleteFromCloudinary};