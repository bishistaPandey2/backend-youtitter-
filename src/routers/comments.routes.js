import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { addComment, updateComment, deleteComment } from "../controllers/comment.controller.js"
import { toggleVideoPublishStatus } from "../controllers/video.controller.js"

const router = Router()

router.use(verifyJWT)

router.route("/:videoId").post(addComment)
router.route("/:commentId").patch(updateComment).delete(deleteComment)

export default router
