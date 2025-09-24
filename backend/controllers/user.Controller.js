import User from "../models/user_model.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from'jsonwebtoken';
import { asyncHandler } from "../utils/asyncHandler.js";



const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!(email && password))
      throw new ApiError(400, "Email and Password both needed");
    let user = await User.findOne({ email });
    if (user) throw new ApiError(402,"user exsist")
    
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({
      name: name,
      email: email,
      password: passwordHash,
    });
    const token = jwt.sign(
      { id: user._id, name: name },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const userWithoutPassword = await User.findById(user._id).select(
      "-password"
    );
    if(!userWithoutPassword) throw new ApiError(404,"user not created");

    const option = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax"
    };
    return res
      .status(201)
      .cookie("AccessToken", token, option)
      .json(
        new ApiResponse(
          201,
          { user: userWithoutPassword, token },
          "user register Successful"
        )
      );
  } catch (error) {
    console.log(error);
    const status = error?.statusCode || 400;
    return res.status(status).json(new ApiResponse(status, null, error?.message || "Error in register user"));
    
  }
});

const loginUser = asyncHandler( async(req,res)=>{
    const {email,password}= req.body;
    console.log(email,password)

    let user = await User.findOne({email});
    if(!user) throw new ApiError(400, "User is not found");

    const checkPassword= await bcrypt.compare(password,user.password);
    if(!checkPassword) throw new ApiError(400,"Wrong Password");

    const token = await jwt.sign(
        {
            _id:user._id,
            email: email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d"
        }
    )
    
    if(!token) throw new ApiError(400,"Error in creating jwt token");


    const userWithoutPassword = await User.findById(user._id).select(
      "-password"
    );

    const option = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
    };
    return res
      .status(200)
      .cookie("AccessToken", token, option)
      .json(
        new ApiResponse(
          200,
          { user: userWithoutPassword, token },
          "user login Successful"
        )
      );
})

const logoutUser= asyncHandler(async(req,res)=>{
    const option = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
    };

    res.clearCookie("AccessToken", option);
    return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
})

const getUserProfile = asyncHandler(async(req,res)=>{
    // Get user from request (assumes authentication middleware sets req.user)
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized: User not authenticated");
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, { user }, "User profile fetched successfully"));
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile
}