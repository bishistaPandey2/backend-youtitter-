import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
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

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const {playlistId, videoId} = req.params

  const video = await Video.findById(videoId)


  if(!video){
    throw new ApiError(400, "No video found!")
  }

  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(400, "Video not found!") 
  }

  console.log(playlist.owner) 
  console.log(req.user._id) 

  if(playlist.owner.toString() !== req.user._id.toString()){
    throw new ApiError(400,"Only owner of playlist can add video")
  }

  if(playlist.videos.includes(videoId)){
    throw new ApiError(400,"Video alrady exists in the playlist!")
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlist?._id,
    {
      $addToSet: {
        videos: videoId 
      }
    },
    {new: true}
  )
  


  if (!updatePlaylist){
    throw new ApiError(402, "Failed to add video to playlst please try again!")
  }
  return res
  .status(200)
  .json(
      new ApiResponse(200, updatePlaylist, "The video is added successfully!")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
   const {playlistId, videoId} = req.params
    // TODO: remove video from playlistVideos
  const playlist = await Playlist.findById(playlistId)
  const video = await Video.findById(videoId)

  if (!video){
    throw new ApiError(400, "Video not found")
  }

  if (!playlist){
    throw new ApiError(400, "Playlist not found")
  }

  const removeVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId
      }
    },
    { new: true }
  )

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Video was removed successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
    // TODO: delete playlist
  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(400, "Playlist cannot be found!")
  }

  const updatePlaylist = await Playlist.findByIdAndDelete(playlist?._id)

  if(!updatePlaylist){
    new ApiError()
  }
  return res
  .status(200)
  .json(
      new ApiError(200, {},"The video was deleted successfully.")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  const {name, description} = req.body
  
  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(400,"Playlist doesnot exists.")
  }

  if([name, description].some((fields) => fields.trim() === "")) {
    throw new ApiError(402, "Name and description are required.")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist._id,
    {
      $set: {
        name,
        description
      }
    },
    {new: true}
  )

  if(!updatedPlaylist){
    throw new ApiError(400, "Something went wrong while updating the playlist.")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully.")
    )
})


export { 
  createPlaylist, 
  getUserPlaylist, 
  getPlaylistById, 
  removeVideoFromPlaylist,
  addVideoToPlaylist,
  deletePlaylist,
  updatePlaylist 
}

