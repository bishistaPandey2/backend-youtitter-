import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
  const {channelId} = req.params
    // TODO: toggle subscription
  if(!mongoose.Types.ObjectId.isValid(channelId)){
    throw new ApiError(400, "The channel id is not valid.")
  }

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId
  })

  if (isSubscribed){
    await Subscription.findByIdAndDelete(isSubscribed?._id)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {subscribed: false}, "Unsubscrbed")
      )
  }

  await Subscription.create({
    channel: channelId,
    subscriber: req.user._id
  })

  return res
  .status(200)
  .json(
      new ApiResponse(200, {subscribed: true}, "Subscribed")
    )

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const {channelId} = req.params

  if(!mongoose.Types.ObjectId.isValid(channelId)){
    throw new ApiError(400, "Invald channel Id given!")
  }

  const subscribers = await Subscription.find({channel: channelId}).select("-channel -createdAt -updatedAt")

  if(!subscribers){
    throw new ApiError(400, "No subscribers found")
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200, subscribers, "Here are your Subscribers!")
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const {subscriberId} = req.params
  console.log(subscriberId)
  
  if(!mongoose.Types.ObjectId.isValid(subscriberId)){
    throw new ApiError(400, "Invalid user Id given.")
  }

  const subscribedTo = await Subscription.find({subscriber: subscriberId}) 

  if(!subscribedTo){
    throw new ApiError(400, "No channels found.")
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200, subscribedTo, "These are all the channels you have subscribed to.")
    )
})



export { 
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}
