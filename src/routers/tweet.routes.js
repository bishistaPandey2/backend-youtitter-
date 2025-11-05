import {Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { 
  createTweet,
  getUserTweets,
  updateTweets,
  deleteTweet  
} from "../controllers/tweet.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/").post(createTweet)
router.route("/get/:userId").get(getUserTweets)
router.route("/:tweetId").patch(updateTweets).delete(deleteTweet)
export default router
