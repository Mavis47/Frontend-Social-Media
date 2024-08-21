import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { CLOUDINARY_OPTIONS } from './cloudinary';

cloudinary.config(CLOUDINARY_OPTIONS);

export const uploadVideo = async (mediaPath: string, folder = "Posts") => {
    try {
        const options = {
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            folder,
        }
        const result = await cloudinary.uploader.upload(mediaPath, { resource_type: 'video',...options});
        return result;
    } catch (error) {
        console.log("error in cloudinary function",error);
    }
};

export const uploadImage = async (mediaPath: string, folder = "Posts") => {
    try {
        const options = {
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            folder,
        }
        const result = await cloudinary.uploader.upload(mediaPath, { resource_type: 'image',...options});
        return result;
    } catch (error) {
        console.log("error in cloudinary function",error);
    }
};

export const uploadProfileImage = async (mediaPath: string, folder = "Profile_Pic") => {
    try {
        const options = {
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            folder,
        }
        const result = await cloudinary.uploader.upload(mediaPath, { resource_type: 'image',...options});
        return result;
    } catch (error) {
        console.log("error in cloudinary Profile Image function",error);
    }
};
