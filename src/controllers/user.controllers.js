import { User } from "../models/user.model.js"


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


  // removing user old avatar
     await User.findByIdAndUpdate(
          req.user?._id,
      {
        $set: {
          avatar: " "
        }
      }
    )


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


const getUserChannelProfile = asyncHandler((req,res) => {
  
  const {username} = req.params

  if (!username?.trim()){
    throw new ApiError(400, "username is substring")
  }

  const channel = await User.aggregate([
    {
      $match:{
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",   
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",   
        localField: "_id",
        foreignField: "subscriber" ,
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed:{
          $cond: {
            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1
      }
    }
  ])
  
  if (!channel?.length){
    throw new ApiError(404, "Channel doesnot exists!")
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200, channel[0],"User channel fetched successfully")
    )
})


const getWatchHistory = asyncHandler((req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id"
        as: "watchHistory"
        pipeline: [
          {
              $lookup: {
                from: "users",
                localField: "owner"
                foreignField: "_id"
                as: "owner",
                pipeline: [
                    $project: {
                        fullName: 1,
                        username: 1,
                        avatar: 1
                    }
                ]
              }
          },
          {
              $addFields: {
                owner:{
                  $first: "$owner"
                }
              }
          }
        ]
      }
    }
  ])
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
