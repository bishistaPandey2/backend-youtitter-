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

const toggleCommentLike = asyncHandler(async (req, res) => {
  const {commentId} = req.params
    //TODO: toggle like on comment
  if(!mongoose.Types.ObjectId.isValid(commentId)){
    throw new ApiError(400, "Invalid commentId given")
  }

  const isLiked = await Like.findOne({
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: req.user._id
  })

  if(isLiked){
    const likedComment = await Like.findByIdAndDelete(isLiked._id)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {liked: false}, "Comment unliked!")
      )
  }

  const likeComment = await Like.create({
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: req.user._id
  })

  return res
    .status(200)
    .json(
      new ApiResponse(200, likeComment, "Comment Liked!")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const {tweetId} = req.params
    //TODO: toggle like on tweetId

  const isLiked = await Like.findOne({
    tweet: new mongoose.Types.ObjectId(tweetId),
    likedBy: req.user._id
  })

  if(isLiked){
    await Like.findByIdAndDelete(isLiked._id)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {like: false}, "Tweet Unliked!")
      )
  }

  await Like.create({
    tweet: new mongoose.Types.ObjectId(tweetId),
    likedBy: req.user._id
  })

  return res
  .status(200)
  .json(
      new ApiResponse(200, {like: true}, "Tweet Liked!")
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true }
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "videoOwner"
            }
          },
          {
            $unwind: "$videoOwner"
          },
        ]
      },
    },
    {
      $unwind: "$likedVideos"
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $project: {
        _id:0,
        likedVideos: {
          _id: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          "videoFile.url": 1,
          thumbnail: 1,
          owner: 1,
          isPublished: 1,
          createdAt: 1,
          videoOwner: {
            username: 1,
            fullName: 1,
            avatar: 1
          },
        },
      },
    },

  ])

  return res
  .status(200)
  .json(
      new ApiResponse(200, likedVideos, "Vides fetched successfully!")
    )
})

export{
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos
}
