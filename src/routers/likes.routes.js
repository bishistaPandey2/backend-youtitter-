import {Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  toggleVideoLike 
} from "../controllers/like.controller.js";
const router = Router()

router.use(verifyJWT)

router.route("/v/:videoId").post(toggleVideoLike)

export default router
