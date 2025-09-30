console.log("userRoutes.js loaded");

import express from "express";
import { getPublishedImages, getUser, loginUser, registerUser } from "../controllers/userController.js"
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router();

// Add debug logging for each route
userRouter.post('/register', (req, res) => {
    console.log("Register route hit!");
    registerUser(req, res);
});
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUser)
userRouter.get('/published-images', getPublishedImages
)


// userRouter.post('/register', (req, res) => {
//     console.log("Register route hit!");
//     registerUser(req, res);
// });


export default userRouter;