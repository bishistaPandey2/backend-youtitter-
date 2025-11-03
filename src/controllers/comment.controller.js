import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
  const {videoId} = req.params
  const {page = 1, limit = 10} = req.query




})

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
  const { commentId } = req.params
  console.log(commentId)
  const { content } = req.body
  if(!content){
    throw new ApiError(400, "Kei ta lekh vai!")
  }

  const editedContent = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content
      }
    },
    {new: true}
  )

  console.log(editedContent)
  return res
  .status(200)
  .json(
      new ApiResponse(200, editedContent, "Comment Editted successfully!")
    )


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
  const {commentId} = req.params

  if (!commentId) {
    throw new ApiError(400, "commentId not found")
  }

  const commentToDelete = await Comment.findByIdAndDelete({_id: commentId})

  if(!commentToDelete){
    throw new ApiError(400, "No comment was found")
  }

  return res
  .status(200)
  .json(
      new ApiError(200, {}, "comment deleted successfully.")
    )
})

export { addComment, updateComment, deleteComment }
