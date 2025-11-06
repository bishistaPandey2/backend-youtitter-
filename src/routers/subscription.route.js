import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import {
  getUserChannelSubscribers,
  toggleSubscription
} from "../controllers/subscription.controllers.js";
const router = Router()

router.use(verifyJWT)
router.route("/:channelId").post(toggleSubscription).get(getUserChannelSubscribers)

export default router
