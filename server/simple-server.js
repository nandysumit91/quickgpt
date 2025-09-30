import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'

const app = express()

await connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Debug middleware
app.use((req, res, next) => {
    console.log("=== REQUEST ===");
    console.log("URL:", req.url, "Method:", req.method);
    next();
});

// Simple test route
app.get('/', (req, res) => res.send('Server is Live!'))

// Direct registration route
app.post('/api/user/register', (req, res) => {
    console.log("Register route hit!");
    console.log("Body:", req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Name, email, and password are required" 
        });
    }
    
    // For now, just return success without database
    res.json({ 
        success: true, 
        message: "User registered successfully!",
        user: { name, email }
    });
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
