import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const {videoId} = req.params
    //TODO: toggle like on video
  if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiError(400, "Invalid videoId given.")
  } 

  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id
  })

  if(isLiked){
    const liked = await Like.findByIdAndDelete(isLiked._id)

    if(!liked){
      throw new ApiError(400, "Unable to unlike.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {liked: false}, "Unliked.")
      )
  }

  const like = await Like.create({
    video: new mongoose.Types.ObjectId(videoId),
    likedBy: req.user._id
  })

  if(!like){
    throw new ApiError(400, "Unable to like.")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {liked: true},"Liked.")
    )
})


export{
  toggleVideoLike
}
