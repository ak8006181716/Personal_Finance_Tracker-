import jwt from "jsonwebtoken";
import User from "../models/user_model.js";
import cookieParser from "cookie-parser";
import ApiError from "../utils/ApiError.js";

export const auth = async (req, res, next) => {
  const token =
    req.cookies?.AccessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new ApiError(401, "No token");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.id;
    req.user = await User.findById(userId).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};
