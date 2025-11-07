import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, uploadVideoOnCloudinary } from "../utils/cloudinary.js";
import {User} from "../models/user.model.js"

const getAllVideos = asyncHandler(async (req, res) => {
  const { page= 1,limit = 10, query, sortBy, sortType, userId } = req.query

  const pipeline = [];

  if(query){
    pipeline.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          path: ["title","description"]// serch only on title and desc
        }
      }
    })
  }

  if(userId){
    if(!mongoose.Types.ObjectId.isValid(userId)){
      throw new ApiError(400, "Invalid user id")
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    })
  }

  if(sortBy && sortType){
    pipeline.push({
      $sort: {
        [sortBy]: sortby === "asc"? -1 : 1 
      }
    })
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "ownerDetails",
      pipeline: [
        {
          $project: {
            username:1,
            avatar:1
          }
        }
      ]
    },
    },
    {
      $unwind: "$ownerDetails"
    },
  )


  const videoAggregate = Video.aggregate(pipeline)

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  }

  const video = await Video.aggregatePaginate(
    videoAggregate,
    options
  )

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "here is your video")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
	const { title, description, category} = req.body;

	const videoUrl = req.files?.videoFile[0]?.path;
	if (!videoUrl) {
		throw new ApiError(400, "thumbnail and video is required");
	}

	let thumbnailUrl;
	if (
		req.files &&
		Array.isArray(req.files.thumbnail) &&
		req.files.thumbnail.length > 0
	) {
		thumbnailUrl = req.files.thumbnail.path;
	}
	//const thumbnail = req.files?.path

	const videoFile = await uploadVideoOnCloudinary(videoUrl);
	const thumbnail = await uploadVideoOnCloudinary(thumbnailUrl);

  console.log(videoFile)

	const uploadVideo = await Video.create({
		videoFile: {
      url: videoFile.url,
      publicId: videoFile.public_id
    },
		thumbnail: thumbnail?.url || " ",
		title,
		description,
		duration: videoFile.duration, // in seconds
    owner: new mongoose.Types.ObjectId(req.user._id)
	})

  console.log(req.user)
	return res
		.status(200)
		.json(new ApiResponse(200, uploadVideo, "The video is uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!videoId) {
		throw new ApiError(404, "VideoId not received");
	}

  await Video.findByIdAndUpdate(
    videoId,
    {$inc:{views: 1}},
    {new: true}
    
  )  
	const wantedVideo = await Video.findById(videoId);

	if (!wantedVideo) {
		throw new ApiError(404, "No video was found");
	} 

	return res
		.status(200)
		.json(new ApiResponse(200, wantedVideo, "Here is your video"));
});

const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	//TODO: update video details like title, description, thumbnail

	if (!videoId) {
		throw new ApiError(404, "No videoId was foud or given");
	}

	const { title, description } = req.body;

	  if ([title, description].some((fields) => (fields).trim() === " ")){
	    throw new ApiError(400, "Fill every fields")
	  }

  let thumbnailUrl
  if (
    req.file &&
    Array.isArray(req.file.thumbnail) &&
    (req.file.thumbnail).length >> 0 
    ) {
    thumbnailUrl = req.file.thumbnailUrl.path
  }
  

  const thumbnail = await uploadOnCloudinary(thumbnailUrl)

	const extractedVideo = await Video.findByIdAndUpdate(
		videoId,
		{
			$set: {
        thumbnail: res.file?.thumbnail.url || "", //req.file.thumbnail || " ",
				description,
				title,
			},
		},
		{ new: true },
	);

	res
		.status(200)
		.json(new ApiResponse(200, extractedVideo, "Video is edited!!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
    //TODO: delete video
  if (!videoId){
    throw new ApiError(400, "Provide video ID!!")
  }

  const deletedVideo = await Video.findOneAndDelete({_id:videoId})
  
  if(!deleteVideo || deletedVideo === null){
    throw new ApiError(400,"Unable to delete video")
  } 

  return res
  .status(200)
  .json(
      new ApiResponse(200, deletedVideo, "The video was deleted successfully!")
    )
})

const toggleVideoPublishStatus = asyncHandler(async(req,res) => {
  const { videoId } = req.params

  if(!videoId){
    throw new ApiError(400, "Video not found")
  }

  const publishedVideo = await Video.findById(videoId,{
    views: 0
  })

  if(!publishedVideo.isPublished){
    throw new ApiError(200, "video is not published for users to see")
  }

  
  next()

})

export {getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, toggleVideoPublishStatus};
