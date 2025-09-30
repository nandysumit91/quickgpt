import Chat from "../models/Chat.js";

// ---------------- CREATE CHAT ----------------
export const createChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const chatData = {
      userId,
      userName: req.user.name || "Unknown User",
      name: "New Chat",
      messages: [], // ✅ explicitly empty array
    };

    const newChat = await Chat.create(chatData);

    return res.json({ success: true, chatId: newChat._id, chat: newChat });
  } catch (error) {
    console.error("createChat error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET ALL CHATS ----------------
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    return res.json({ success: true, chats });
  } catch (error) {
    console.error("getChats error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- DELETE CHAT ----------------
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.body;

    const deleted = await Chat.deleteOne({ _id: chatId, userId });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    return res.json({ success: true, message: "Chat Deleted" });
  } catch (error) {
    console.error("deleteChat error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- ADD MESSAGE ----------------
export const addMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, role, content, isImage = false, isPublished = false } = req.body;

    if (!chatId || !role || !content) {
      return res.status(400).json({ success: false, message: "chatId, role & content required" });
    }

    const newMessage = {
      isImage,
      isPublished,
      role,
      content,
      timestamp: new Date(),
    };

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { $push: { messages: newMessage } },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    return res.json({ success: true, chat: updatedChat });
  } catch (error) {
    console.error("addMessage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
