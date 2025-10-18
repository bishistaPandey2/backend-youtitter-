import {Router} from "express";
import  {registerUser, loginUser, logOutUser, refreshAccessToken}  from "../controllers/user.controllers.js";
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
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refresh-token").post(refreshAccesstoken)

export default router
