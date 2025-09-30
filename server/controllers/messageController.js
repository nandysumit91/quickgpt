// controllers/chatController.js

import Chat from "../models/Chat.js";
import User from "../models/User.js";
import axios from "axios";
import imagekit from "../configs/imagekit.js";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ Correct import

// ---------------- GEMINI HELPER ----------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);

    console.log("Gemini raw result:", JSON.stringify(result, null, 2));

    const replyText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI returned empty response";

    return {
      role: "assistant",
      content: replyText,
      timestamp: Date.now(),
      isImage: false,
    };
  } catch (error) {
    console.error("Gemini API Error:", error?.message || error);
    return {
      role: "assistant",
      content: "Something went wrong with Gemini API.",
      timestamp: Date.now(),
      isImage: false,
    };
  }
};

// ---------------- TEXT CHAT CONTROLLER ----------------
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    if (!chatId || !prompt) {
      return res.status(400).json({
        success: false,
        message: "chatId and prompt are required",
      });
    }

    // Validate ObjectIds
    const chatObjectId = mongoose.Types.ObjectId.isValid(chatId)
      ? new mongoose.Types.ObjectId(chatId)
      : null;
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    if (!chatObjectId || !userObjectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid chatId or userId",
      });
    }

    // Check credits
    if (req.user.credits < 1) {
      return res.status(403).json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const chat = await Chat.findOne({ _id: chatObjectId, userId: userObjectId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Call Gemini
    const reply = await askGemini(prompt);

    // Push AI reply
    chat.messages.push(reply);
    await chat.save();

    // Deduct credits
    await User.updateOne({ _id: userObjectId }, { $inc: { credits: -1 } });

    res.json({ success: true, reply });
  } catch (error) {
    console.error("textMessageController error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- IMAGE CHAT CONTROLLER ----------------
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, chatId, isPublished } = req.body;

    if (!chatId || !prompt) {
      return res.status(400).json({
        success: false,
        message: "chatId and prompt are required",
      });
    }

    const chatObjectId = mongoose.Types.ObjectId.isValid(chatId)
      ? new mongoose.Types.ObjectId(chatId)
      : null;
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    if (!chatObjectId || !userObjectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid chatId or userId",
      });
    }

    // Check credits
    if (req.user.credits < 2) {
      return res.status(403).json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const chat = await Chat.findOne({ _id: chatObjectId, userId: userObjectId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Encode prompt
    const encodedPrompt = encodeURIComponent(prompt);

    // Construct ImageKit AI generation URI
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    console.log("Generated Image URL:", generatedImageUrl);

    // Trigger generation
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary"
    ).toString("base64")}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished: isPublished || false,
    };

    // Push AI reply
    chat.messages.push(reply);
    await chat.save();

    // Deduct credits
    await User.updateOne({ _id: userObjectId }, { $inc: { credits: -2 } });

    res.json({ success: true, reply });
  } catch (error) {
    console.error("imageMessageController error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
