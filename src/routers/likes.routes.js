import {Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  toggleVideoLike,
  toggleCommentLike
} from "../controllers/like.controller.js";
const router = Router()

router.use(verifyJWT)

router.route("/v/:videoId").post(toggleVideoLike)
router.route("/c/:commentId").post(toggleCommentLike)

export default router
