import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
  const { content } = req.body

  if(!content){
    throw new ApiError(400, "Plese provide content.")
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id
  })

  if(!tweet){
    throw new ApiError(200, "Something went wrong while creating the tweet!")
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, tweet, "Tweet created successfully!")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
  const {userId} = req.params

  const user = await User.findById(userId)
  
  if(!user){
    throw new ApiError(400, "No user found!")
  }
  
  const userTweetsAggregate = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId) 
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "tweetLikes"
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $addFields: {
        likes: {
          $size: "$tweetLikes"
        },
        owner: {
          $first: "$owner"
        },
        isLiked: {
          $cond: {
            if: {
              $in:[req.user._id, "$tweetLikes.likedBy"]
            },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        owner: 1,
        likes: 1,
        isLiked: 1
      }
    }
  ])

  if(!userTweetsAggregate){
    throw new ApiError("Something went wrong while fetching tweets.")
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweetsAggregate, "Tweets fetched successfully.")
    )
})

const updateTweets = asyncHandler(async (req,res) => {
  const { tweetId } = req.params
  const { content } = req.body
  const tweet = await Tweet.findById(tweetId)

  if(!tweet){
    throw new ApiError(400, "No tweets were found!")
  }

  if(!content){
    throw new ApiError(400, "Please provide content to update.")
  }
  
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content  
      }
    },
    {new: true}
  )

  if(!updatedTweet){
    throw new ApiError(400, "Something went wrong while updating the tweet!")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTweet, "Tweets updated successfully.")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params

  const tweet = await Tweet.findById(tweetId)

  if(!tweet){
    throw new ApiError(400, "Tweet Not found!")
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

  if(!deletedTweet){
    throw new ApiError(400, "Something went wrong while uploading the tweet.")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {},"The tweet has deen deleted successfully.")
    )
})

export {
  createTweet,
  getUserTweets,
  updateTweets,
  deleteTweet 
}
