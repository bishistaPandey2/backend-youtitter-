import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { createPlaylist, getUserPlaylist} from "../controllers/playlist.controller.js"

const router = Router()

router.use(verifyJWT)

router.route("/createPlaylist").post(createPlaylist)
router.route("/fetchPlaylist/:userId").get(getUserPlaylist)

export default router
