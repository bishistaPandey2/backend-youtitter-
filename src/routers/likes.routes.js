import {Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import {  } from "../controllers/like.controller.js";
const router = Router()

router.use(verifyJWT)
