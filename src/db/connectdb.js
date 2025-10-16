import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectInterface = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`Mongo_DB is connected at host: ${connectInterface.connection.host}`)
    }
    catch (err) {
        console.log("MONGO_DB is not connectd: ",err)
    }
}

export default connectDB
