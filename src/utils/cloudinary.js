import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        // Upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto" 
        })
        //console.log("I am in cloudinary",response)
        //console.log("file is uploades on cloudinary",response.url)
        fs.unlinkSync(localFilePath) 
        return response;
    }
    catch(err){
        //Remove the locally saved tempropary file
        fs.unlinkSync(localFilePath)
        console.log("Failed to upload to cloudinary!!!", err)
    }
}

const uploadVideoOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null
    
    const response = await cloudinary.uploader.upload(localFilePath,{
      resource_type: "video"
    })

    fs.unlinkSync(localFilePath)
    return response;

  } catch (err) {
    fs.unlinkSync(localFilePath)
    console.log("Failed to upload on cloudinary")
  }
}
export { uploadVideoOnCloudinary, uploadOnCloudinary }
