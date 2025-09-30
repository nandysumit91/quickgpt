import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  isImage: { type: Boolean, required: true, default: false },
  isPublished: { type: Boolean, default: false },
  role: { type: String, required: true }, // "user" | "assistant"
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    name: { type: String, required: true, default: "New Chat" },
    messages: { type: [messageSchema], default: [] }, // ✅ Ensure default array
  },
  { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);
