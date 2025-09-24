import User from "../models/user_model.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!(email && password))
      throw new ApiError(400, "Email and Password both needed");
    let user = await User.findOne({ email });
    if (user) throw new ApiError("User exists");
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
    const userWithoutPassword = await User.findBYId(user._id).select(
      "-password"
    );

    const option = {
      httpOnly: true,
      Secure: true,
    };
    return res
      .status(201)
      .cookie("Access token", token, option)
      .json(
        new ApiResponse(
          201,
          { user: userWithoutPassword, token },
          "user register Successful"
        )
      );
  } catch (error) {
    return ApiError(401, "Error in register user ");
  }
};

const loginUser = async(req,res)=>{
    const {email,password}= req.body;

    let user = User.findOne({email});
    if(!user) throw new ApiError(400, "User is not found");

    const checkPassword= await bcrypt.compare(password,user.password);
    if(!checkPassword) throw new ApiError(400,"Wrong Password");

    const token = await jwt.sign(
        {
            _id:user._id,
            email: email
        },
        JWT_SECRET,
        {
            expiresIn:"7d"
        }
    )
    
    if(!token) throw new ApiError(400,"Error in creating jwt token");


    const userWithoutPassword = await User.findBYId(user._id).select(
      "-password"
    );

    const option = {
      httpOnly: true,
      Secure: true,
    };
    return res
      .status(201)
      .cookie("Access token", token, option)
      .json(
        new ApiResponse(
          201,
          { user: userWithoutPassword, token },
          "user register Successful"
        )
      );
}

const logoutUser= async(req,res)=>{

    const option = {
      httpOnly: true,
      Secure: true,
    };

    return res.status(201)
            .clearCookie("Access Token",option)
            .json(new ApiResponse(201,"User logged out successfully"))


}


export {
    registerUser,
    loginUser,
    logoutUser
}