import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const addComment = asyncHandler(async(req, res) => {
  const { videoId } = req.params
  const { content } = req.body


  if(!content) {
     throw new ApiError(400, "Content must be provided.")
  }

  const video = await Video.findById(videoId)

   if (!video) {
    throw new ApiError(400, "No video was found.")
  }

  const comment = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(videoId), 
    owner: req.user._id
  })

  return res
  .status(200)
  .json(
      new ApiResponse(200, comment, "The comment is added successfully.")
    )
  
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO:update a comment
    
  const { editContent } = req.body
    
  if(!editContent){
    throw new ApiError(400, "Kei ta lekh vai!")
  }

  const editinfContent = await Comment.aggregate([
    
  ])


})

export { addComment }
