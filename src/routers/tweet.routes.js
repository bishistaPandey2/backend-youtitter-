import {Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { 
  createTweet,
  getUserTweets
} from "../controllers/tweet.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/").post(createTweet)
router.route("/get/:userId").get(getUserTweets)
export default router
