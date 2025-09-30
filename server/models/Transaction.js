import { Type } from "@google/genai";
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", reuired: true},
    planId: {type: String, reuired: true },
    amount: {type: Number, reuired: true },
   credits: {type: Number, reuired: true },
  isPaid: {type: Boolean, default: false },
}, {timestamps: true})

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;