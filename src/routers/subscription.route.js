import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import {
  getUserChannelSubscribers,
  toggleSubscription,
  getSubscribedChannels
} from "../controllers/subscription.controllers.js";
const router = Router()

router.use(verifyJWT)
router.route("/c/:channelId").post(toggleSubscription).get(getUserChannelSubscribers)
router.route("/u/:subscriberId").get(getSubscribedChannels)
export default router
