import { Router } from "express";
import {
	getVideoById,
	publishAVideo,
	updateVideo,
  deleteVideo,
  getAllVideos,
  toggleVideoPublishStatus 
} from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router();

router.use(verifyJWT); //apply jwt middleware to all

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
).get(getAllVideos);

router.route("/:videoId").get(getVideoById);
router.route("/:videoId/edit").delete(deleteVideo).patch(upload.single("thumbnail"),updateVideo);
router.route("/:videoId/toggle").head(toggleVideoPublishStatus )

export default router;
