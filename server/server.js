import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'
import User from './models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js'
import creditRouter from './routes/creditRoutes.js'
import { stripeWebhooks } from './controllers/webhooks.js'

const app = express()

await connectDB()

// Stripe Webhooks
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// Middleware

app.use(cors())
app.use(express.json())

// Debug middleware
app.use((req, res, next) => {
    console.log("=== REQUEST ===");
    console.log("URL:", req.url, "Method:", req.method);
    next();
});

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

// Routes 
app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

// Registration route with database
app.post('/api/user/register', async (req, res) => {
    console.log("Register route hit!");
    console.log("Body:", req.body);
    
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, email, and password are required" 
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Create new user
        const user = await User.create({ name, email, password });
        
        // Generate JWT token
        const token = generateToken(user._id);
        
        res.json({ 
            success: true, 
            message: "User registered successfully!",
            token,
            user: { 
                id: user._id,
                name: user.name, 
                email: user.email 
            }
        });
        
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Login route
app.post('/api/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);
        
        res.json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user data route (requires authentication)
app.get('/api/user/data', async (req, res) => {
    try {
        console.log("=== USER DATA REQUEST ===");
        console.log("Headers:", req.headers);
        console.log("Authorization header:", req.headers.authorization);
        
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        console.log("Auth header exists:", !!authHeader);
        console.log("Auth header starts with Bearer:", authHeader?.startsWith('Bearer '));
        
        if (!authHeader) {
            console.log("No authorization header found");
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Handle both "Bearer token" and direct token formats
        let token;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        } else {
            token = authHeader; // Use token directly
        }
        console.log("Token extracted:", token.substring(0, 20) + "...");
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded successfully:", decoded);
        
        const user = await User.findById(decoded.id).select('-password');
        console.log("User found:", !!user);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error("Get user data error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})