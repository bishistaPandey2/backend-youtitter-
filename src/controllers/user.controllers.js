import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req, res) => {
//    res.status(200).json({
//       message:"Bishista ko code ho yo!"
//    })

    const {fullName,username,password,email} = req.body

    if([fullName,username,password,email].some((fields)=>fields.trim()===" ")){
        throw new ApiError(400,"Fill every given field!!");
    }
  
  const existedUser = await User.findOne({
      $or: [{username},{email}]
  })

    if ( existedUser ){
        throw new ApiError(409,"User with same username or email exists!!")
    }
  const avatarLocalPath = req.files?.avatar[0]?.path
  //const coverUrl = req.files?.coverImage[0]?.path
  
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path  
  }


  if(!avatarLocalPath){
        throw new ApiError(400,"Avatar Url is required")
  }
  
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
        throw new ApiError(400,"Avatar is required")
  }
  
  const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage?.url || " ",
      password,
      email
  })
  
  const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )
  if (!createdUser){
      throw new ApiError(409,"Something was wrong while regestering the user.")
  }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

}
)

export default registerUser
