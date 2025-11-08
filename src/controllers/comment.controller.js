import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
  const {videoId} = req.params
  const {page=1, limit=10} = req.query

  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "commentLikes"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as:"owner",
      }
    },
    {
      $addFields:{
        owner: {
          $first: "$owner"
        },
        likes: {
          $size: "$commentLikes"
        },
        isLiked: {
          $cond: {
            if: {
              $in: [req.user._id, "$commentLikes.likedBy"]
            },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $project: {
        owner: {
          username: 1,
          avatar: 1
        },
        createdAt: 1,
        content: 1,
        likes: 1,
        isLiked: 1
      }
    },
  ])

  const options = {
    page: parseInt(page, 10), 
    limit: parseInt(limit, 10)
  }

const comments = await Comment.aggregatePaginate(
    commentsAggregate, 
    options
)

  return res
  .status(200)
  .json(
      new ApiResponse(200, comments, "These are all the coments on the video.")
    )
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

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "comment not found")
  }

  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only comment owner can delete their comment");
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

export { getVideoComments, addComment, updateComment, deleteComment }
