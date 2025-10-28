import { Router } from "express";
import {
	getVideoById,
	publishAVideo,
	updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.js";

const router = Router();

router.route("/").post(
	upload.fields([
		{
			name: "videoFile",
			maxcount: 1,
		},
		{
			name: "thumbnail",
			maxcount: 1,
		},
	]),
	publishAVideo,
);

router.route("/:videoId").get(getVideoById);
router.route("/:videoId/edit").patch(upload.single("thumbnail"),updateVideo);

export default router;
