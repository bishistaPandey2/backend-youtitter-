import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { createPlaylist, getUserPlaylist, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist } from "../controllers/playlist.controller.js"

const router = Router()

router.use(verifyJWT)

router.route("/").post(createPlaylist)
router.route("/:playlistId").get(getPlaylistById)
router.route("/user/:userId").get(getUserPlaylist)
router.route("/add/:videoId/:playlistId").post(addVideoToPlaylist) 
router.route("/remove/:videoId/:playlistId").post(removeVideoFromPlaylist) 

export default router
