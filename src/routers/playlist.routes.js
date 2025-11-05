import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { 
  createPlaylist, 
  getUserPlaylist, 
  getPlaylistById, 
  addVideoToPlaylist, 
  removeVideoFromPlaylist, 
  deletePlaylist,
  updatePlaylist  
} from "../controllers/playlist.controller.js"

const router = Router()

router.use(verifyJWT)

router.route("/").post(createPlaylist)
router.route("/:playlistId").get(getPlaylistById).delete(deletePlaylist).patch(updatePlaylist )
router.route("/user/:userId").get(getUserPlaylist)
router.route("/add/:videoId/:playlistId").post(addVideoToPlaylist) 
router.route("/remove/:videoId/:playlistId").post(removeVideoFromPlaylist) 

export default router
