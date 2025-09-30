import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const mongodbUri = process.env.MONGODB_URI;

        if(!mongodbUri){
            console.error("MONGODB_URI is not set. Please add it to your .env file.");
            throw new Error("Missing MONGODB_URI environment variable");
        }

        // Build a safe, masked log of the target host/db without leaking credentials
        let hostInfo = "unknown";
        try {
            const parsed = new URL(mongodbUri);
            const host = parsed.host;
            const pathname = parsed.pathname || "/";
            hostInfo = `${host}${pathname}`;
        } catch {}
        console.log(`Attempting MongoDB connection to: ${hostInfo}`);

        mongoose.connection.on('connected', ()=> console.log('Database connected'))
        mongoose.connection.on('error', (err)=> console.error('MongoDB connection error:', err.message))
        mongoose.connection.on('disconnected', ()=> console.warn('MongoDB disconnected'))

        await mongoose.connect(mongodbUri);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message)
        throw error
    }
}

    export default connectDB;
