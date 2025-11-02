import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { addComment } from "../controllers/comment.controller.js"
import { toggleVideoPublishStatus } from "../controllers/video.controller.js"
const router = Router()

router.use(verifyJWT)

router.route("/:videoId").post(addComment)

export default router
