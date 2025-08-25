import { v4 as uuid } from "uuid";
import cloudinary from "../config/cloudinary";

export const uploadImage = async (
    file: string
): Promise<{ imageUrl: string; success: boolean }> => {
    return new Promise((resolve) => {
        cloudinary.uploader.upload(
            file,
            { folder: "Gym_Dashboard", public_id: uuid() },
            async function (error, result) {
                if (error) {
                    return resolve({
                        imageUrl: null,
                        success: false,
                    });
                }
                if (result) {
                    return resolve({
                        imageUrl: result.secure_url,
                        success: true,
                    });
                }
            }
        );
    });
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
    await cloudinary.uploader.destroy(
        new URL(imageUrl).pathname
            .split("/")
            .slice(5)
            .join("/")
            .replace(/\.[^/.]+$/, "")
    );
};
