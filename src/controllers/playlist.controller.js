import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async(req, res) => {
  const {name, description} = req.body
  
  if([name, description].some((field) => field.trim() === "")){
    throw new ApiError(400, "give name and description.")
  }

  const playlistVideos = await Playlist.create({
    name: name.toLowerCase(),
    owner: req.user._id,
    description
  })

  return res
  .status(200)
  .json(
      new ApiResponse(200, playlistVideos, "Playlist created successfully!")
    )
})

const getUserPlaylist = asyncHandler(async (req, res) => {
  const {userId} = req.params

  const user = await User.findById(userId)

  if(!user) {
    throw new ApiError(400, "User not found.")
  }

  const playlist = await Playlist.find({owner: userId})

  if(!playlist){
    throw new ApiError(400, "The user has not created any playlist")
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200, playlist, "This is the users playlist you asked for")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId)

  if(!playlist) {
    throw new ApiError(400,"Playlist doesnot exists.")
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200, playlist, "Here is your playlist!")
    )
})
export {createPlaylist, getUserPlaylist, getPlaylistById}
