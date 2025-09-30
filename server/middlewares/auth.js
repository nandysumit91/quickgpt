import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    try {
        // ✅ Check if authorization header exists
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            // Extract token
            token = req.headers.authorization.split(" ")[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, token missing"
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded || !decoded.id) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, token invalid"
                });
            }

            const userId = decoded.id;

            // Find user and exclude password
            const user = await User.findById(userId).select("-password");

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, user not found"
                });
            }

            req.user = user;

            console.log("Protect Middleware — req.headers:", req.headers);
            console.log("Protect Middleware — req.body:", req.body);
            console.log("Protect Middleware — token:", token);
            console.log("Protect Middleware — decoded userId:", userId);

            next();
        } else {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing or malformed"
            });
        }
    } catch (error) {
        console.error("Protect middleware error:", error.message);
        res.status(401).json({
            success: false,
            message: "Not authorized, token failed"
        });
    }
};
