import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("[Cloudinary] No file path provided");
      return null;
    }

    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "coWorker",
    });

    console.log(`[Cloudinary] Success: ${res.public_id}`);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return res;
  } catch (err) {
    console.error(
      `[Cloudinary] Error: ${err.message} (HTTP ${err.http_code || "N/A"})`
    );

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadToCloudinary };
