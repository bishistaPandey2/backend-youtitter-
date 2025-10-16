import mongoose from "mongoose"
import connectDB from "./db/connectdb.js"
import dotenv from "dotenv"
import { app } from "./app.js"

dotenv.config(
    {
        path: '../.env'
    }
)

connectDB()
.then(() => {
        app.listen(8000, () => {
            console.log(`Server is at port : ${process.env.PORT}`)
        })
    }
)
.catch( (err) => {
        console.log('Server is not running!!!')
    }
)
