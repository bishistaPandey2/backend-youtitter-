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

  const userTweets = await Tweet.find({owner: userId})

  if(!userTweets){
    throw new ApiError(400, "Tweet cannot be found!")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweets, "Tweets fetched successfully.")
    )
})


export {
  createTweet,
  getUserTweets
}
