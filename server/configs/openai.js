import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY, // ✅ always load from env
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export default openai;
