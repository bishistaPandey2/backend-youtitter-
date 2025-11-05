import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    cretentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRouter from "./routers/routes.js"
import videoRouter from "./routers/video.routes.js"
import commentRouter from "./routers/comments.routes.js"
import playlistRouter from "./routers/playlist.routes.js"
import tweetsRouter from "./routers/tweet.routes.js"
//routes declration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/tweets", tweetsRouter)
//https://localhost:8000/api/v1/users/register
export { app }
