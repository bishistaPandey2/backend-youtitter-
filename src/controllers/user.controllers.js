import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
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

const generateAccessAndRefreshTokens = async(userId) => {
    try{
      const user =  await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
      
      //adding value inside user
      user.refreshToken = refreshToken

      // Use no validation like ask for passwd but just save i told so
      await user.save({validateBeforeSave: false})

    console.log(user)
      return {accessToken, refreshToken}


    } catch (err){
      throw new ApiError(500, "Something went wrong while generating refresh and acccess token")
    }
}
// loging user in.
const loginUser = asyncHandler (async(req,res) => {
  // req body -> data
  // ask username or email
  // find one
  // password check
  // access and refresh token
  // send cookies 
  const {email, username, password} = req.body

  if (!(username || email)) {
      throw new ApiError(400, "username or email is required")
  }

  const user = await User.findOne({
      $or: [{username},{email}]
  })
  if (!user){
    throw new ApiError(404, "User doesnot exists!");
  }

  // This is our user since we made the method ourself on mongoose schema.
  // think it like a object
  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
      throw new ApiError(401, "Invalid user credentials")
  }

  
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

// Cookie option
  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(200,
          {
            user: loggedInUser, 
            accessToken,
            refreshToken
          },
          "User Logged In Successfully"
      )
  )


})

const logOutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
       req.user._id,
       {
          $set: {
              refreshToken: undefined
          } 
       },
    )
    const options = {
          httpOnly: true,
          secure: true
    }  
        
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out!!"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try{
    const decodedToken = jwt.verify(
        incommingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid refresh token!!!!")
    }
    
    if (incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is espired or used")
    }

    const options = {
        httpOnly: true,
        secoure: true
    }

    const {accessToken, newrefreshToken} = await generateAccessAndRefreshToens(user._id)
  

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken},
            "Access token refreshed"
        )
    )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Toen!")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassowrd, confPassword} = req.body
    
    //if(!(newPassword === confPassword)){}
    const user = User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCOrrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
      return res
      .status(200)
      .json(200, req.user,"current user fetched successfull")
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email) {
        throw new ApiError(400, 'All fields are required')
    }
    
    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                  fullName,
                  email,
            } 
        },
        {new: true},

    ).select("-password")
    
    return res
    .status(200)
    .json{new ApiREsponse(200, user, "Account details updated successfully!")}
})

const updateUserAvatar = asybcHandler(async(req,res)
=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        console.log(400, "Avatar fie is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, 'Error while updating on avatar');

        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar Update!!")
    )
})

// Updateuser
const updateUserCover = asybcHandler(async(req,res)
=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        console.log(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, 'Error while updating on avatar');

        
    }

   const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage = coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image Update!!")
    )
})

// Exporting
export {
  getCurrentUser,
  changeCurrentPassword, 
  registerUser, 
  loginUser,
  logOutUser, 
  refreshAccessToken,
  updateUserAvatar,
  updateUserCover 
}
