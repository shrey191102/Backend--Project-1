import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiErrors.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessANDRefreshToken = async(userId)=>{
    try {
        const user= await User.findById(userId)
        const accessToken = User.generateAccessToken()
        const refreshToken = User.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,
        "something went wrong while generating access token and refresh token")
    }

}

const registerUser=asyncHandler(async (req,res)=>{
      // get user details from 
      const {username,email,password,fullName}=req.body
      console.log("email",email);
      
    // validation - not empty
    if (
        [username,email,password,fullName].some((field)=> field?.trim()===""))
        {
        throw new ApiError(400,"all fields must be present")
    }


    // check if user already exists: username, email
     
    const existedUser= await User.findOne({
        $or:[{username},{email}]
    })

    if (existedUser) {
        throw new ApiError(409,"user already exists")
    }

    // check for images, check for 
    
    const avatarLocalPath= req.files?.avatar[0]?.path  
    //const coverImageLocalPath= req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage)
         && req.files.coverImage.length>0) {
            coverImageLocalPath=req.files.coverImage[0].path
    
    }

    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file is required")
    }

    // upload them to cloudinary, avatar

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar) {
        throw new ApiError(500,"error uploading avatar to cloudinary")
    }

    // create user object - create entry in db

    const user=await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation
    if(!createdUser){
        throw new ApiError(500,"error creating user")
    }


    // remove password and refresh token field from response
    
    // return res

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )

})

const loginUser= asyncHandler(async (req,res)=>{
 // req body se  data 
 const {email,username,password} = req.body
    // check username or email
    if (!username || !email){
        throw new ApiError(400,"username or email required")
    }
    //find the user
    const user = await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        throw new ApiError(404,"User not found")
    }
    //password check
    const isPasswordValid= await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }
    //access and referesh token

    const {accessToken,refreshToken}=await generateAccessANDRefreshToken(user._id)
    //send cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options ={
        httpOnly: true,
        secure: true,
    }
    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
    ))
})

// logout user

const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{

        $set:{
            refreshToken: undefined,
        },
    },
    {
        new:true
    })
    const options={
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )
})

export {registerUser,loginUser,logoutUser}