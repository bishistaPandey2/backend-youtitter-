import {Router} from "express";
import  {
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails
}from "../controllers/user.controllers.js";
import  {upload}  from "../middleware/multer.js";
import { verifyJWT }from "../middleware/auth.middleware.js"

// ROuter is on now
const router = Router();

router.route("/register").post(
  upload.fields([
      {name: 'avatar', maxCount: 1},
      {name: 'coverImage', maxCount: 1}
    ]),registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/c/:username").get(getUserChannelProfile)
router.route("/watchHistory").get(verifyJWT, getWatchHistory)
export default router
