import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {
	const { title, description, views } = req.body;

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
		thumbnailUrl = req.files.thumbnail[0].path;
	}
	//const thumbnail = req.files?.path

	const videoFile = await uploadOnCloudinary(videoUrl);
	const thumbnail = await uploadOnCloudinary(thumbnailUrl);

	const uploadVideo = await Video.create({
		videoFile: videoFile.url,
		thumbnail: thumbnail?.url || " ",
		title,
		description,
		duration: videoFile.duration,
	});

	return res
		.status(200)
		.json(new ApiResponse(200, uploadVideo, "The video is uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!videoId) {
		throw new ApiError(404, "VideoId not received");
	}

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
        thumbnail: res.file?.thumbnail || "", //req.file.thumbnail || " ",
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

export { publishAVideo, getVideoById, updateVideo };
